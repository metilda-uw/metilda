import React, { useContext, useState } from "react";
import FirebaseContext from "../../Firebase/context";

import AnalysisList from "./AnalysisList";
import CollectionsFilter from "./CollectionsFilter";

import { useCollectionData } from "react-firebase-hooks/firestore";

export default function CollectionsView(collection) {
  const firebase = useContext(FirebaseContext);
  const [analysis, loading, error] = useCollectionData(
    firebase.firestore.collection("analysis"),
    {
      idField: "id",
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );
  const [filter, setFilter] = useState("all");

  const changeFilter = (newFilter) => {
    setFilter(newFilter);
  };

  const visibleAnalysis = analysis
    ? analysis.filter((word) => {
        switch (filter) {
          case "all":
            return true;
          case "two syllables":
            return word[0].letters.length === 2;
          case "three syllables":
            return word[0].letters.length === 3;
          case "four syllables":
            return word[0].letters.length === 4;
          case "over four syllables":
            return word[0].letters.length > 4;
          case "Earl Old Person":
            return word[0].speakerName === "Earl Old Person";
          default:
            return true;
        }
      })
    : null;

  return (
    <div className="page-collections-view">
      {/* View of Collection w/ filtering capability */}

      {/* Show a list of Collections */}
      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Loading...</p>}
      {visibleAnalysis && <CollectionsFilter changeFilter={changeFilter} />}

      {visibleAnalysis && <AnalysisList analysis={visibleAnalysis} />}
    </div>
  );
}
