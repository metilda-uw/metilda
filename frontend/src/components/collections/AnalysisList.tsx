import React from "react";
import { Link } from "react-router-dom";

import AnalysisCard from "./AnalysisCard";

export default function AnalysisList({ analysis }) {
  return (
    <div className="row">
      {analysis.map((analysis) => (
        <Link to={`/collections/${analysis.id}`} key={analysis.id}>
          <AnalysisCard analysis={analysis} key={analysis.id}></AnalysisCard>
        </Link>
      ))}
    </div>
  );
}
