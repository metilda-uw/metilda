import "./LangIdUpload.scss";

import React, { useState } from "react";
import Header from "../Components/header/Header";

interface LangIdCounts {
  en?: number;
  review?: number;
  other?: number;
  total?: number;
}

interface LangIdResponse {
  filename: string;
  eaf: string;
  textgrid: string;
  counts: LangIdCounts;
}

// Phase 1 language-ID upload page. Posts a short audio file to the offline pipeline
// (POST /api/langid/upload) and hands back a 3-tier ELAN .eaf (+ raw Praat .TextGrid)
// as a browser download. Nothing is persisted server-side - see controllers/langid.py.
const LangIdUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<LangIdResponse | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setResult(null);
    setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null);
  };

  const onAnalyze = async () => {
    if (!file) {
      setError("Please choose an audio file first.");
      return;
    }
    setError("");
    setResult(null);
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/langid/upload", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data && data.error ? data.error : "Processing failed.");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const download = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const textgridName = (eafName: string) => eafName.replace(/\.eaf$/i, ".TextGrid");

  return (
    <div>
      <Header />
      <div className="langid-container">
        <h1 className="langid-title">Language ID - Auto-annotate Audio</h1>
        <p className="langid-desc">
          Upload a short bilingual audio clip (about two minutes or less for now). The
          tool detects English vs. Indigenous speech, transcribes the English side, and
          returns annotation files for ELAN (.eaf) and Praat (.TextGrid), each with three
          tiers: <strong>English</strong>
          {" "}(transcribed), <strong>Indigenous</strong> (segmented and ready to
          annotate), and <strong>Review</strong> (uncertain segments flagged for a
          linguist). Longer recordings will be supported in the next phase. All processing
          runs offline on the server; the audio is not stored.
        </p>

        <div className="langid-controls">
          <label className="langid-file-label" htmlFor="langid-file-input">
            Choose audio file (.wav, .mp3, .flac, .m4a)
          </label>
          <input
            id="langid-file-input"
            type="file"
            accept=".wav,.mp3,.mpeg,.flac,.m4a,audio/*"
            onChange={onFileChange}
            aria-label="Choose an audio file to analyze"
            disabled={isProcessing}
          />
          {file && <span className="langid-filename">{file.name}</span>}

          <button
            className="waves-effect waves-light btn globalbtn langid-analyze-btn"
            onClick={onAnalyze}
            disabled={!file || isProcessing}
            aria-label="Upload and analyze audio"
          >
            {isProcessing ? "Processing..." : "Analyze"}
          </button>
        </div>

        {isProcessing && (
          <p className="langid-status" role="status">
            Analyzing audio - this can take a minute even for short clips. Please wait...
          </p>
        )}

        {error && (
          <p className="langid-error" role="alert">
            {error}
          </p>
        )}

        {result && (
          <div className="langid-result">
            <h2 className="langid-result-title">Done - {result.filename}</h2>
            <ul className="langid-counts">
              <li>
                <strong>{result.counts.en || 0}</strong> English segments (transcribed)
              </li>
              <li>
                <strong>{result.counts.review || 0}</strong> flagged for Review
              </li>
              <li>
                <strong>{result.counts.other || 0}</strong> Indigenous segments (ready to annotate)
              </li>
            </ul>
            <div className="langid-downloads">
              <button
                className="waves-effect waves-light btn globalbtn"
                onClick={() => download(result.eaf, result.filename, "application/xml")}
                aria-label="Download ELAN EAF file"
              >
                Download .eaf (ELAN)
              </button>
              <button
                className="waves-effect waves-light btn globalbtn"
                onClick={() =>
                  download(result.textgrid, textgridName(result.filename), "text/plain")
                }
                aria-label="Download Praat TextGrid file"
              >
                Download .TextGrid (Praat)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LangIdUpload;
