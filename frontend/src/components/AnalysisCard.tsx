import React, { useContext, useEffect, useState } from "react";
import FirebaseContext from "../Firebase/context";

export default function AnalysisCard({ analysis }) {
  const firebase = useContext(FirebaseContext);
  const [url, setURL] = useState("");

  useEffect(() => {
    const storageRef = firebase.storage.ref("thumbnails/" + analysis.id);
    storageRef.getDownloadURL().then((url) => {
      setURL(url);
    });
  });

  console.log(analysis);
  return (
    <div className="col s6 m3">
      <div className="card">
        <span className="card-title">{analysis[0].uploadId}</span>
        <div className="card-image">
          <img src={url} alt="word thumbnail" />
        </div>
        <div className="card-content">
          {analysis[0].letters && (
            <p>There are {analysis[0].letters.length} letters in this word.</p>
          )}
        </div>
        <div className="card-action">
          <a href="#">This is a link</a>
        </div>
      </div>
    </div>
  );
}
