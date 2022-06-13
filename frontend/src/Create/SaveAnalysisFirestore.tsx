import React from "react";
import { useFirestore } from "../hooks/useFirestore";
import { useStorage } from "../hooks/useStorage";
import { useHistory } from "react-router-dom";
import { TIMEOUT } from "dns";

export default function SaveAnalysisFirestore({ analysis, saveThumbnail }) {
  const history = useHistory();
  const { addDocument, response } = useFirestore("analysis");
  const { addFile } = useStorage();

  const handleClick = async (e) => {
    const docId = await addDocument(analysis);
    if (!response.error) {
      console.log("Added document", analysis);
    }
    //const documentId = response.document.id;
    // generate image file...
    //saveThumbnail(docId);
    //await addFile("../../public/images/PitchArt - 21-01.jpg");
  };

  return (
    <div>
      <button
        className="btn globalbtn waves-effect waves-light"
        type="submit"
        name="action"
        onClick={handleClick}
      >
        Save to Collections
      </button>
    </div>
  );
}
