import React, { useContext, useEffect, useState } from "react";
import FirebaseContext from "../../Firebase/context";
import { useStorage } from "../../hooks/useStorage";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import { useFirestore } from "../../hooks/useFirestore";

export default function SaveAnalysisFirestore({ analysis, saveThumbnail }) {
  const firebase = useContext(FirebaseContext);
  const history = useHistory();

  const { addFile } = useStorage();

  const [availableCollections, setAvailableCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("analysis");

  // Populate collections drop down
  // useEffect calls the collections api to get a list of the collections we know about
  useEffect(() => {
    fetch(`api/collections`, {
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

  // use analysis prop - contains an array of each speaker.
  // map over array and save each speakers word to the selected firestore collection
  const handleClick = async (event: any) => {
    event.preventDefault();
    analysis.map((word) => {
      firebase.firestore
        .collection(selectedCollection)
        .add(word)
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          saveThumbnail(docRef.id);
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    });
  };

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
          value: col[1],
          label: col[1],
        },
      ];
    });
    return result;
  };

  return (
    <div>
      <form className="form-collections-view-delete">
        <Select
          className="collections-dropdown"
          placeholder={selectedCollection}
          value={"Select a collection"}
          options={getCollectionOptions()}
          onChange={collectionSelectOnChange}
          //styles={colourStyles}
        />
        <button
          className="waves-effect waves-light btn globalbtn metilda-pitch-art-btn"
          type="submit"
          name="action"
          onClick={handleClick}
        >
          Save to Collections
        </button>
      </form>
    </div>
  );
}
