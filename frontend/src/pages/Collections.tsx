import "./Collections.css";

import React, { useContext } from "react";
import { useCollection } from "../hooks/useCollection";

import Header from "../components/header/Header";
import AnalysisList from "../components/AnalysisList";

export default function Collections() {
  const { documents: analysis, error } = useCollection("analysis");

  return (
    <>
      <Header />
      <div className="page-collections">
        {error && <p className="error">{error}</p>}
        {analysis && <AnalysisList analysis={analysis} />}
      </div>
    </>
  );
}
