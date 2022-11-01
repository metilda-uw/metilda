import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { useHistory } from "react-router-dom";
import Select from "react-select";
import { NotificationManager } from "react-notifications";

import FirebaseContext from "../../Firebase/context";

export default function SaveAnalysisFirestore({ analysis, saveThumbnail }) {
  const firebase = useContext(FirebaseContext);
  const timestamp = firebase.timestamp;

  const history = useHistory();

  const [availableCollections, setAvailableCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("default");

  // Populate collections drop down
  // useEffect calls the collections api to get a list of the collections we know about
  useEffect(() => {
    fetch(`/api/collections`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setAvailableCollections(data.result))

      .catch((error) => {
        console.log(error);
      });
  }, []);

  const collectionSelectOnChange = (event) => {
    setSelectedCollection(event.value);
  };

  // Create the list of options for the collection select
  const getCollectionOptions = () => {
    let result = [];
    availableCollections.map((col) => {
      result = [
        ...result,
        {
          value: col[2],
          label: col[2],
        },
      ];
    });
    return result;
  };

  const getCollectionUuidFromName = (name: string) => {
    let result = availableCollections.filter(
      (collection) => collection[2] === name
    );
    return result[0][1];
  };

  // use analysis prop - contains an array of each speaker.
  // map over array and save each speakers word to the selected firestore collection
  const handleSaveToCollections = async (event: any) => {
    event.preventDefault();
    const collectionUuid = getCollectionUuidFromName(selectedCollection);

    analysis.map((word) => {
      firebase.firestore
        .collection(collectionUuid)
        .add({ ...word, createdAt: timestamp.fromDate(new Date()) })
        .then((docRef) => {
          //console.log("Document written with ID: ", docRef.id);
          saveThumbnail(collectionUuid + "/" + docRef.id);
          NotificationManager.success(
            "Pitch Art added to collection successfully!"
          );
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
          NotificationManager.error("Renaming collection failed!");
        });
    });
  };

  return (
    <div className="page-create-save-collections">
      <form className="page-create-save-collections-form">
        <Select
          id="collections-dropdown"
          placeholder={selectedCollection}
          value={"Select a collection"}
          options={getCollectionOptions()}
          onChange={collectionSelectOnChange}
          menuPlacement="auto"
          //styles={colourStyles}
        />
        <button
          className="waves-effect waves-light btn globalbtn metilda-pitch-art-btn"
          type="submit"
          name="action"
          onClick={handleSaveToCollections}
        >
          Save to Collections
        </button>
      </form>
    </div>
  );
}

SaveAnalysisFirestore.propTypes = {
  analysis: PropTypes.array,
  saveThumbnail: PropTypes.func,
};
