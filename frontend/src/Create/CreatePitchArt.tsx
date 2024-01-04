import "./CreatePitchArt.css";
import { compose } from "recompose";
import * as React from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import PitchArtContainer from "../PitchArtWizard/PitchArtViewer/PitchArtContainer";
import { AppState } from "../store";
import { setLetterPitch, replaceSpeakers } from "../store/audio/actions";
import { AudioAction } from "../store/audio/types";
import { Speaker, } from "../types/types";
import AudioAnalysis from "./AudioAnalysis";
import { withAuthorization } from "../Session";
import Header from "../Components/header/Header";
import { fillMissingFieldsInChildDoc, uploadAudio } from "./ImportUtils";
import { spinner } from "../Utils/LoadingSpinner";
import ReactGA, { initialize } from "react-ga";
import ReactFileReader from "react-file-reader";
import * as DEFAULT from "../constants/create";
import { withRouter } from "react-router-dom";
import { createRef } from "react";
import ReactDOM from 'react-dom'
import { NotificationManager } from "react-notifications";
import {
  setPitchArtDocId,
  setPitchArtCollectionId,
  setParentPitchArtDocumentData,
  setCurrentPitchArtDocumentData,
  setCurrentPitchArtVersions,
  updatePitchArtDetails,
  setListenedDocuments
} from "../store/pitchArt/pitchArtActions";
import PitchArtVersionSelector from "./PitchArtVersionSelector";
import {createCommonPitchArtDocument} from '../Create/ImportUtils';
import {getChildPitchArtVersions} from '../Create/ImportUtils';
import { CURRENT_PITCHART_DOCUMENT_DATA } from "../constants";
import { timeStamp } from "console";

interface CreatePitchArtProps extends React.Component<CreatePitchArtProps, State> {
  speakers: Speaker[];
  history: any;
  sharedId: any;
  setLetterPitch: (
    speakerIndex: number,
    letterIndex: number,
    newPitch: number
  ) => void;
  replaceSpeakers: (speakers: Speaker[]) => void;
  firebase: any;
  match: any;
  location:any;
  currentCollectionId: string;
  parentPitchArtDocumentData:any;
  currentPitchArtDocumentData:any;
  currentChildPitchArtVersions:any
  listenedDocuments:[];
 // setPitchArtDocId:(Id:string) => void;
  setPitchArtCollectionId:(Id:string) =>void;
  setParentPitchArtDocumentData:(data:any) =>void;
  setCurrentPitchArtDocumentData:(data:any) => void;
  setCurrentPitchArtVersions:(data:any) => void;
  updatePitchArtDetails:(data:any) => void;
  setListenedDocuments:(data:any) => void;
}

interface State {
  files: any[];
  selectedFolderName: string;
  isLoading: boolean;
  owner: string;
  speakers?: Speaker[];
  pitchRange: Array<{
    minPitch: number;
    maxPitch: number;
  }>;
  pitchArt: {
    minPitch: number;
    maxPitch: number;
    minTime: number;
    maxTime: number;
    showAccentPitch: boolean;
    showSyllableText: boolean;
    showVerticallyCentered: boolean;
    showPitchArtLines: boolean;
    showLargeCircles: boolean;
    showTimeNormalization: boolean;
    showPitchScale: boolean;
    showPerceptualScale: boolean;
    showPitchArtImageColor: boolean;
    showMetildaWatermark: boolean;
  };
  isAChildVersion: boolean;
  parentDocumentId: string;
}

class CreatePitchArt extends React.Component<
  CreatePitchArtProps,
  State
> {

  private pitchArtRef = createRef<any>();
  private customStyles = {
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
  private parentDocumentData = null;

  constructor(props: CreatePitchArtProps) {
    super(props);
    this.state = {
      owner: this.props.firebase.auth.currentUser.email,
      files: [],
      selectedFolderName: "Uploads",
      isLoading: false,
      pitchRange: new Array(DEFAULT.SPEAKER_LIMIT).fill(
        {
          minPitch: DEFAULT.MIN_ANALYSIS_PITCH,
          maxPitch: DEFAULT.MAX_ANALYSIS_PITCH
        }),
      pitchArt: {
        minPitch: DEFAULT.MIN_ANALYSIS_PITCH,
        maxPitch: DEFAULT.MAX_ANALYSIS_PITCH,
        minTime: DEFAULT.MIN_ANALYSIS_TIME,
        maxTime: DEFAULT.MAX_ANALYSIS_TIME,
        showAccentPitch: false,
        showSyllableText: false,
        showVerticallyCentered: false,
        showPitchArtLines: true,
        showLargeCircles: true,
        showTimeNormalization: false,
        showPitchScale: false,
        showPerceptualScale: true,
        showPitchArtImageColor: true,
        showMetildaWatermark: false
      },
      isAChildVersion: false,
      parentDocumentId: ''
    };
    this.loadPitchArtVersions = this.loadPitchArtVersions.bind(this);
    this.removeVersionsModal = this.removeVersionsModal.bind(this);
  }

  componentDidMount() {
    if (this.props.match.params.type) {
      this.listenForData(this.props.match.params.type, this.props.match.params.id);
    } else {
      this.props.updatePitchArtDetails({
        pitchArtDocId:null,
        collectionId:null,
        listenedDocuments:[],
        parentPitchArtDocumentData:null,
        currentPitchArtDocumentData:null,
        currentPitchArtVersions:[]
      });
      this.getUserFiles();
    }
  }

  componentDidUpdate(prevProps) {
    // Check for changes in the URL parameters
    const { type: newType, id: newId } = this.props.match.params;
    const { type: prevType, id: prevId } = prevProps.match.params;

    if (newType !== prevType || newId !== prevId) {
      // URL parameters have changed, trigger a reload
      this.listenForData(newType, newId);
    }
  }

  listenForData(collectionId:string,docId:string) {
   // const id = this.props.match.params.id ? this.props.match.params.id : "";
   const navigationSource = this.props.location.state ? this.props.location.state.from : null;
   if(collectionId == undefined && docId == undefined && navigationSource === 'nav-link'){
    window.location.reload();
    return;
   }
   if(collectionId == undefined ) return;
   if(docId == undefined) return;

    const self = this;
    const unsubscribe = this.props.firebase.firestore.collection(collectionId).doc(docId)
      .onSnapshot((doc) => {
        if (doc.data()) {
          const currentDocData = doc.data();
           
          const currentParentDocId = currentDocData.parentDocumentId;
          if(currentParentDocId != '' && currentParentDocId != null){
             if(self.props.parentPitchArtDocumentData == null || (self.props.parentPitchArtDocumentData.id != currentParentDocId)){
              self.loadParentPitchArtData(currentParentDocId,collectionId, currentDocData, docId);
             }else{
              self.setCurrentPitchArtData(currentDocData,docId, collectionId);
             }
          }else{
            if(collectionId != 'share'){
              self.props.updatePitchArtDetails({
                parentPitchArtDocumentData:{"id":docId, "data":JSON.parse(JSON.stringify(currentDocData))},
                currentPitchArtVersions:[],
                listenedDocuments:[]
              });
            }
            
            self.setCurrentPitchArtData(currentDocData,docId, collectionId);
          } 
        } else {
          self.setState({ owner: self.props.firebase.auth.currentUser.email });
          self.props.history.push({ pathname: "/pitchartwizard" });
          self.props.updatePitchArtDetails({
            currentPitchArtVersions:[],
            listenedDocuments:[]
          })
        }
      });
      /**
       * Maintaining list of Id's to unsubscribe listening on firetsore 
       * document when the document is deleted.
       */
      if(docId && unsubscribe){
        let newList = [];
        newList = [...this.props.listenedDocuments];
        newList.push({"id":docId,"unsubscribe":unsubscribe});
        this.props.setListenedDocuments(newList);
        console.log("unsubscribe"+ unsubscribe);
      }
      
  }
 /**
  * This method loads parent(original) pitch art if the current 
  * pitch art if a child(version) of another pitch art.
  * @param parentDocId 
  * @param collectionId 
  * @param currentPitchArtData 
  * @param currentDocId 
  */
  loadParentPitchArtData = async (parentDocId:string, collectionId: string, currentPitchArtData: any, currentDocId:string) =>{
    const self = this;
    try{
      const documents = await getChildPitchArtVersions(this.props.firebase,collectionId,parentDocId, true);
      const parentDoc = documents.find((doc)=> doc.id === parentDocId);
      const childVersions = documents.filter((doc) => doc.data.parentDocumentId === parentDocId);
      if(parentDoc != null)
        self.props.setParentPitchArtDocumentData(parentDoc);
      if(childVersions.length != 0){
        self.props.setCurrentPitchArtVersions(childVersions);
      }
      self.setCurrentPitchArtData(currentPitchArtData, currentDocId, collectionId);

    }catch(e){
      console.error("Error setting parent document data ", e);
    }
    
  }
 /**
  * This method loads the current pitch art document data, and sets the data
  * to necessary fields.
  * @param currentPitchArtData 
  * @param currentDocId 
  * @param collectionId 
  */
  setCurrentPitchArtData = (currentPitchArtData:any, currentDocId:string, collectionId:string) => {
    let newSpeakers = currentPitchArtData.speakers;
    let parentDocumentData = this.props.parentPitchArtDocumentData;

    if(newSpeakers === undefined && parentDocumentData != null){
      newSpeakers = parentDocumentData.data.speakers;
    }

    if(newSpeakers === undefined){
      newSpeakers = [{ uploadId: "" }];
    }
    newSpeakers.forEach((speaker) => {
      if (speaker.letters === undefined) { speaker.letters = []; }
    });
    this.props.replaceSpeakers(newSpeakers as Speaker[]);
    // deep copy
    let currentPitchArtUpdatedData = JSON.parse(JSON.stringify(currentPitchArtData));
    if(parentDocumentData != null){
      parentDocumentData = JSON.parse(JSON.stringify(parentDocumentData));
      currentPitchArtData = JSON.parse(JSON.stringify(currentPitchArtData));
      currentPitchArtUpdatedData = createCommonPitchArtDocument(parentDocumentData.data,currentPitchArtData);
    }
      
    this.setState({ ...currentPitchArtUpdatedData },
      () => { this.getUserFiles(); });
    
    
    if(collectionId != 'share'){
      this.props.updatePitchArtDetails({
        collectionId:collectionId,
        currentPitchArtDocumentData:{"id":currentDocId,"data":currentPitchArtUpdatedData}
      });
    }
  
  }

  updatePitchArtValue = (inputName: string, inputValue: any) => {
    this.setState((prevState) => {
      if (inputName === "state") {
        return inputValue;
      } else {
        const state = prevState;
        state.pitchArt[inputName] = inputValue;
        if (this.props.match.params.type !== undefined) {
          this.props.firebase.updateSharedPage(this.state, this.props.match.params.type, this.props.match.params.id);
        }
        return state;
      }
    });
  }

  updateAudioPitch = (index: number, minPitch: number, maxPitch: number) => {
    this.setState((prevState) => {
      const state = prevState;
      state.pitchRange[index].minPitch = minPitch;
      state.pitchRange[index].maxPitch = maxPitch;
      if (this.props.match.params.type !== undefined) {
        this.props.firebase.updateSharedPage(this.state, this.props.match.params.type, this.props.match.params.id);
      }
      return state;
    });
  }
   

  createSharedPage = () => {

    this.setState({ speakers: this.props.speakers });

    const pageId = this.props.firebase.firestore.collection("share").add({
      ...this.state
    }).then((docRef) => {
      this.props.history.push({ pathname: `/pitchartwizard/share/${docRef.id}` });
      this.listenForData("share",docRef.id);
      NotificationManager.success(
        "Page Sharing Started. The URL can be shared with other MeTILDA users."
      );
    }).catch((error) => {
      console.error("Error adding document: ", error);
    });
  }

  isOwner = () => {
    if (this.state.owner === this.props.firebase.auth.currentUser.email) {
      return true;
    }
    return false;
  }

  deleteSharedPage = () => {
    if (this.isOwner()) {
      this.props.firebase.firestore.collection(this.props.match.params.type).doc(this.props.match.params.id).delete().then(() => {
        console.log("Sharing for this page is disabled");
      }).catch((error) => {
        console.error("Error removing doc: ", error);
      });
    }
    this.props.history.push({ pathname: `/pitchartwizard` });
    window.location.reload();
  }
  /**
   * 
   * @returns This method loads pitch art documents(versions) realted to the current document
   * if the current document is a verion of another(parent) document, it loads parent doc and all
   * other douments(versions) of parent document.
   * if current document is parent(original) document, it loads all the child verions of the document.
   */
  loadPitchArtVersions = async() =>{
    console.log("Inside load pitch art versions");

    console.log(this.props.currentCollectionId);
    if(!this.props.currentCollectionId){
      this.renderVersionsModal([],[]);
      return;
    }
    

    let documents = [];
    if(this.props.currentPitchArtDocumentData && this.props.currentPitchArtDocumentData["id"] != null){
      const currentDocData = this.props.currentPitchArtDocumentData;
      const parentDocId = currentDocData["data"].isAChildVersion ? currentDocData["data"].parentDocumentId : currentDocData["id"];
      
      if(this.props.currentChildPitchArtVersions.length == 0){
        documents = await getChildPitchArtVersions(this.props.firebase,this.props.currentCollectionId,parentDocId,true);
      }else{
        documents = this.props.currentChildPitchArtVersions;
        const parent = documents.find((doc)=> doc.id === parentDocId);
       if(!parent){
         documents = [...documents, this.props.parentPitchArtDocumentData];
       }
        
      }
      if(documents.length == 0){
        this.renderVersionsModal([],[]);
        return;
      }
      
      const DocIds = documents.map((doc) => {return doc['id'];});

      const ref = this.props.firebase.storage.ref();
            
      const documentPaths =DocIds.map((docId)=>{
        return 'thumbnails/' +this.props.currentCollectionId + '/'+ docId;
      }) 
      const downloadURLPromises = documentPaths.map((path) => ref.child(path).getDownloadURL());
      const idToURLMap = {};
      // Use Promise.all to execute all the requests in parallel
      Promise.all(downloadURLPromises)
      .then((urls) => {
        // 'urls' is an array of download URLs in the same order as 'documentPaths'

        DocIds.forEach((docId, index) => {
          idToURLMap[docId] = urls[index];
        });
        console.log("idToURLMap :: ", idToURLMap);
        this.renderVersionsModal(documents, idToURLMap);

      })
      .catch((error) => {
        console.error("Error getting download URLs:", error);
      });
    }
      
  }

  renderSpeakers = () => {
    if (this.props.match.params.type && this.state.speakers && this.props.match.params.id) {

      this.props.firebase.updateSharedPageSpeakers(this.props.speakers, this.props.match.params.type, this.props.match.params.id);
    }

    return this.props.speakers.map((item, index) => (
      <AudioAnalysis
        speakerIndex={index}
        key={`audio-analysis-${index}-${item.uploadId}`}
        firebase={this.props.firebase}
        files={this.state.files}
        minPitch={this.state.pitchRange[index].minPitch}
        maxPitch={this.state.pitchRange[index].maxPitch}
        parentCallBack={this.callBackSelectionInterval}
        updateAudioPitch={this.updateAudioPitch}
      />
    ));
  }

  formatFileName = (uploadId: string): string => {
    const splitIndex = uploadId.lastIndexOf(".");

    if (splitIndex !== -1) {
      return uploadId.slice(0, splitIndex);
    }

    return uploadId;
  }

  getUserFiles = () => {
    // Get files of a user

    const currentUserId = this.props.match.params.type === "share"
      ? this.state.owner
      : this.props.firebase.auth.currentUser.email;

    fetch(
      `/api/get-files-and-folders/${currentUserId}/${this.state.selectedFolderName}` +
      "?file-type1=Folder&file-type2=Upload",
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          files: data.result.map((item: any) => {
            return {
              index: item[0],
              name: item[1],
              path: item[2],
              size: item[3],
              type: item[4],
              created: item[5],
              updated: item[6],
              user: item[7]
            };
          }),
        })
      );
  }

  fileSelected = async (files: any) => {
    this.setState({
      isLoading: true,
    });
    try {
      const response = await uploadAudio(files, this.props.firebase);
      this.getUserFiles();
      ReactGA.event({
        category: "Upload File",
        action: "User pressed Upload File button",
      });
    } catch (ex) {
      console.log(ex);
    }
    this.setState({
      isLoading: false,
    });
  }

  folderBackButtonClicked = async () => {
    await this.setState({
      selectedFolderName: "Uploads",
    });
    this.getUserFiles();
  }

  callBackSelectionInterval = (childSelectedFolderName: string) => {
    this.setState({
      selectedFolderName: childSelectedFolderName,
    });
    if (this.state.selectedFolderName !== "Uploads") {
      this.getUserFiles();
    }
  }

  renderPageOptions() {
    if (this.props.match.params.type === "share") {
      return (
        <button className="page-options waves-effect waves-light btn globalbtn"
          onClick={this.deleteSharedPage}>
          <i className="material-icons right">person_add</i>
          {this.isOwner()
            ? "Stop Sharing"
            : "Leave Page"
          }
        </button>
      );
    } else if (this.props.match.params.type !== undefined) {
      //No Options
    } else {
      return (
        <button className="page-options waves-effect waves-light btn globalbtn"
          onClick={this.createSharedPage}>
          <i className="material-icons right">person_add</i>
          {"Share Page"}
        </button>
      );
    }
  }
/**
 * This method loads the versions pop up and display the UI
 * two compare versions with each other.
 * @param words array of documents(both original and versions)
 * @param urls  array of urls to load thumbnails(images) of each document.
 */
  renderVersionsModal= (words, urls) => {
      words.sort((a, b) => b.data.createdAt - a.data.createdAt);
      if(this.props.parentPitchArtDocumentData && this.props.parentPitchArtDocumentData["data"]){
        words = words.map((word)=>{
          return fillMissingFieldsInChildDoc(word, this.props.parentPitchArtDocumentData);
        })
      }

      const modal = document.querySelector('.version-overlay');
      const pitchArtVersionSelector = <PitchArtVersionSelector words={words} removeVersionsModal={this.removeVersionsModal} 
        urls={urls} collectionId={this.props.currentCollectionId} firebase={this.props.firebase} history={this.props.history}
        params={this.props.match.params}
        setCurrentPitchArtData= {this.setCurrentPitchArtData}/>;

      // Render the React component inside the modal
      ReactDOM.render(pitchArtVersionSelector, modal);
  }

  removeVersionsModal = () =>{
    const modal = document.querySelector('.version-overlay');
    ReactDOM.unmountComponentAtNode(modal);
  }

  render() {
    const { isLoading } = this.state;
    const uploadId = this.props.speakers
      .map((item) => this.formatFileName(item.uploadId))
      .join("_");
    const callbacks = {listenForData:this.listenForData.bind(this)};
    return (
      <div>
        <Header />
        {isLoading && spinner()}
        <div className="CreatePitchArt">
          <ReactFileReader
            fileTypes={[".wav"]}
            multipleFiles={false}
            handleFiles={this.fileSelected}
          >
            <button className="UploadFile waves-effect waves-light btn globalbtn">
              <i className="material-icons right">cloud_upload</i>
              Upload File to cloud
            </button>

          </ReactFileReader>
          <div className="pitchArt-version">
            <button className="versions waves-effect waves-light btn globalbtn"
            onClick={this.loadPitchArtVersions}>
              <i className="material-icons right">history</i>
              Versions
            </button>
          </div>
          <div className="version-overlay"></div>
          <div>
            {this.renderPageOptions()}
          </div>
          <div className="metilda-page-content">
            <div id="button-drop-down-image-side-by-side">
              <div id="metilda-drop-down-back-button">
                {this.state.selectedFolderName === "Uploads" && (
                  <button className="audioBackButtonDisabled" disabled={true}>
                    <i className="material-icons">arrow_back</i>
                  </button>
                )}
                {this.state.selectedFolderName !== "Uploads" && (
                  <button
                    className="audioBackButton"
                    onClick={() => this.folderBackButtonClicked()}
                  >
                    <i className="material-icons">arrow_back</i>
                  </button>
                )}
              </div>
              <div id="drop-down-and-image">{this.renderSpeakers()}</div>
            </div>
            <div className="row">
              <PitchArtContainer
                ref={this.pitchArtRef}
                firebase={this.props.firebase}
                speakers={this.props.speakers}
                width={DEFAULT.AUDIO_IMG_WIDTH}
                height={DEFAULT.AUDIO_IMG_HEIGHT}
                setLetterPitch={this.props.setLetterPitch}
                uploadId={uploadId}
                pitchArt={this.state.pitchArt}
                updatePitchArtValue={this.updatePitchArtValue}
                data={this.state}
                callBacks={callbacks}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  speakers: state.audio.speakers,
  currentCollectionId: state.pitchArtDetails.collectionId,
  parentPitchArtDocumentData: state.pitchArtDetails.parentPitchArtDocumentData,
  currentPitchArtDocumentData: state.pitchArtDetails.currentPitchArtDocumentData,
  currentChildPitchArtVersions:state.pitchArtDetails.currentPitchArtVersions,
  listenedDocuments:state.pitchArtDetails.listenedDocuments
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, void, AudioAction>
) => ({
  setLetterPitch: (
    speakerIndex: number,
    letterIndex: number,
    newPitch: number
  ) => dispatch(setLetterPitch(speakerIndex, letterIndex, newPitch)),
  replaceSpeakers: (
    speakers: Speaker[]
  ) => dispatch(replaceSpeakers(speakers)),
 // setPitchArtDocId:(pitchArtDocId: string) => dispatch(setPitchArtDocId(pitchArtDocId)),
  setPitchArtCollectionId:(collectionId:string) => dispatch(setPitchArtCollectionId(collectionId)),
  setParentPitchArtDocumentData:(data:any) => dispatch(setParentPitchArtDocumentData(data)),
  setCurrentPitchArtDocumentData:(data:any) => dispatch(setCurrentPitchArtDocumentData(data)),
  setCurrentPitchArtVersions:(data:any) => dispatch(setCurrentPitchArtVersions(data)),
  updatePitchArtDetails:(data:any) => dispatch(updatePitchArtDetails(data)),
  setListenedDocuments:(data:any) => dispatch(setListenedDocuments(data))
});

const authCondition = (authUser: any) => !!authUser;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withAuthorization(authCondition)(withRouter(CreatePitchArt as any) as any));
