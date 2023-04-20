import "./Collections.css";

import React, { useContext, useEffect, useState } from "react";
import Select from "react-select";

import { NotificationManager } from "react-notifications";

import FirebaseContext from "../Firebase/context";

import Header from "../Components/header/Header";
import CollectionView from "../Components/collections/CollectionView";

import Modal from "react-modal";

const customStyles = {
  content: {
    margin: 0,
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

export default function Collections() {
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
  const [createCollectionName, setCreateCollectionName] = useState("");
  const [createCollectionDescription, setCreateCollectionDescription] =
    useState("");

  const [collectionsUpdated, setCollectionsUpdated] = useState(0);
  const [selectedCollection, setSelectedCollection] = useState("default");
  const [selectedCollectionUuid, setSelectedCollectionUuid] = useState("1880f9eb-e274-4093-ac6b-8e7fa9a05a84");
  const [words, setWords] = useState([]);
  const [update, setUpdate] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [renameModalIsOpen, setRenameModalIsOpen] = useState(false);
  const [renameCollection, setRenameCollection] = useState("");

  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

  // call the collections api to get a list of collections
  // occurs on first render & when collectionsUpdated is changed
  useEffect(() => {
    fetch(`api/collections`, {
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
  }, [collectionsUpdated]);

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
    // console.log(response.body);
    setCreateCollectionName("");
    setCollectionsUpdated(collectionsUpdated + 1);

    if (response.status == 200) {
      NotificationManager.success("Added collection successfully!");
    } else {
      NotificationManager.error("Adding collection failed!");
    }
  };

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

  // Update a collection name
  const handleRenameCollection = async (event: any) => {
    event.preventDefault();
    setRenameModalIsOpenToFalse();

    let collectionUuid = getCollectionIdFromName(selectedCollection);
    setSelectedCollectionUuid(collectionUuid.toString());

    const formData = new FormData();
    formData.append("collection_name", renameCollection);
    const response = await fetch(`/api/collections/` + collectionUuid, {
      method: "PUT",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });
    const body = await response.json();

    //console.log("Handle Rename Collection: " + renameCollection);

    if (response.status == 200) {
      setSelectedCollection(renameCollection);
      setCollectionsUpdated(collectionsUpdated + 1);
      NotificationManager.success("Collection name updated successfully!");
    } else {
      NotificationManager.error("Renaming collection failed!");
    }
  };

  // Delete a collection
  const handleDeleteCollection = async (event: any) => {
    event.preventDefault();
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

    const result = firebase.firestore
      .collection(selectedCollectionUuid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          //check if owner is the one deleting.
          //const uid = firebase.auth.currentUser.email;

          doc.ref.delete();
          //console.log("deleted: " + doc.id + " from firestore.");

          // delete thumbnails - create a reference to the thumbnail then delete it
          const storageRef = firebase.uploadFile();
          let thumbnailRef = storageRef.child(
            "thumbnails/" + selectedCollectionUuid + "/" + doc.id
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

    setDeleteModalIsOpenToFalse();
    setSelectedCollection("default");
    setWords([]);

    if (response.status == 200) {
      NotificationManager.success("Collection deleted successfully!");
      setSelectedCollection("default");
      setCollectionsUpdated(collectionsUpdated + 1);
    } else {
      NotificationManager.error("Deleting collection failed!");
    }
  };

  // onChange methods for two way binding.
  const onNameChange = (event: any) => {
    setCreateCollectionName(event.target.value);
  };

  const onDescriptionChange = (event: any) => {
    setCreateCollectionDescription(event.target.value);
  };

  const onCollectionSelectChange = (event: any) => {
    setSelectedCollection(event.value);
    setSelectedCollectionUuid(getCollectionUuidFromName(event.value).toString());
    //handleViewCollection(event);
  };

  const onChangeCollectionName = (event: any) => {
    setRenameCollection(event.target.value);
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

  const setRenameModalIsOpenToTrue = (event: any) => {
    event.preventDefault();
    setRenameModalIsOpen(true);
  };

  const setRenameModalIsOpenToFalse = () => {
    setRenameModalIsOpen(false);
  };

  const setDeleteModalIsOpenToTrue = (event: any) => {
    event.preventDefault();
    setDeleteModalIsOpen(true);
  };

  const setDeleteModalIsOpenToFalse = () => {
    setDeleteModalIsOpen(false);
  };

  return (
    <div className="page-collections">
      <Header />
      {/* Select the Collection to View */}
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

            <button
              onClick={setDeleteModalIsOpenToTrue}
              className="collections-delete-view btn waves-light globalbtn"
            >
              Delete Collection
            </button>
            <button
              onClick={setRenameModalIsOpenToTrue}
              className="collections-delete-view btn waves-light globalbtn"
            >
              Rename Collection
            </button>
            <Modal
              isOpen={renameModalIsOpen}
              style={customStyles}
              appElement={document.getElementById("root" || undefined)}
            >
              <p>Enter a new name: </p>
              <div className="col s4">
                <input
                  className="collectionRename"
                  name="currentCollectionName"
                  onChange={onChangeCollectionName}
                  type="text"
                  placeholder={selectedCollection}
                  required
                />
                <div className="collectionRename-cancel-save">
                  <button
                    className="btn waves-light globalbtn"
                    onClick={setRenameModalIsOpenToFalse}
                  >
                    cancel
                  </button>
                  <button
                    className="btn waves-light globalbtn"
                    onClick={handleRenameCollection}
                  >
                    save
                  </button>
                </div>
              </div>
            </Modal>
            <Modal
              isOpen={deleteModalIsOpen}
              style={customStyles}
              appElement={document.getElementById("root" || undefined)}
            >
              <p>Are you sure you want to delete "{selectedCollection}"</p>
              <div className="col s4">
                <div className="collection-delete-yes-no">
                  <button
                    className="btn waves-light globalbtn"
                    onClick={handleDeleteCollection}
                  >
                    yes
                  </button>
                  <button
                    className="btn waves-light globalbtn"
                    onClick={setDeleteModalIsOpenToFalse}
                  >
                    no
                  </button>
                </div>
              </div>
            </Modal>
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
            selectedCollectionUuid={selectedCollectionUuid}
          />
        )}

        {isLoading && <p>Loading collection...</p>}
      </div>
    </div>
  );
}
