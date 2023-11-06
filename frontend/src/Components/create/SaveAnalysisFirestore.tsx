import "./SaveAnalysisFirestore.scss"
import React, { useContext, useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { useParams, useHistory } from "react-router-dom";
import Select from "react-select";
import { NotificationManager } from "react-notifications";

import FirebaseContext from "../../Firebase/context";
import Modal from "react-modal";
import { render } from "enzyme";
import  CreatePitchArt  from "../../Create/CreatePitchArt";
import { AppState } from "../../store";
import { ThunkDispatch } from "redux-thunk";
import { PitchArtDetailsAction } from "../../store/pitchArt/actionTypes";
import {
  setPitchArtDocId,
  setPitchArtCollectionId,
  setParentPitchArtDocumentData,
  setCurrentPitchArtDocumentData
} from "../../store/pitchArt/pitchArtActions";
import { AudioAction } from "../../store/audio/types";
import { getModifiedFieldsofPitchArt , getUpdatedPitchArtData, getChildPitchArtVersions} from '../../Create/ImportUtils';
// import { useDispatch } from 'react-redux';

function SaveAnalysisFirestore({ analysis, saveThumbnail, data, callBacks,currentCollectionId,parentDocumentData,currentDocumentData, setPitchArtCollectionId,
  setParentPitchArtDocumentData,
  setCurrentPitchArtDocumentData}) {
  const firebase = useContext(FirebaseContext);
  const timestamp = firebase.timestamp;

  const params = useParams();
  const history = useHistory();

  const [availableCollections, setAvailableCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("default");
  //Create Collection
  const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
  const [saveModalIsOpen, setSaveModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState(false);
  const [deleteParentPitchArtModal, setDeleteParentPitchArtModalIsOpen] = useState(false);
  const [createCollectionName, setCreateCollectionName] = useState("");
  const [createCollectionDescription, setCreateCollectionDescription] = useState("");
  const [collectionOptions, setCollectionOptions] = useState([]);
  const [updateOptions, setUpdateOptions] = useState(0);
  const selectRef = useRef(null);
  const [speakerName, setSpeakerName] = useState(data.speakerName);
  const [word, setWord] = useState(data.word);
  const [wordTranslate, setWordTranslate] = useState(data.wordTranslate);

  const [savedDocId, setSavedDocId] = useState("");

  const [parentDocumentId, setParentDocumentId] = useState("");

  // TODO ::  update correct parent document ID when coming from collections page
  // TODO ::  if parentDocumentId is undefined or "" , then the current pitch Art is a parent pitch art.
  

  const [isDocSaved, setIsDocSaved] = useState(false);
  const [isSaveAsNewVersionModalOpen, setSaveAsNewVersionModalOpen]= useState(false);



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
      setParentDocumentId(data.parentDocumentId);
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

  const setDeleteParentPitchArtModalToTrue = (event: any) => {
    // event && event.preventDefault();
    setDeleteParentPitchArtModalIsOpen(true);
  };
  const setDeleteParentPitchArtModalToFalse = () => {
    setDeleteParentPitchArtModalIsOpen(false);
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

  const setSaveAsNewVersionModalOpenToTrue  = (event: any) => {
    event.preventDefault();
    setSaveAsNewVersionModalOpen(true);
  };

  const setSaveAsNewVersionModalOpenToFalse = (event: any) => {
    setSaveAsNewVersionModalOpen(false);
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
         // history.push('/pitchartwizard/'+ collectionUuid + '/' + docRef.id);

          if(params['type'] == null){
            callBacks.listenForData(collectionUuid,docRef.id);
          }
          setIsDocSaved(true);
          setSavedDocId(docRef.id);
          setParentDocumentId(docRef.id);
          // const dispatch = useDispatch();
          // dispatch(setPitchArtDocId(docRef.id));
          // setPitchArtDocId(docRef.id);
          setPitchArtCollectionId(collectionUuid);
          const parentData = {
            word: word,
            wordTranslation: wordTranslate,
            speakerName: speakerName,
            ...data,
            speakers: analysis,
            createdAt: timestamp.fromDate(new Date())
          }
          setParentPitchArtDocumentData({"id":docRef.id,"data":parentData});

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
    const collectionId = params['type'] != null && params['type'] != 'share' ? params['type'] : getCollectionUuidFromName(selectedCollection);
    const docId = params['type'] != null && params['type'] != 'share' ? params['id']: savedDocId;
    // instead of params['type'] , use collectionID
    const workingData = {
      ...data,
      word: word === undefined ? data.word : word,
      wordTranslation: wordTranslate === undefined ? data.wordTranslation : wordTranslate,
      speakerName: speakerName === undefined ? data.speakerName : speakerName,
      speakers: analysis,
      createdAt: timestamp.fromDate(new Date())
    }
    const updatedData = getUpdatedPitchArtData(parentDocumentData,currentDocumentData,workingData);
    firebase.firestore 
      .collection(collectionId)
      .doc(docId)
      .update(updatedData)
      .then(() => {
        //console.log("Document written with ID: ", docRef.id);
        saveThumbnail(collectionId + "/" + docId);
        
        if(updatedData && !updatedData.isAChildVersion){
          setParentPitchArtDocumentData({"id":docId,"data":updatedData});
        }
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
    if(currentDocumentData != null && !currentDocumentData["data"].isAChildVersion){
      setDeleteModalIsOpenToFalse();
      setDeleteParentPitchArtModalToTrue({});
      return;
    }
    event.preventDefault();

    // instead of params['type'] , use collectionID
    const collectionId = params['type'] != null && params['type'] != 'share' ? params['type'] : getCollectionUuidFromName(selectedCollection);
    const docId = params['type'] != null && params['type'] != 'share' ? params['id']: savedDocId;

    firebase.firestore
      .collection(collectionId)
      .doc(docId)
      .delete()
      .then(() => {
        firebase.storage.ref()
          .child('thumbnails/' + collectionId + "/" + docId)
          .delete()
          .catch((error) => {
            console.error("Error deleting thumbnail: ", error)
          })
        NotificationManager.success(
          "Pitch Art Deleted Successfully!"
        );
        alert("The page no longer exists");
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error Deleting document: ", error);
        NotificationManager.error("Deleting Word from collection failed!");
      });
  };

  const handleParentPitchArtDeletion = async() =>{
    setDeleteParentPitchArtModalToFalse();
    const versions = await getChildPitchArtVersions(firebase,currentCollectionId, currentDocumentData["id"]);
    const docIds = versions.map((doc) => {return doc['id'];});
    docIds.push(currentDocumentData["id"]);
    console.log("Doc IDs ::", docIds);

    for (const docId of docIds) {
      // Delete Firestore document
      await firebase.firestore.collection(currentCollectionId).doc(docId).delete();
      
      // Delete thumbnail in Firebase Storage
      const thumbnailRef = firebase.storage.ref().child(`thumbnails/${currentCollectionId}/${docId}`);
      await thumbnailRef.delete();
      
      // Add success message or other actions here
      
    }

    // After deleting all documents, you can add any final actions here.
    NotificationManager.success("Pitch Art Deleted Successfully ");
    alert("page no longer exist");
    window.location.reload();

  }

  const savePitchArtAsNewVersion = (event: any) =>{
    event.preventDefault();
    setSaveAsNewVersionModalOpenToFalse(false);
    console.log("Inside savePitchArtAsNewVersion");

    // instead of params['type'] , use collectionID
    const collectionId = params['type'] != null && params['type'] != 'share' ? params['type'] : getCollectionUuidFromName(selectedCollection);

    let parentDocId;
    if(params['type'] != null && params['type'] != 'share'){
      if(data.isAChildVersion){
        parentDocId = data.parentDocumentId;
      }else{
        parentDocId = params['id'];
      }
    }else {
      parentDocId = parentDocumentId;
    }

    const currentData = {
      ...data,
      isAChildVersion: true,
      parentDocumentId: parentDocId,
      word: word === undefined ? data.word : word,
      wordTranslation: wordTranslate === undefined ? data.wordTranslation : wordTranslate,
      speakerName: speakerName === undefined ? data.speakerName : speakerName,
      speakers: analysis,
      createdAt: timestamp.fromDate(new Date())
    }
    let modifiedData = currentData;
    if(parentDocumentData != null)
      modifiedData = getModifiedFieldsofPitchArt(parentDocumentData.data,currentData,parentDocumentData.id);
    else if(currentDocumentData != null){
      modifiedData = getModifiedFieldsofPitchArt(currentDocumentData.data,currentData,currentDocumentData.id);
    }
    // modifiedData.isAChildVersion = true;
    // modifiedData.parentDocumentId = parentDocId,

    console.log(modifiedData);

    firebase.firestore
    .collection(collectionId)
    .add(
        // {
        //   ...data,
        //   isAChildVersion: true,
        //   parentDocumentId: parentDocId,
        //   word: word === undefined ? data.word : word,
        //   wordTranslation: wordTranslate === undefined ? data.wordTranslation : wordTranslate,
        //   speakerName: speakerName === undefined ? data.speakerName : speakerName,
        //   speakers: analysis,
        //   createdAt: timestamp.fromDate(new Date())
        // }
        modifiedData
        )
        .then((docRef) => {
          //console.log("Document written with ID: ", docRef.id);
          saveThumbnail(collectionId + "/" + docRef.id);
          setIsDocSaved(true);
          setSavedDocId(docRef.id);
          if(parentDocumentData == null){
            setParentPitchArtDocumentData({"id":currentDocumentData.id,"data":currentDocumentData.data});
          }
          setCurrentPitchArtDocumentData({"id":docRef.id,"data":modifiedData});
          

          if(params['type'] == null){
            callBacks.listenForData(collectionId,docRef.id);
          }
          if(params['type'] != null && params['type'] != 'share')
            history.push('/pitchartwizard/'+ collectionId + '/' + docRef.id);

          NotificationManager.success(
            "New version of pitch art saved successfully!"
          );
        })
        .catch((error) => {
          console.error("Error saving document: ", error);
          NotificationManager.error("Renaming collection failed!");
        });
  }
  const renderSave = () => {
    if ((params['type'] && params['type'] != "share" || isDocSaved)) {
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
          <button
            className="waves-effect waves-light btn globalbtn metilda-pitch-art-btn"
            type="submit"
            name="action"
            onClick={setSaveAsNewVersionModalOpenToTrue}
          >
            Save As New Version
          </button>
          <Modal
            isOpen={updateModalIsOpen || isSaveAsNewVersionModalOpen}
            style={customStyles}
            appElement={document.getElementById("root" || undefined)}
          >
            <p> Enter the updated details:</p>
            <input
              className="CreateCollection"
              name="speakerName"
              onChange={(event) => { setSpeakerName(event.target.value) }}
              type="text"
              defaultValue={data.speakerName != undefined ? data.speakerName : speakerName }
              required
            />
            <input
              className="CreateCollection"
              name="word"
              onChange={(event) => { setWord(event.target.value) }}
              type="text"
              defaultValue={data.word != undefined ? data.word : word}
              required
            />
            <input
              className="CreateCollection"
              name="wordTranslate"
              onChange={(event) => { setWordTranslate(event.target.value) }}
              type="text"
              defaultValue={data.wordTranslation != undefined ? data.wordTranslation : wordTranslate}
              required
            />
            <div className="collectionRename-cancel-save">
              <button
                className="btn waves-light globalbtn"
                onClick={updateModalIsOpen ? setUpdateModalIsOpenToFalse : setSaveAsNewVersionModalOpenToFalse}
              >
                Cancel
              </button>
              <button
                className="btn waves-light globalbtn"
                onClick={updateModalIsOpen ? handleUpdateToCollections : savePitchArtAsNewVersion}
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
          <Modal
            isOpen={deleteParentPitchArtModal}
            style={customStyles}
            appElement={document.getElementById("root" || undefined)}
          >
            <p> Deleting original pitch art will delete all its versions</p>
            <div className="collectionRename-cancel-save">
              <button
                className="btn waves-light globalbtn"
                onClick={setDeleteParentPitchArtModalToFalse}
              >
                Cancel
              </button>
              <button
                className="btn waves-light globalbtn"
                onClick={handleParentPitchArtDeletion}
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

const mapStateToProps = (state: AppState) => ({
  currentCollectionId: state.pitchArtDetails.collectionId,
  parentDocumentData: state.pitchArtDetails.parentPitchArtDocumentData,
  currentDocumentData: state.pitchArtDetails.currentPitchArtDocumentData
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, void, AudioAction>
) => ({
  // setPitchArtDocId:(pitchArtDocId: string) => dispatch(setPitchArtDocId(pitchArtDocId)),
  setPitchArtCollectionId:(collectionId:string) => dispatch(setPitchArtCollectionId(collectionId)),
  setParentPitchArtDocumentData:(data:any) => dispatch(setParentPitchArtDocumentData(data)),
  setCurrentPitchArtDocumentData:(data:any) => dispatch(setCurrentPitchArtDocumentData(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(SaveAnalysisFirestore);