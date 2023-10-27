import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import './WordCard.scss';

import FirebaseContext from "../../Firebase/context";


export default function WordCard(props) {
  const word = props.word;
  const selectedCollectionUuid = props.selectedCollectionUuid;
  let firebase = useContext(FirebaseContext);
  firebase = firebase != null ? firebase : props.fb; 
  const timestamp = firebase.timestamp;
  const [url, setURL] = useState("");

  useEffect(() => {
    const storageRef = firebase.storage.ref(
      "thumbnails/" + selectedCollectionUuid + "/" + word.id
    );
    storageRef.getDownloadURL().then((url) => {
      setURL(url);
    }).catch((error) => {
      //Do Nothing
    });
  });

  return (
    <div className={props.classArgument != undefined ? props.classArgument + " col s6 m3" :"col s6 m3"}>
      <div className="card">
        <span className="card-title">{word["data"].word}</span>
        <div className="card-image">
          <img src={url} alt="word thumbnail" />
        </div>
        <div className="card-content">
          {word["data"].speakerName && (
            <p>Speaker: {word["data"].speakerName}</p>
          )}
          {word["data"].wordTranslation && (
            <p>Translation: {word["data"].wordTranslation}</p>
          )}
          {word["data"].letters && (
            <p>Syllables: {word["data"].letters.length}</p>
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

WordCard.propTypes = {
  word: PropTypes.object,
  selectedCollectionUuid: PropTypes.string,
  key: PropTypes.string,
  fb:PropTypes.object,
  classArgument:PropTypes.string
};
