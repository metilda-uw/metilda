import * as React from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import PitchArtContainer from "../PitchArtWizard/PitchArtViewer/PitchArtContainer";
import {AppState} from "../store";
import {setLetterPitch} from "../store/audio/actions";
import {AudioAction} from "../store/audio/types";
import {Speaker} from "../types/types";
import AudioAnalysis from "./AudioAnalysis";
import { withAuthorization } from "../Session";
import "./CreatePitchArt.css";
import Header from "../Layout/Header";
import {uploadAudio} from "./ImportUtils";
import {spinner} from "../Utils/LoadingSpinner";
import ReactGA from "react-ga";
import ReactFileReader from "react-file-reader";

export interface CreatePitchArtProps {
    speakers: Speaker[];
    setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) => void;
    firebase: any;
}

interface State {
    files: any[];
    selectedFolderName: string;
    isLoading: boolean;
}

export class CreatePitchArt extends React.Component<CreatePitchArtProps, State> {
    constructor(props: CreatePitchArtProps) {
        super(props);

        this.state = {
            files: [],
            selectedFolderName: "Uploads",
            isLoading: false,
        };
    }
    componentDidMount() {
        this.getUserFiles();
    }

    renderSpeakers = () => {
        return (
            this.props.speakers.map((item, index) =>
                <AudioAnalysis speakerIndex={index} key={`audio-analysis-${index}-${item.uploadId}`}
                firebase={this.props.firebase} files={this.state.files}
                parentCallBack={this.callBackSelectionInterval}/>
            )
        );
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
        const currentUserId = this.props.firebase.auth.currentUser.email;
        fetch(`api/get-files-and-folders/${currentUserId}/${this.state.selectedFolderName}`
        + "?file-type1=Folder&file-type2=Upload", {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => this.setState({
            files: data.result.map((item: any) =>
            item)}));
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
                action: "User pressed Upload File button"
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
        this.setState ({
            selectedFolderName: childSelectedFolderName,
        });
        if (this.state.selectedFolderName !== "Uploads") {
            this.getUserFiles();
        }
    }

    render() {
        const { isLoading } = this.state;
        const uploadId = this.props.speakers.map((item) => this.formatFileName(item.uploadId)).join("_");
        return (
            <div>
            <Header/>
            {isLoading && spinner()}
            <div className="CreatePitchArt">
                <ReactFileReader fileTypes={[".wav"]} multipleFiles={false} handleFiles={this.fileSelected}>
                    <button className="UploadFile waves-effect waves-light btn globalbtn">
                        <i className="material-icons right">
                            cloud_upload
                        </i>
                        Upload File to cloud
                    </button>
                    </ReactFileReader>
                <div className="metilda-page-content">
                    <div id="button-drop-down-image-side-by-side">
                        <div id="metilda-drop-down-back-button">
                            {this.state.selectedFolderName === "Uploads" &&
                            <button className="audioBackButtonDisabled"  disabled={true}>
                                <i className="material-icons">arrow_back</i>
                            </button>
                            }
                            {this.state.selectedFolderName !== "Uploads" &&
                            <button className="audioBackButton" onClick={() => this.folderBackButtonClicked()}>
                                <i className="material-icons">arrow_back</i>
                            </button>
                            }
                        </div>
                        <div id="drop-down-and-image">
                            {this.renderSpeakers()}
                        </div>
                    </div>
                    <div className="row">
                        <PitchArtContainer
                            firebase={this.props.firebase}
                            speakers={this.props.speakers}
                            width={AudioAnalysis.AUDIO_IMG_WIDTH}
                            height={500}
                            setLetterPitch={this.props.setLetterPitch}
                            uploadId={uploadId}/>
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

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, void, AudioAction>) => ({
    setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) =>
        dispatch(setLetterPitch(speakerIndex, letterIndex, newPitch)),
});

const authCondition = (authUser: any) => !!authUser;
export default connect(mapStateToProps, mapDispatchToProps)(withAuthorization(authCondition)(CreatePitchArt as any));
