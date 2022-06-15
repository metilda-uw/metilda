import "./Collections.css";

import React, { useContext } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";

import FirebaseContext from "../Firebase/context";

import Header from "../components/header/Header";
import AnalysisList from "../components/AnalysisList";

export default function Collections() {
  const firebase = useContext(FirebaseContext);
  const timestamp = firebase.timestamp;
  const [analysis, loading, error] = useCollectionData(
    firebase.firestore.collection("analysis"),
    {
      idField: "id",
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  return (
    <>
      <Header />
      <div className="page-collections">
        {error && <p className="error">{error}</p>}
        {loading && <p className="loading">Loading...</p>}
        {analysis && <AnalysisList analysis={analysis} />}
      </div>
    </>
  );
}
