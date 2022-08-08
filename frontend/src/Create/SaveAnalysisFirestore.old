import React from "react";
import { useFirestore } from "../hooks/useFirestore";
import { useStorage } from "../hooks/useStorage";
import { useHistory } from "react-router-dom";

export default function SaveAnalysisFirestore({ analysis, saveThumbnail }) {
  const history = useHistory();
  const { addDocument, response } = useFirestore("analysis");
  const { addFile } = useStorage();

  const handleClick = async (e) => {
    const docId = await addDocument(analysis);
    if (!response.error) {
      console.log("Added document", analysis);
    }

    saveThumbnail(docId);
  };

  return (
    <div>
      <button
        className="waves-effect waves-light btn globalbtn metilda-pitch-art-btn"
        type="submit"
        name="action"
        onClick={handleClick}
      >
        Save to Collections
      </button>
    </div>
  );
}
