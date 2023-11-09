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
    if(props.url !== undefined) {
      setURL(props.url);
      return;
    }
    const storageRef = firebase.storage.ref(
      "thumbnails/" + selectedCollectionUuid + "/" + word.id
    );
    storageRef.getDownloadURL().then((url) => {
      setURL(url);
    }).catch((error) => {
      //Do Nothing
    });
  });

  let createdAtDate;

  if(word["data"].createdAt){
    const { seconds, nanoseconds } = word["data"].createdAt;

  // Convert nanoseconds to milliseconds (1 second = 1,000,000,000 nanoseconds)
  const milliseconds = Math.floor(nanoseconds / 1e6);

  // Create a Date object using seconds and milliseconds
  createdAtDate = new Date(seconds * 1000 + milliseconds);
  }
  

  console.log("URl of word " , props.url);

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
          {createdAtDate && (
            <div className="created-date">
              Created: {createdAtDate.toDateString()}
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
  classArgument:PropTypes.string,
  url:PropTypes.string
};
