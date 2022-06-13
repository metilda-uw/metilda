import React from "react";
import AnalysisCard from "./AnalysisCard";

export default function AnalysisList({ analysis }) {
  return (
    <div className="row">
      {analysis.map((analysis) => (
        <AnalysisCard analysis={analysis} key={analysis.id}></AnalysisCard>
      ))}
    </div>
  );
}
