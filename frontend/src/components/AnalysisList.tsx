import React from "react";

export default function AnalysisList({ analysis }) {
  return (
    <div className="row">
      {analysis.map((analysis) => (
        <div className="col s6 m3" key={analysis.id}>
          <div className="card">
            <div className="card-image">
              {/* <img src="images/sample-1.jpg"> */}
              <span className="card-title">{analysis.uploadid}</span>
            </div>
            <div className="card-content">
              {analysis.letters && (
                <p>There are {analysis.letters.length} letters in this word.</p>
              )}
            </div>
            <div className="card-action">
              <a href="#">This is a link</a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
