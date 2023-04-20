import "./SaveAnalysisFirestore.scss"
import React, { useContext, useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";

import { useParams } from "react-router-dom";
import Select from "react-select";
import { NotificationManager } from "react-notifications";

import FirebaseContext from "../../Firebase/context";
import Modal from "react-modal";
import { render } from "enzyme";

export default function SaveAnalysisFirestore({ analysis, saveThumbnail, data }) {
  const firebase = useContext(FirebaseContext);
  const timestamp = firebase.timestamp;

  const params = useParams();

  const [availableCollections, setAvailableCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("default");
  //Create Collection
  const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
  const [saveModalIsOpen, setSaveModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState(false);
  const [createCollectionName, setCreateCollectionName] = useState("");
  const [createCollectionDescription, setCreateCollectionDescription] = useState("");
  const [collectionOptions, setCollectionOptions] = useState([]);
  const [updateOptions, setUpdateOptions] = useState(0);
  const selectRef = useRef(null);
  const [speakerName, setSpeakerName] = useState(data.speakerName);
  const [word, setWord] = useState(data.word);
  const [wordTranslate, setWordTranslate] = useState(data.wordTranslate);


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
  }, [updateOptions]);

  const collectionSelectOnChange = (event) => {
    setSelectedCollection(event.value);
  };

  const setCreateModalIsOpenToTrue = (event: any) => {
    event.preventDefault();
    setCreateModalIsOpen(true);
  };
  const setCreateModalIsOpenToFalse = () => {
    setCreateModalIsOpen(false);
  };

  const setSaveModalIsOpenToTrue = (event: any) => {
    event.preventDefault();
    setSaveModalIsOpen(true);
  };
  const setSaveModalIsOpenToFalse = () => {
    setSaveModalIsOpen(false);
  };

  const setDeleteModalIsOpenToTrue = (event: any) => {
    event.preventDefault();
    setDeleteModalIsOpen(true);
  };
  const setDeleteModalIsOpenToFalse = () => {
    setDeleteModalIsOpen(false);
  };

  const setUpdateModalIsOpenToTrue = (event: any) => {
    event.preventDefault();
    setUpdateModalIsOpen(true);
  };
  const setUpdateModalIsOpenToFalse = () => {
    setUpdateModalIsOpen(false);
  };

  const onChangeCollectionName = (event: any) => {
    setCreateCollectionName(event.target.value);
  };
  const onChangeCollectionDesc = (event: any) => {
    setCreateCollectionDescription(event.target.value);
  };

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


    setUpdateOptions(updateOptions + 1)
    setCreateCollectionName("");
    setCreateCollectionDescription("");
    setCreateModalIsOpenToFalse();
    if (response.status == 200) {
      NotificationManager.success("Added collection successfully!");
    } else {
      NotificationManager.error("Adding collection failed!");
    }
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
    setSaveModalIsOpenToFalse();
    const collectionUuid = getCollectionUuidFromName(selectedCollection);

    if (word === undefined || wordTranslate === undefined || speakerName === undefined) {
      NotificationManager.error("Invalid Spearker Name or Word or Word Translation !!!");
    }
    else {
      firebase.firestore
        .collection(collectionUuid)
        .add({
          word: word,
          wordTranslation: wordTranslate,
          speakerName: speakerName,
          ...data,
          speakers: analysis,
          createdAt: timestamp.fromDate(new Date())
        })
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
    }
  };

  const handleUpdateToCollections = async (event: any) => {
    event.preventDefault();
    setUpdateModalIsOpenToFalse();

    firebase.firestore
      .collection(params['type'])
      .doc(params['id'])
      .update({
        word: word === undefined ? data.word : word,
        wordTranslation: wordTranslate === undefined ? data.wordTranslation : wordTranslate,
        speakerName: speakerName === undefined ? data.speakerName : speakerName
      })
      .then(() => {
        //console.log("Document written with ID: ", docRef.id);
        saveThumbnail(params['type'] + "/" + params['id']);
        NotificationManager.success(
          "Pitch Art Updated Successfully!"
        );
      })
      .catch((error) => {
        console.error("Error Updating document: ", error);
        NotificationManager.error("Updating collection failed!");
      });
  };

  const handleDeleteCollection = async (event: any) => {
    event.preventDefault();

    firebase.firestore
      .collection(params['type'])
      .doc(params['id'])
      .delete()
      .then(() => {
        firebase.storage()
          .child('thumbnails/' + params['type'] + "/" + params['id'])
          .delete()
          .catch((error) => {
            console.error("Error deleting thumbnail: ", error)
          })
        NotificationManager.success(
          "Pitch Art Deleted Successfully!"
        );
      })
      .catch((error) => {
        console.error("Error Deleting document: ", error);
        NotificationManager.error("Deleting Word from collection failed!");
      });
  };
  const renderSave = () => {
    if (params['type'] && params['type'] != "share") {
      return (<div className="page-create-save-collections">
        <form className="page-create-save-collections-form">
          <button
            className="waves-effect waves-light btn globalbtn metilda-pitch-art-btn"
            type="submit"
            name="action"
            onClick={setUpdateModalIsOpenToTrue}
          >
            Update PitchArt
          </button>
          <Modal
            isOpen={updateModalIsOpen}
            style={customStyles}
            appElement={document.getElementById("root" || undefined)}
          >
            <p> Enter the updated details:</p>
            <input
              className="CreateCollection"
              name="speakerName"
              onChange={(event) => { setSpeakerName(event.target.value) }}
              type="text"
              defaultValue={data.speakerName}
              required
            />
            <input
              className="CreateCollection"
              name="word"
              onChange={(event) => { setWord(event.target.value) }}
              type="text"
              defaultValue={data.word}
              required
            />
            <input
              className="CreateCollection"
              name="wordTranslate"
              onChange={(event) => { setWordTranslate(event.target.value) }}
              type="text"
              defaultValue={data.wordTranslation}
              required
            />
            <div className="collectionRename-cancel-save">
              <button
                className="btn waves-light globalbtn"
                onClick={setUpdateModalIsOpenToFalse}
              >
                Cancel
              </button>
              <button
                className="btn waves-light globalbtn"
                onClick={handleUpdateToCollections}
              >
                Update
              </button>
            </div>
          </Modal>
          <button
            className="waves-effect waves-light btn globalbtn metilda-pitch-art-btn"
            type="submit"
            name="action"
            onClick={setDeleteModalIsOpenToTrue}
          >
            Delete PitchArt
          </button>
          <Modal
            isOpen={deleteModalIsOpen}
            style={customStyles}
            appElement={document.getElementById("root" || undefined)}
          >
            <p> Do you want to delete the Pitch Art?</p>
            <div className="collectionRename-cancel-save">
              <button
                className="btn waves-light globalbtn"
                onClick={setDeleteModalIsOpenToFalse}
              >
                Cancel
              </button>
              <button
                className="btn waves-light globalbtn"
                onClick={handleDeleteCollection}
              >
                Delete
              </button>
            </div>
          </Modal>
        </form>
      </div>
      );
    }
    return (<div className="page-create-save-collections">
      <form className="page-create-save-collections-form">
        <Select
          ref={selectRef}
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
          onClick={setSaveModalIsOpenToTrue}
        >
          Save to Collections
        </button>
        <Modal
          isOpen={saveModalIsOpen}
          style={customStyles}
          appElement={document.getElementById("root" || undefined)}
        >
          <p> Do you want to save the Pitch Art to {selectedCollection} ?</p>
          <p> Enter the following details:</p>
          <input
            className="CreateCollection"
            name="speakerName"
            onChange={(event) => { setSpeakerName(event.target.value) }}
            type="text"
            placeholder="Speaker Name"
            required
          />
          <input
            className="CreateCollection"
            name="word"
            onChange={(event) => { setWord(event.target.value) }}
            type="text"
            placeholder="Word"
            required
          />
          <input
            className="CreateCollection"
            name="wordTranslate"
            onChange={(event) => { setWordTranslate(event.target.value) }}
            type="text"
            placeholder="Word Translation"
            required
          />
          <div className="collectionRename-cancel-save">
            <button
              className="btn waves-light globalbtn"
              onClick={setSaveModalIsOpenToFalse}
            >
              Cancel
            </button>
            <button
              className="btn waves-light globalbtn"
              onClick={handleSaveToCollections}
            >
              Save
            </button>
          </div>
        </Modal>
        <button
          onClick={setCreateModalIsOpenToTrue}
          className="waves-effect waves-light btn globalbtn metilda-pitch-art-btn"
        >
          Create New Collection
        </button>
        <Modal
          isOpen={createModalIsOpen}
          style={customStyles}
          appElement={document.getElementById("root" || undefined)}
        >
          <form
            onSubmit={handleCreateCollection}
            className="form-collections-create"
          >
            <div className="col s4">
              <input
                className="CreateCollection"
                name="currentCollectionName"
                onChange={onChangeCollectionName}
                type="text"
                placeholder="Collection Name"
                required
              />
              <input
                className="CreateCollection"
                name="currentCollectionDesc"
                onChange={onChangeCollectionDesc}
                type="text"
                placeholder="Collection Description"
                required
              />
              <div className="collectionRename-cancel-save">
                <button
                  className="btn waves-light globalbtn"
                  onClick={setCreateModalIsOpenToFalse}
                >
                  Cancel
                </button>
                <button
                  className="btn waves-light globalbtn"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </Modal>
      </form>
    </div>
    );
  }

  return (
    renderSave()
  );

}

SaveAnalysisFirestore.propTypes = {
  analysis: PropTypes.array,
  saveThumbnail: PropTypes.func,
  data: PropTypes.any
};
