import "../../../Pages/Collections.css";

import React, { useContext, useEffect, useState } from "react";
import Select from "react-select";

import FirebaseContext from "../../../Firebase/context";

import BlockCollectionView from "./BlockCollectionView";

export default function CreatePitchArtBlock({ setPitchArt }) {
  const firebase = useContext(FirebaseContext);

  const [availableCollections, setAvailableCollections] = useState([
    [
      33,
      "1880f9eb-e274-4093-ac6b-8e7fa9a05a84",
      "default",
      " ",
      " ",
      "",
    ],
  ]);

  const [selectedCollection, setSelectedCollection] = useState("default");
  const [selectedCollectionUuid, setSelectedCollectionUuid] = useState("1880f9eb-e274-4093-ac6b-8e7fa9a05a84");
  const [words, setWords] = useState([]);
  const [update, setUpdate] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // call the collections api to get a list of collections
  // occurs on first render & when collectionsUpdated is changed
  useEffect(() => {
    fetch(`/api/collections`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          console.log(res);
          return res.json();
        }

        throw new Error("Error: Unable to get the list of collections.");
      })
      .then((data) => setAvailableCollections(data.result))
      .catch((error) => {
        setIsError(true);
        setError(error.message);
        console.log(error);
      });
  }, []);

  // query firestore for documents when the activeCollection is changed
  useEffect(() => {
    // check whether the list has changed with update === true
    if (Object.keys(words).length && !update) {
      return;
    }
    // console.log(
    //   "Active Collection Changed: " +
    //     selectedCollection +
    //     " " +
    //     availableCollections
    //   //getCollectionUuidFromName(selectedCollection)
    // );
    firebase.firestore
      .collection(getCollectionUuidFromName(selectedCollection))
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          setWords([]);
        } else {
          querySnapshot.forEach((doc) => {
            //  creates an array of words in the collection
            const wordsInCollection = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              data: doc.data(),
            }));
            setWords(wordsInCollection);
          });
        }
        setUpdate(false);
      })
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  }, [update]);

  // Create the list of options for the collection select element
  const getCollectionOptions = () => {
    let result = [];
    availableCollections.map((col) => {
      result = [
        ...result,
        {
          id: col[0],
          value: col[2],
          label: col[2],
        },
      ];
    });
    return result;
  };

  // *** Event Handlers ***
  // sets state for the currently selected option...changing this causes
  // the CollectionView component to re-render
  const handleViewCollection = (event: any) => {
    event.preventDefault();
    //console.log("Calling handleViewCollection");
    setSelectedCollection(selectedCollection);
    setUpdate(true);

    setSelectedCollectionUuid(
      getCollectionUuidFromName(selectedCollection).toString()
    );
  };


  // onChange methods for two way binding.
  const onCollectionSelectChange = (event: any) => {
    setSelectedCollection(event.value);
    setSelectedCollectionUuid(getCollectionUuidFromName(event.value).toString());
    //handleViewCollection(event);
  };

  // *** Helper Functions ***
  const getCollectionIdFromName = (name: string) => {
    let result = availableCollections.filter(
      (collection) => collection[2] === name
    );
    return result[0][0];
  };

  const getCollectionUuidFromName = (name: string) => {
    //console.log("Find: " + name + "in" + availableCollections);
    let result = availableCollections.filter(
      (collection) => collection[2] === name
    );
    //console.log(result);
    return result[0][1];
  };

  return (
    <div className="page-collections">
      <div className="page-collections-manage">
        <div className="page-collections-select">
          <p>Select a collection:</p>
          {isError && <p>{error}</p>}
          <form className="form-collections-view-delete">
            <Select
              className="collections-dropdown"
              placeholder={selectedCollection}
              value={"Select a collection"}
              options={getCollectionOptions()}
              onChange={onCollectionSelectChange}
            />
            <button
              onClick={handleViewCollection}
              className="collections-delete-view btn waves-light globalbtn"
            >
              View Collection
            </button>
          </form>
        </div>
      </div>

      {/* View of Collection w/ filtering capability */}
      <div className="page-collections-view">
        {words && (
          <BlockCollectionView
            words={words}
            selectedCollection={selectedCollection}
            selectedCollectionUuid={selectedCollectionUuid}
            setPitchArt={setPitchArt}
          />
        )}

        {isLoading && <p>Loading collection...</p>}
      </div>
    </div>
  );
}
