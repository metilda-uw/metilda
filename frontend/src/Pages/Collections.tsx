import "./Collections.css";

import React, { useContext, useEffect, useState } from "react";
import Select from "react-select";
import { NotificationManager } from "react-notifications";

import FirebaseContext from "../Firebase/context";

import Header from "../Components/header/Header";
import CollectionView from "../Components/collections/CollectionView";

export default function Collections() {
  const firebase = useContext(FirebaseContext);

  const [availableCollections, setAvailableCollections] = useState([]);

  const [createCollectionName, setCreateCollectionName] = useState("");
  const [createCollectionDescription, setCreateCollectionDescription] =
    useState("");
  // keep track of whether new collections have been added, if collectionsUpdated
  // is true the list of availableCollections will be updated.
  const [collectionsUpdated, setCollectionsUpdated] = useState(0);

  const [selectedCollection, setSelectedCollection] = useState("default");

  const [words, setWords] = useState({});
  const [update, setUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Populate collections drop down
  // useEffect calls the collections api to get a list of collections
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
  }, [collectionsUpdated]);

  // query firestore for documents when the activeCollection is changed
  useEffect(() => {
    // check whether the list has changed with update === true
    if (Object.keys(words).length && !update) {
      return;
    }
    firebase.firestore
      .collection(selectedCollection)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          setWords({});
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
          value: col[1],
          label: col[1],
        },
      ];
    });
    return result;
  };

  // Create a collection
  const handleCreateCollection = async (event: any) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("collection_name", createCollectionName);
    formData.append("owner_id", firebase.auth.currentUser.email);
    formData.append("collection_description", createCollectionDescription);
    const response = await fetch(`/api/collections`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });
    const body = await response.json();
    console.log(response.body);
    setCreateCollectionName("");
    setCollectionsUpdated(collectionsUpdated + 1);

    if (response.status == 200) {
      NotificationManager.success("Added collection successfully!");
    } else {
      NotificationManager.error("Adding collection failed!");
    }
  };

  // sets state for the currently selected option...changing this causes
  // CollectionView to re-render
  // onChange={handleCollectionChange}
  const handleViewCollection = (event: any) => {
    event.preventDefault();
    setSelectedCollection(selectedCollection);
    setUpdate(true);
  };

  const handleDeleteColleciton = async (event: any) => {
    event.preventDefault();
    //TODO: Add Confirmation
    const formData = new FormData();
    formData.append("collection_name", selectedCollection);
    const response = await fetch(`/api/collections`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });
    const body = await response.json();

    //Add call to delete the collection from firestore
    //TODO: Check whether current logged in user is owner before deleting

    const result = firebase.firestore
      .collection(selectedCollection)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          //check if owner is the one deleting.
          //const uid = firebase.auth.currentUser.email;

          doc.ref.delete();
          console.log("deleted: " + doc.id + " from firestore.");

          // delete thumbnails - create a reference to the thumbnail then delete it
          const storageRef = firebase.uploadFile();
          let thumbnailRef = storageRef.child(
            "thumbnails/" + selectedCollection + "/" + doc.id
          );
          thumbnailRef
            .delete()
            .then(() => {
              console.log("Successfully deleted: " + doc.id);
            })
            .catch((error) => {
              console.log(
                "There was an error deleting " + doc.id + " from storage."
              );
            });
        });
      });

    setSelectedCollection("");
    setWords({});

    if (response.status == 200) {
      NotificationManager.success("Collection deleted successfully!");
      setSelectedCollection("");
      setCollectionsUpdated(collectionsUpdated + 1);
    } else {
      NotificationManager.error("Deleting collection failed!");
    }
  };

  // two way binding for new collection
  // onChange for the create collection form
  const onNameChange = (event) => {
    setCreateCollectionName(event.target.value);
  };

  const onDescriptionChange = (event) => {
    setCreateCollectionDescription(event.target.value);
  };

  const onCollectionSelectChange = (event) => {
    setSelectedCollection(event.value);
  };

  return (
    <div className="page-collections">
      <Header />
      <div className="page-collections-manage">
        {/* Select the Collection to View */}
        <div className="page-collections-select">
          <p>Select a collection:</p>
          <form className="form-collections-view-delete">
            <Select
              className="collections-dropdown"
              placeholder={selectedCollection}
              value={"Select a collection"}
              options={getCollectionOptions()}
              onChange={onCollectionSelectChange}
              //styles={colourStyles}
            />
            <button
              onClick={handleViewCollection}
              className="collections-delete-view btn waves-light globalbtn"
            >
              View Collection
            </button>

            <button
              onClick={handleDeleteColleciton}
              className="collections-delete-view btn waves-light globalbtn"
            >
              Delete Collection
            </button>
          </form>
        </div>

        {/* create collection form */}
        <div className="page-collections-create">
          <p>Create a new collection:</p>
          <form
            onSubmit={handleCreateCollection}
            className="form-collections-create"
          >
            <p>Name:</p>
            <input
              className="form-collections-create-name"
              name="Collection Name"
              value={createCollectionName}
              onChange={onNameChange}
              type="text"
              placeholder="Collection Name"
              required
            />
            <p className="form-collections-create-describe">Description:</p>
            <input
              className="collections-create-description"
              name="Collection Description"
              value={createCollectionDescription}
              onChange={onDescriptionChange}
              type="text"
              placeholder="Collection Description"
            />
            <button
              type="submit"
              className="form-collections-create-submit btn waves-light globalbtn"
            >
              Create
            </button>
          </form>
        </div>
      </div>

      {/* View of Collection w/ filtering capability */}
      <div className="page-collections-view">
        {words && (
          <CollectionView
            words={words}
            selectedCollection={selectedCollection}
          />
        )}
        {isLoading && <p>Loading collection...</p>}
        {/* {Object.keys(words).length === 0 && (
          <p>The {selectedCollection} collection is currently empty</p>
        )} */}
      </div>
    </div>
  );
}
