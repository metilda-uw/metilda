import "./CreatePitchArt.css";
import { compose } from "recompose";
import * as React from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import PitchArtContainer from "../PitchArtWizard/PitchArtViewer/PitchArtContainer";
import { AppState } from "../store";
import { setLetterPitch } from "../store/audio/actions";
import { AudioAction } from "../store/audio/types";
import { Speaker } from "../types/types";
import AudioAnalysis from "./AudioAnalysis";
import { withAuthorization } from "../Session";
import Header from "../components/header/Header";
import { uploadAudio } from "./ImportUtils";
import { spinner } from "../Utils/LoadingSpinner";
import ReactGA from "react-ga";
import ReactFileReader from "react-file-reader";
import * as DEFAULT from "../constants/create";
import { withRouter } from "react-router-dom";

interface CreatePitchArtProps extends React.Component<CreatePitchArtProps, State> {
  speakers: Speaker[];
  history: any;
  sharedId: any;
  setLetterPitch: (
    speakerIndex: number,
    letterIndex: number,
    newPitch: number
  ) => void;
  firebase: any;
  match: any;
}

interface State {
  // shared: boolean;
  files: any[];
  selectedFolderName: string;
  isLoading: boolean;
  isBeingShared: boolean;
  route: string;
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
}

class CreatePitchArt extends React.Component<
  CreatePitchArtProps,
  State
> {
  constructor(props: CreatePitchArtProps) {
    super(props);
    this.state = {
      files: [],
      selectedFolderName: "Uploads",
      isLoading: false,
      isBeingShared: this.props.match.params.id ? true : false,
      route: this.props.match.params.id + "/state/",
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
      }
    };
  }
  componentDidMount() {

    if (this.state.isBeingShared) {
      const dbRef = this.props.firebase.getCreatePageData(this.props.match.params.id);
      dbRef.on("value", (snapshot) => {
        if (snapshot.val() == null) {
          this.props.history.push({pathname: "/pitchartwizard"});
          alert("Shared Page Has Been Closed");
        } else {
          this.setState({...snapshot.val().state});
          console.log("value" + snapshot.val());
        }
      })
    } else {
      this.getUserFiles();
    }
  }

  updatePitchArtValues = (inputName: string, inputValue: any) => {
    this.setState((prevState) => {
      const state = prevState;
      state.pitchArt[inputName] = inputValue;
      if (this.state.isBeingShared) {
        this.props.firebase.updateValue("state", this.state, this.state.route);
      }
      return state;
    });
    console.log(this.state);
  }

  createSharedPage = () => {
    const newRoute = this.props.firebase.createPage();
    this.setState({ isBeingShared: true });
    this.setState({ route: newRoute });
    this.props.history.push({ pathname: `/pitchartwizard${newRoute}` });
    this.props.firebase.writeDataToPage("state", this.state, newRoute);
  }

  deleteSharedPage = () => {
    this.props.firebase.deletePage(this.state.route);
    this.props.history.push({ pathname: `/pitchartwizard/` });
    this.setState({ isBeingShared: false });
  }

  renderSpeakers = () => {
    return this.props.speakers.map((item, index) => (
      <AudioAnalysis
        speakerIndex={index}
        key={`audio-analysis-${index}-${item.uploadId}`}
        firebase={this.props.firebase}
        files={this.state.files}
        parentCallBack={this.callBackSelectionInterval}
      />
    ));
  };

  formatFileName = (uploadId: string): string => {
    const splitIndex = uploadId.lastIndexOf(".");

    if (splitIndex !== -1) {
      return uploadId.slice(0, splitIndex);
    }

    return uploadId;
  };

  getUserFiles = () => {
    // Get files of a user
    const currentUserId = this.props.firebase.auth.currentUser.email;
    fetch(
      `api/get-files-and-folders/${currentUserId}/${this.state.selectedFolderName}` +
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
          files: data.result.map((item: any) => item),
        })
      );
  };

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
  };

  folderBackButtonClicked = async () => {
    await this.setState({
      selectedFolderName: "Uploads",
    });
    this.getUserFiles();
  };

  callBackSelectionInterval = (childSelectedFolderName: string) => {
    this.setState({
      selectedFolderName: childSelectedFolderName,
    });
    if (this.state.selectedFolderName !== "Uploads") {
      this.getUserFiles();
    }
  };

  render() {

    const { isLoading } = this.state;
    const uploadId = this.props.speakers
      .map((item) => this.formatFileName(item.uploadId))
      .join("_");
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
          <div>
            <button className="SharePage waves-effect waves-light btn globalbtn"
              onClick={!this.state.isBeingShared ? this.createSharedPage : this.deleteSharedPage}>
              <i className="material-icons right">person_add</i>
              {!this.state.isBeingShared ? "Share Page" : "Stop Sharing"}
            </button>
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
                firebase={this.props.firebase}
                speakers={this.props.speakers}
                width={AudioAnalysis.AUDIO_IMG_WIDTH}
                height={AudioAnalysis.AUDIO_IMG_HEIGHT}
                setLetterPitch={this.props.setLetterPitch}
                uploadId={uploadId}
                pitchArt={this.state.pitchArt}
                updatePitchArtValue={this.updatePitchArtValues}
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
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, void, AudioAction>
) => ({
  setLetterPitch: (
    speakerIndex: number,
    letterIndex: number,
    newPitch: number
  ) => dispatch(setLetterPitch(speakerIndex, letterIndex, newPitch)),
});

const authCondition = (authUser: any) => !!authUser;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withAuthorization(authCondition)(withRouter(CreatePitchArt as any) as any));
