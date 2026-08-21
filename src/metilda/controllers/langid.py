"""controllers/langid.py - POST /api/langid/upload.

Isolated controller for the offline language-ID feature (kept out of the 1100-line
pitch_art_wizard.py so it is easy to review and revert). It receives an uploaded
audio file, runs the standalone metilda-langid pipeline via services.langid (a
subprocess bridge to the Python-3.11 pipeline), and returns a 3-tier ELAN EAF plus
the raw Praat TextGrid as JSON.

Phase 1 is SYNC and short-audio only (Heroku's router kills requests > 30s; long
audio is the Phase-2 async path). Nothing is persisted to Firebase/Postgres here -
the EAF is handed straight back to the caller, which is also the CARE/OCAP-safe
default: no Aaniiih-derived output is written to any cloud store.
"""
import os
import shutil
import tempfile

from flask import jsonify, request
from werkzeug.utils import secure_filename

from metilda import app
from metilda.services import langid as langid_service

_ALLOWED_EXTENSIONS = {"wav", "mp3", "mpeg", "flac", "m4a"}


def _allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in _ALLOWED_EXTENSIONS


@app.route("/api/langid/upload", methods=["POST"])
def langid_upload():
    """Run offline langid on an uploaded audio file; return {filename, eaf, textgrid, counts}."""
    if "file" not in request.files:
        return jsonify({"error": "no file provided (form field 'file')"}), 400
    upload = request.files["file"]
    if not upload.filename:
        return jsonify({"error": "empty filename"}), 400
    if not _allowed(upload.filename):
        return jsonify({
            "error": "unsupported file type; allowed: {}".format(
                ", ".join(sorted(_ALLOWED_EXTENSIONS))
            )
        }), 400

    # Save into a scratch dir under a fixed name (never the user's raw filename → no
    # path-traversal), preserving the extension so the pipeline decodes the right format.
    ext = upload.filename.rsplit(".", 1)[1].lower()
    tmp = tempfile.mkdtemp(prefix="metilda_langid_upload_")
    audio_path = os.path.join(tmp, "input." + ext)
    try:
        upload.save(audio_path)

        try:
            result = langid_service.run_langid(audio_path)
        except FileNotFoundError as exc:          # audio unreadable/missing
            return jsonify({"error": str(exc)}), 400
        except RuntimeError as exc:                # pipeline failure/timeout/misconfig
            return jsonify({"error": str(exc)}), 500

        eaf_xml = langid_service.eaf_to_xml(result.eaf)
        base = os.path.splitext(secure_filename(upload.filename))[0] or "langid_output"
        return jsonify({
            "filename": base + ".eaf",
            "eaf": eaf_xml,
            "textgrid": result.textgrid,
            "counts": result.counts,
        }), 200
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
