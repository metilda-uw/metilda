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
import { uploadAudio } from "./ImportUtils";
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
  setPitchArtCollectionId
} from "../store/pitchArt/pitchArtActions";
import PitchArtVersionSelector from "./PitchArtVersionSelector";

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
  currentCollectionId: string;
  currentDocumentId: string;
  setPitchArtDocId:(Id:string) => void;
  setPitchArtCollectionId:(Id:string) =>void;
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
  private listenedDocIds = [];
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
      this.getUserFiles();
    }
  }

  listenForData(collectionId:string,docId:string) {
   // const id = this.props.match.params.id ? this.props.match.params.id : "";
    if(this.listenedDocIds.includes(docId)) return;
    this.listenedDocIds.push(docId);
    this.props.firebase.firestore.collection(collectionId).doc(docId)
      .onSnapshot((doc) => {
        if (doc.data()) {
          const newSpeakers = doc.data().speakers === undefined ? [{ uploadId: "" }] : doc.data().speakers;
          newSpeakers.forEach((speaker) => {
            if (speaker.letters === undefined) { speaker.letters = []; }
          });
          this.props.replaceSpeakers(newSpeakers as Speaker[]);
          this.setState({ ...doc.data() },
            () => { this.getUserFiles(); });
          this.props.setPitchArtDocId(docId);
          this.props.setPitchArtCollectionId(collectionId);
        } else {
          this.setState({ owner: this.props.firebase.auth.currentUser.email });
          this.props.history.push({ pathname: "/pitchartwizard" });
          alert("The page no longer exists");
          window.location.reload();
        }
      });
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

  loadPitchArtVersions = () =>{
    console.log("Inside load pitch art versions");

    console.log(this.props.currentCollectionId);

    let wordsInCollection;

    this.props.firebase.firestore
      .collection(this.props.currentCollectionId)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          // setWords([]);
        } else {
          // querySnapshot.forEach((doc) => {
            //  creates an array of words in the collection
            const wordsInCollection = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              data: doc.data(),
            }));
            console.log("wordsCollection", wordsInCollection);
           // const currentDoc = wordsInCollection.get()
            const currentDocData = wordsInCollection.find((doc)=> doc.id === this.props.currentDocumentId);

            console.log("currentDocData ::", currentDocData);

            let currentDocVersions = [];

            if(currentDocData != null){
              currentDocVersions = wordsInCollection.filter((doc) => doc.data.parentDocumentId === currentDocData.data.parentDocumentId);
              currentDocVersions.push(wordsInCollection.find((doc)=> doc.id === currentDocData.data.parentDocumentId));
            }

            console.log("currentDocVersions :: ", currentDocVersions);
            this.renderVersionsModal(currentDocVersions);


            
            // console.log("arr ", arr);
         // });
        }
        // setUpdate(false);
      })
      .then(() => {
        // setIsLoading(false);
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });

    
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

  renderVersionsModal= (words) => {
      const modal = document.querySelector('.version-overlay');
      const pitchArtVersionSelector = <PitchArtVersionSelector words={words} removeVersionsModal={this.removeVersionsModal} 
        collectionId={this.props.currentCollectionId} firebase={this.props.firebase}/>;

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
  currentDocumentId: state.pitchArtDetails.pitchArtDocId
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
  setPitchArtDocId:(pitchArtDocId: string) => dispatch(setPitchArtDocId(pitchArtDocId)),
  setPitchArtCollectionId:(collectionId:string) => dispatch(setPitchArtCollectionId(collectionId))

});

const authCondition = (authUser: any) => !!authUser;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withAuthorization(authCondition)(withRouter(CreatePitchArt as any) as any));
