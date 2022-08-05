import "./Collections.css";

import React, { useContext, useEffect, useState } from "react";
import Select from "react-select";
import { NotificationManager } from "react-notifications";

import FirebaseContext from "../Firebase/context";

import Header from "../components/header/Header";
import CollectionView from "../components/collections/CollectionView";

export default function Collections() {
  const firebase = useContext(FirebaseContext);

  const [availableCollections, setAvailableCollections] = useState([]);
  const [createCollectionName, setCreateCollectionName] = useState("");
  // used to keep track of whether new collections have been added
  const [collectionsUpdated, setCollectionsUpdated] = useState(0);

  const [selectedCollection, setSelectedCollection] = useState("default");
  const [words, setWords] = useState({});
  const [update, setUpdate] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

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
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.log(error);
      });
  }, [collectionsUpdated]);

  // query firestore for documents when the activeCollection is changed
  useEffect(() => {
    console.log(
      "CollectionsView - useEffect - query firestore for: " + selectedCollection
    );
    if (Object.keys(words).length && !update) {
      return;
    }
    firebase.firestore
      .collection(selectedCollection)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          // The following line will result in an array of objects (each object is your document data)
          // doc.id and doc.data()
          const wordsInCollection = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            analysis: doc.data()["0"],
          }));
          setWords(wordsInCollection);
        });
        setUpdate(false);
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  }, [update, selectedCollection]);

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

  // Create a collection
  // onSubmit for the create collection
  const onSubmit = async (event: any) => {
    event.preventDefault();
    console.log("Create New Collection");
    const formData = new FormData();
    formData.append("collection_name", createCollectionName);
    const response = await fetch(`/api/collections`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });
    const body = await response.json();
    console.log(body.result);
    setCreateCollectionName("");
    setCollectionsUpdated(collectionsUpdated + 1);
    //Notificaiton that Collection was created.
    //TODO: ADD error handling
    NotificationManager.success("Added collection successfully!");
  };

  // two way binding for new collection
  // onChange for the create collection form
  const onChange = (event) => {
    setCreateCollectionName(event.target.value);
  };

  // sets state for the currently selected option...changing this causes
  // CollectionView to re-render
  const handleCollectionChange = (option: any) => {
    setSelectedCollection(option.value);
    setUpdate(true);
  };

  return (
    <>
      <Header />
      <div className="page-collections">
        {/* Form to create collection */}
        <form onSubmit={onSubmit} className="collections-create">
          <span className="collections-create-describe">
            Enter a new collection name:
          </span>
          <input
            className="collections-create-name"
            name="Collection Name"
            value={createCollectionName}
            onChange={onChange}
            type="text"
            placeholder="Collection Name"
            required
          />
          <button
            type="submit"
            className="collections-create-submit btn waves-light globalbtn"
          >
            Create
          </button>
        </form>
        {/* Select the Collection to View */}
        <Select
          className="collections-dropdown"
          placeholder="Collection"
          value="Select a collection"
          options={getCollectionOptions()}
          //styles={colourStyles}
          onChange={handleCollectionChange}
        />
        {/* View of Collection w/ filtering capability */}
        <CollectionView words={words} />
      </div>
    </>
  );
}
