import React, { useContext } from "react";

import { useDocumentData } from "react-firebase-hooks/firestore";
import { useParams } from "react-router-dom";

import Header from "../header/Header";
import FirebaseContext from "../../Firebase/context";

// Currently this component just displays the data for the word object
// TODO: From the WordCard go to either the create or learn page.
export default function Word() {
  //TODO: Why id not working
  const { id } = useParams();
  const firebase = useContext(FirebaseContext);

  const [word, loading, error] = useDocumentData(
    firebase.firestore.doc("blackfoot/" + id),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  return (
    <div>
      <Header />
      {error && <strong>Error: {JSON.stringify(error)}</strong>}
      {loading && <span>Document: Loading...</span>}
      {word && (
        <div className="page-word">
          {console.log(word)}
          <div>{word["uploadId"]}</div>
          <span>Document: {JSON.stringify(word)}</span>
        </div>
      )}
    </div>
  );
}
