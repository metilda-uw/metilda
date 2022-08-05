import React, { useContext, useEffect, useState } from "react";
import FirebaseContext from "../../Firebase/context";

export default function WordCard({ analysis }) {
  const firebase = useContext(FirebaseContext);
  const timestamp = firebase.timestamp;
  const [url, setURL] = useState("");

  useEffect(() => {
    const storageRef = firebase.storage.ref("thumbnails/" + analysis.id);
    storageRef.getDownloadURL().then((url) => {
      setURL(url);
    });
  });

  return (
    <div className="col s6 m3">
      <div className="card">
        {/* 0 is the speaker index */}
        <span className="card-title">{analysis["uploadId"]}</span>
        <div className="card-image">
          <img src={url} alt="word thumbnail" />
        </div>
        <div className="card-content">
          {analysis["letters"] && (
            <p>
              There are {analysis["letters"].letters.length} letters in this
              word.
            </p>
          )}
          {/* <div className="created-date">
            Created: {analysis["createdAt"].toDate().toDateString()}
          </div> */}
        </div>
      </div>
    </div>
  );
}
