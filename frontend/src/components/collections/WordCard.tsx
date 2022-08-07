import React, { useContext, useEffect, useState } from "react";
import FirebaseContext from "../../Firebase/context";

export default function WordCard({ word, selectedCollection }) {
  const firebase = useContext(FirebaseContext);
  const timestamp = firebase.timestamp;
  const [url, setURL] = useState("");

  useEffect(() => {
    const storageRef = firebase.storage.ref(
      "thumbnails/" + selectedCollection + "/" + word.id
    );
    storageRef.getDownloadURL().then((url) => {
      setURL(url);
    });
  });

  return (
    <div className="col s6 m3">
      <div className="card">
        <span className="card-title">{word["data"].uploadId}</span>
        <div className="card-image">
          <img src={url} alt="word thumbnail" />
        </div>
        <div className="card-content">
          {word["data"].speakerName && (
            <p>Speaker: {word["data"].speakerName}</p>
          )}
          {word["data"].letters && (
            <p>There are {word["data"].letters.length} letters in this word.</p>
          )}
          {word["data"].createdAt && (
            <div className="created-date">
              Created: {word["data"].createdAt.toDate().toDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
