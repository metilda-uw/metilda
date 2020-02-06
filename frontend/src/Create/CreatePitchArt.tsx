import * as React from "react";
import {connect} from "react-redux";
import {SyntheticEvent} from "react";
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
import FileReaderInput, {Result} from "react-file-reader-input";
import {uploadAudio} from "./ImportUtils";
import {spinner} from "../Utils/LoadingSpinner";
import ReactGA from "react-ga";

export interface CreatePitchArtProps {
    speakers: Speaker[];
    setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) => void;
    firebase: any;
}

interface State {
    files: any[];
    isLoading: boolean;
}

export class CreatePitchArt extends React.Component<CreatePitchArtProps, State> {
    constructor(props: CreatePitchArtProps) {
        super(props);

        this.state = {
            files: [],
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
                firebase={this.props.firebase} files={this.state.files}/>
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
        fetch(`api/get-files/${currentUserId}`
        + "?file-type=Upload", {
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

    fileSelected = async (event: React.ChangeEvent<HTMLInputElement>, results: Result[]) => {
        this.setState({
            isLoading: true,
        });
        try {
            const response = await uploadAudio(results, this.props.firebase);
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

    checkIfSpeakerImportIsOk = (event: SyntheticEvent) => {
        // TO DO:: CHECK IF FILE TRYING TO UPLOAD IS ALREADY PRESENT IN CLOUD OR NOT
        // if (this.props.speakers[this.props.speakerIndex].letters.length === 0) {
        //     return;
        // }

        // const isOk: boolean = confirm(
        //     "The current speaker will be reset.\n\n" +
        //     "Do you want to continue?"
        // );

        // if (!isOk) {
        //     event.preventDefault();
        //     event.stopPropagation();
        // }
    }

    render() {
        const { isLoading } = this.state;
        const uploadId = this.props.speakers.map((item) => this.formatFileName(item.uploadId)).join("_");
        return (
            <div>
            <Header/>
            {isLoading && spinner()}
            <div className="CreatePitchArt">
                <FileReaderInput as="binary" onChange={this.fileSelected}>
                    <button onClick={this.checkIfSpeakerImportIsOk} className="UploadFile waves-effect waves-light btn">
                        <i className="material-icons right">
                            cloud_upload
                        </i>
                        Upload File to cloud
                    </button>
                </FileReaderInput>
                <div className="metilda-page-content">
                    {this.renderSpeakers()}
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
