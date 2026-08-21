"""services/langid.py - subprocess bridge to the standalone metilda-langid pipeline.

The MeTILDA backend runs Python 3.8 and cannot import the langid pipeline directly
(it requires Python 3.11). This mirrors the subprocess pattern in services/praat.py,
with deliberate improvements:

  1. The metilda-langid tool WRITES a .TextGrid file (and a .json sidecar) to its ``-o``
     stem; stdout is human-readable progress, NOT data. So we read the OUTPUT FILES,
     never parse stdout.
  2. We add a timeout, explicit error handling, and exception-safe temp-dir cleanup
     (try/finally) - praat.py has none of these; this service is meant to be robust.
  3. The EAF is built from the JSON sidecar, NOT via pympi's ``TextGrid.to_eaf()``.
     ``to_eaf()`` DROPS every empty interval, which would erase the Indigenous tier's
     pre-segmentation (the blank, ready-to-annotate intervals - the core value for the
     linguist). Building from the sidecar gives one annotation per detected segment on
     the correct tier, and marks each detected Aaniiih interval with a ``[Aaniiih]``
     placeholder so the boundaries survive in ELAN and read as "transcribe here".

CARE/OCAP:
  * Audio is processed in a temp dir that is ALWAYS removed; nothing is persisted to any
    cloud store by this service.
  * The default langid method is 'whisper' - the cloud-safe path. The Taylor-trained
    classifier ('clf') is a RESTRICTED artifact (community data under OCAP); it is
    available for LOCAL use only via env vars and must NOT be deployed to Heroku/cloud
    without written clearance from Prof. Chen AND Sean Chandler (ANC).
"""
import collections
import json
import os
import shutil
import subprocess
import tempfile

# The pipeline lives in its own Python 3.11 venv, separate from this 3.8 backend
# (repo: metilda-langid). It is NOT importable here - it is run as a subprocess.
# Locate its console script by, in order:
#   1. the METILDA_LANGID_BIN env var (explicit path - how deployments set it), then
#   2. `metilda-langid` on PATH (if pip/uv-installed into the active environment).
# There is deliberately NO machine-specific fallback path: a missing binary raises a
# clear setup error (see run_langid) instead of silently pointing at one dev's home dir.
def _resolve_langid_bin():
    explicit = os.environ.get("METILDA_LANGID_BIN")
    if explicit:
        return explicit
    return shutil.which("metilda-langid")

# Cloud-safe default. Set METILDA_LANGID_METHOD=clf ONLY for local runs (RESTRICTED).
LANGID_METHOD = os.environ.get("METILDA_LANGID_METHOD", "whisper")
# Path to the restricted classifier head (.pt); required only when method == "clf".
LANGID_CLF_MODEL = os.environ.get("METILDA_LANGID_CLF_MODEL")

# Sync route is for SHORT audio only (Heroku's router kills requests > 30s; long audio
# is the Phase-2 async path). This caps a hung pipeline from blocking a worker forever.
_TIMEOUT_SEC = int(os.environ.get("METILDA_LANGID_TIMEOUT_SEC", "300"))

# Tier names the pipeline emits (must match src/metilda_langid/textgrid_io.py).
_TIER_ENGLISH = "English"
_TIER_INDIGENOUS = "Indigenous"
_TIER_REVIEW = "Review"
# Placeholder written into each detected-Aaniiih interval so the segmentation survives
# the EAF (ELAN drops empty annotations) and doubles as a "transcribe here" marker.
_INDIGENOUS_PLACEHOLDER = "[Aaniiih]"

# What run_langid returns: the in-memory EAF, the raw TextGrid text (for Praat users),
# and the pipeline's per-tier counts (for the response payload / logging).
LangidResult = collections.namedtuple("LangidResult", ["eaf", "textgrid", "counts"])


def run_langid(audio_path, en_confidence=None):
    """Run the offline langid pipeline on a local audio file.

    Args:
        audio_path: path to a local audio file (WAV/FLAC/MP3).
        en_confidence: optional override for the English-tier confidence threshold.
            When None, the pipeline uses its own method-aware default.

    Returns:
        LangidResult(eaf, textgrid, counts) - ``eaf`` is a pympi.Elan.Eaf, ``textgrid``
        is the raw .TextGrid text, ``counts`` is a dict like {"en":.., "review":.., ..}.

    Raises:
        FileNotFoundError: audio file missing.
        RuntimeError: pipeline binary missing, non-zero exit, timeout, or no output.
    """
    if not os.path.isfile(audio_path):
        raise FileNotFoundError("audio not found: {}".format(audio_path))

    bin_path = _resolve_langid_bin()
    if not bin_path:
        raise RuntimeError(
            "metilda-langid pipeline not found. Set METILDA_LANGID_BIN to the pipeline's "
            "console script (e.g. /path/to/metilda-langid/.venv/bin/metilda-langid) or "
            "install it on PATH. See the metilda-langid repo README for setup."
        )

    tmp = tempfile.mkdtemp(prefix="metilda_langid_")
    out_tg = os.path.join(tmp, "out.TextGrid")
    out_json = os.path.join(tmp, "out.json")  # sidecar the pipeline writes alongside
    try:
        cmd = [bin_path, audio_path, "-o", out_tg, "--langid-method", LANGID_METHOD]
        if LANGID_METHOD == "clf":
            if not LANGID_CLF_MODEL:
                raise RuntimeError(
                    "METILDA_LANGID_METHOD=clf requires METILDA_LANGID_CLF_MODEL "
                    "(RESTRICTED, local-only artifact)"
                )
            cmd += ["--clf-model", LANGID_CLF_MODEL]
        if en_confidence is not None:
            cmd += ["--en-confidence", str(en_confidence)]

        try:
            proc = subprocess.run(
                cmd, capture_output=True, text=True, timeout=_TIMEOUT_SEC
            )
        except FileNotFoundError:
            raise RuntimeError(
                "langid pipeline binary not found: {} "
                "(set METILDA_LANGID_BIN)".format(bin_path)
            )
        except subprocess.TimeoutExpired:
            raise RuntimeError(
                "langid pipeline timed out after {}s - audio too long for the sync "
                "route (use the async path for long recordings)".format(_TIMEOUT_SEC)
            )

        if proc.returncode != 0:  # 0 = ok, 2 = audio not found (per the CLI contract)
            raise RuntimeError(
                "langid pipeline failed (exit {}): {}".format(
                    proc.returncode, (proc.stderr or "")[-500:]
                )
            )
        if not os.path.isfile(out_tg) or not os.path.isfile(out_json):
            raise RuntimeError("langid pipeline produced no output files")

        with open(out_json, "r") as fh:
            sidecar = json.load(fh)
        with open(out_tg, "r") as fh:
            textgrid_text = fh.read()

        eaf = _build_eaf(sidecar, media_filename=os.path.basename(audio_path))
        counts = sidecar.get("counts", {})
        return LangidResult(eaf=eaf, textgrid=textgrid_text, counts=counts)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def _build_eaf(sidecar, media_filename=None):
    """Build a 3-tier ELAN EAF from the pipeline's JSON sidecar.

    One annotation per detected segment, routed to its tier by ``status``:
      * "en"     -> English tier, text = transcript
      * "review" -> Review tier,  text = candidate transcript
      * "other"  -> Indigenous tier, text = "[Aaniiih]" placeholder (preserves the
                    boundary in ELAN and marks it for manual transcription)
    """
    from pympi.Elan import Eaf

    eaf = Eaf(author="metilda-langid")
    # pympi seeds a spurious empty 'default' tier on construction - drop it.
    if "default" in eaf.get_tier_names():
        eaf.remove_tier("default")

    if media_filename:
        eaf.add_linked_file(media_filename, mimetype="audio/x-wav")

    for tier in (_TIER_ENGLISH, _TIER_INDIGENOUS, _TIER_REVIEW):
        eaf.add_tier(tier)

    for seg in sidecar.get("segments", []):
        start_ms = int(round(float(seg["t0"]) * 1000))
        end_ms = int(round(float(seg["t1"]) * 1000))
        if end_ms <= start_ms:  # EAF requires positive-length annotations
            end_ms = start_ms + 1

        status = seg.get("status")
        if status == "en":
            eaf.add_annotation(_TIER_ENGLISH, start_ms, end_ms, seg.get("transcript", ""))
        elif status == "review":
            eaf.add_annotation(_TIER_REVIEW, start_ms, end_ms, seg.get("transcript", ""))
        else:  # "other" and anything unexpected -> Indigenous, marked for annotation
            eaf.add_annotation(_TIER_INDIGENOUS, start_ms, end_ms, _INDIGENOUS_PLACEHOLDER)

    return eaf


def eaf_to_xml(eaf):
    """Serialize a pympi Elan.Eaf to its ELAN .eaf XML string.

    pympi only writes to a path, so we round-trip through a temp file that is always
    removed (mirrors the existing /annotation route's to_file -> read -> cleanup idiom).
    """
    tmp = tempfile.mkdtemp(prefix="metilda_langid_eaf_")
    path = os.path.join(tmp, "out.eaf")
    try:
        eaf.to_file(path)
        with open(path, "r") as fh:
            return fh.read()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
