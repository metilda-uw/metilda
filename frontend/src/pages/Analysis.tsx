import React, { useContext } from "react";

import { useDocumentData } from "react-firebase-hooks/firestore";
import { useParams } from "react-router-dom";

import Header from "../components/header/Header";
import FirebaseContext from "../Firebase/context";

export default function Analysis() {
  const { id } = useParams();
  const firebase = useContext(FirebaseContext);

  const [analysis, loading, error] = useDocumentData(
    firebase.firestore.doc("analysis/" + id),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  return (
    <div>
      <Header />
      {error && <strong>Error: {JSON.stringify(error)}</strong>}
      {loading && <span>Document: Loading...</span>}
      {analysis && (
        <div className="analysis">
          {console.log(analysis)}
          <div>{analysis[0].uploadId}</div>
          <span>Document: {JSON.stringify(analysis)}</span>
        </div>
      )}
    </div>
  );
}
