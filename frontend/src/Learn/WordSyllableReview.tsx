import * as queryString from "query-string";
import {ChangeEvent, createRef} from "react";
import * as React from "react";
import {RouteComponentProps} from "react-router";
import Recorder from "recorder-js";
import AudioAnalysis from "../Create/AudioAnalysis";
import PlayerBar from "../PitchArtWizard/AudioViewer/PlayerBar";
import "../PitchArtWizard/GlobalStyling.css";
import PitchArtDrawingWindow from "../PitchArtWizard/PitchArtViewer/PitchArtDrawingWindow";
import {PitchRangeDTO, RawPitchValue} from "../PitchArtWizard/PitchArtViewer/types";
import {Speaker} from "../types/types";
import PitchArtPrevPitchValueToggle from "./PitchArtPrevPitchValueToggle";
import StaticWordSyallableData from "./StaticWordSyallableData";
import {MetildaWord} from "./types";
import "./WordSyllableReview.css";
import { withAuthorization } from "../Session";
import Header from "../Layout/Header";
import {uploadRecording, deleteRecording} from "../Create/ImportUtils";
import {controls, Media, Player} from "react-media-player";

const {PlayPause, SeekBar} = controls;

interface MatchParams {
    numSyllables: string;
}

export interface Props extends RouteComponentProps<MatchParams> {
    firebase: any;
}

interface RecordingEntity {
    recordingUrl: string;
    itemRef: any;
}

interface State {
    activeWordIndex: number;
    userPitchValueLists: RawPitchValue[][];
    words: MetildaWord[];
    isRecording: boolean;
    isLoadingPitchResults: boolean;
    showPrevPitchValueLists: boolean;
    previousRecordings: RecordingEntity[];
}

function spinner() {
    return (
        <div className="metilda-pitch-art-image-loading">
            <div className="preloader-wrapper big active">
                <div className="spinner-layer spinner-blue-only">
                    <div className="circle-clipper center">
                        <div className="circle"></div>
                    </div>
                    <div className="gap-patch">
                        <div className="circle"></div>
                    </div>
                    <div className="circle-clipper right">
                        <div className="circle"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export class WordSyllableReview extends React.Component<Props, State> {
    static get AUDIO_IMG_WIDTH(): number {
        return 653;
    }

    static get DEFAULT_MIN_ANALYSIS_PITCH(): number {
        return 75.0;
    }

    static get DEFAULT_MAX_ANALYSIS_PITCH(): number {
        return 500.0;
    }

    // Amount of time to add at the start and end of a word
    // when playing its audio clip
    static get AUDIO_BUFFER_TIME(): number {
        return 0.2;
    }

    private recorder: any;
    private pitchArtRef = createRef <any> ();

    constructor(props: Props) {
        super(props);
        const values = queryString.parse(this.props.location.search);
        const accentIndex = values.accentIndex;

        this.state = {
            activeWordIndex: 0,
            userPitchValueLists: [],
            words: new StaticWordSyallableData().getData(
                parseFloat(this.props.match.params.numSyllables),
                parseFloat(accentIndex as string)
            ),
            isRecording: false,
            isLoadingPitchResults: false,
            showPrevPitchValueLists: false,
            previousRecordings: []
        };
    }

    componentDidMount() {
        this.getPreviousRecordings();
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.state.activeWordIndex !== prevState.activeWordIndex) {
            this.getPreviousRecordings();
        }
    }

    getPreviousRecordings = async () => {
        this.setState({
            previousRecordings: []
          });
        const recordingWordName = this.state.words[this.state.activeWordIndex].uploadId;
        const storageRef = this.props.firebase.uploadFile();
        const uid = this.props.firebase.auth.currentUser.email;
        const fileRef = storageRef.child(uid + "/Recordings/" + recordingWordName);
        const response = await fileRef.listAll();
        response.items.forEach(async (itemRef: any) => {
             const recordingUrl = await itemRef.getDownloadURL();
             const newRecording = {recordingUrl, itemRef};
             this.setState({
               previousRecordings: [...this.state.previousRecordings, newRecording]
             });
          });
    }

    deleteRecordings = async (itemRef: any) => {
        const isOk: boolean = confirm(
            "Are you sure you want to delete the recording?"
        );
        if (isOk) {
            const responseFromCloud = await deleteRecording(itemRef, this.props.firebase);
            const updatedRecordings = this.state.previousRecordings.filter((recording) =>
             recording.itemRef !== itemRef);
            this.setState({
            previousRecordings: updatedRecordings
        });
        }

    }

    renderPreviousRecordings = () => {
        return this.state.previousRecordings.map((recording, index) => {
            const recordingName = recording.itemRef.location.path.split("_");
            return(
                <Media key={index}>
                <div className="media">
                {recordingName[recordingName.length - 1]}
                    <div className="media-player">
                        <Player src={recording.recordingUrl} vendor="audio"/>
                    </div>
                    <div className="media-controls metilda-control-container">
                        <div className="metilda-previous-recordings-image-col-1">
                            <PlayPause/>
                        </div>
                        <div className="metilda-previous-recordings-image-col-2 vert-center">
                            <SeekBar className="no-border"/>
                        </div>
                        <div className="metilda-previous-recordings-image-col-3">
                        <button className="btn-floating btn-small waves-effect waves-light globalbtn"
                        onClick={() => this.deleteRecordings(recording.itemRef)}>
                            <i className="material-icons right">delete</i>
                        </button>
                        </div>
                    </div>
                </div>
            </Media>);
        });
    }

    wordClicked = (index: number) => {
        this.setState({activeWordIndex: index});
    }

    toggleRecord = async () => {
        const audioClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        const audioContext = new audioClass();

        if (this.recorder == null) {
            this.recorder = new Recorder(audioContext);
            navigator.mediaDevices.getUserMedia({audio: true})
                .then((stream) => this.recorder.init(stream).then(() => this.recorder.start()))
                .catch((err) => console.error("Unable to initiate recording", err));
            this.setState({isRecording: true});
        } else {
            const controller = this;
            const result = await this.recorder.stop();
            controller.setState({isLoadingPitchResults: true});
            const formData = new FormData();
            formData.append("file", result.blob);
            const response = await  fetch(`/api/upload/pitch/range?min-pitch=30.0&max-pitch=300.0`, {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            });
            const data = await response.json();
            const pitchValues: RawPitchValue[] = (data as PitchRangeDTO).pitches.map(
                        (item) => ({t0: item[0], t1: item[0], pitch: item[1]}) as RawPitchValue
                    );
            controller.recorder = null;
            controller.setState(
            {
                    userPitchValueLists: controller.state.userPitchValueLists.concat([pitchValues]),
                    isRecording: false,
                    isLoadingPitchResults: false
            });
            const url = URL.createObjectURL(result.blob);
            const audio = new Audio(url);
            const recording = await audio.play();
            const isOk: boolean = confirm(
                "Do you want to save the recording to cloud?"
            );
            if (isOk) {
                let isValidInput = false;
                let updatedFileName = "";
                let fileName;
                while (!isValidInput) {
                     fileName = prompt("Enter recording name", "Ex: Recording1.wav");
                     if (fileName == null) {
                        // user canceled input
                         break;
                    }

                     updatedFileName = fileName.trim();
                     if (updatedFileName.length === 0) {
                        alert("Recording name should contain at least one character");
                    } else {
                        isValidInput = true;
                    }
                }
                const numberOfSyllables = this.props.match.params.numSyllables;
                const recordingWordName = this.state.words[this.state.activeWordIndex].uploadId;
                if (isValidInput) {
                    try {
                        const uploadResponse = await uploadRecording(result, fileName, numberOfSyllables,
                            recordingWordName, this.props.firebase);
                        this.getPreviousRecordings();
                    } catch (ex) {
                        console.log(ex);
                    }
                } else {
                alert("Recording not uploaded. Recording name is missing");
                }
            }
        }
    }

playPitchArt = () => {
        this.pitchArtRef.current!.playPitchArt();
    }

saveImage = () => {
        this.pitchArtRef.current!.saveImage();
    }

minPitchArtTime = () => {
        if (this.state.words.length === 0
            || this.state.words[this.state.activeWordIndex].letters.length === 0) {
            return 0;
        }

        return Math.max(
            this.state.words[this.state.activeWordIndex].letters[0].t0 - WordSyllableReview.AUDIO_BUFFER_TIME,
            0);
    }

maxPitchArtTime = () => {
        if (this.state.words.length === 0
            || this.state.words[this.state.activeWordIndex].letters.length === 0) {
            return 0;
        }

        const numLetters = this.state.words[this.state.activeWordIndex].letters.length;
        return (this.state.words[this.state.activeWordIndex].letters[numLetters - 1].t1
            + WordSyllableReview.AUDIO_BUFFER_TIME);
    }

pageTitle = () => {
        const syllableStr = `${this.props.match.params.numSyllables} Syllables`;

        const values = queryString.parse(this.props.location.search);
        const accentIndex = parseFloat(values.accentIndex as string);
        let accentSuffix: string = "";

        if (accentIndex === 0) {
            accentSuffix = "st";
        } else if (accentIndex === 1) {
            accentSuffix = "nd";
        } else if (accentIndex === 2) {
            accentSuffix = "rd";
        }

        const accentStr = "Accent " + (accentIndex + 1) + accentSuffix + " syllable";
        return syllableStr + ", " + accentStr;
    }

clearPrevious = () => {
        this.setState({userPitchValueLists: []});
    }

handleInputChange = (event: ChangeEvent) => {
        const target = event.target as HTMLInputElement;

        let value: boolean | File | string;
        if (target.type === "checkbox") {
            value = target.checked;
        } else if (target.type === "file") {
            value = target.files![0];
        } else {
            value = target.value;
        }

        const name = target.name;

        this.setState({[name]: value} as any);
    }

render() {
        const speakers: Speaker[] = [
            {uploadId: "", letters: this.state.words[this.state.activeWordIndex].letters}
        ];
        return (
            <div>
                <Header/>
                <div className="metilda-page-header">
                    <h5>
                        Blackfoot Words > {this.pageTitle()}
                    </h5>
                </div>
                <div className="metilda-page-content">
                    <div className="row">
                        <div className="col s4">
                            <h6 className="metilda-control-header">Word List</h6>
                            <div id="metilda-word-list">
                                <ul className="collection">
                                    {
                                        this.state.words.map((word, index) =>
                                            <li key={"metilda-word-" + index}
                                                className={"collection-item "
                                                        + (index === this.state.activeWordIndex ? "active" : "")}
                                                onClick={() => (this.wordClicked(index))}>
                                                {word.uploadId}
                                            </li>
                                        )
                                    }
                                </ul>
                            </div>
                            <h6 className="metilda-control-header">Previous Recordings</h6>
                            {this.renderPreviousRecordings()}
                            <h6 className="metilda-control-header">Pitch Art</h6>
                            <div className="metilda-pitch-art-container-control-list col s12">
                                <PitchArtPrevPitchValueToggle
                                    handleInputChange={this.handleInputChange}
                                    showPrevPitchValueLists={this.state.showPrevPitchValueLists}/>
                            </div>
                        </div>
                        <div className="col s8">
                            <div className="metilda-syllable-pitch-art">
                                {
                                    this.state.words.length >= 1 &&
                                    <PitchArtDrawingWindow
                                        ref={this.pitchArtRef}
                                        showArtDesign={true}
                                        showDynamicContent={true}
                                        width={WordSyllableReview.AUDIO_IMG_WIDTH}
                                        height={600}
                                        minPitch={WordSyllableReview.DEFAULT_MIN_ANALYSIS_PITCH}
                                        maxPitch={WordSyllableReview.DEFAULT_MAX_ANALYSIS_PITCH}
                                        fileName={this.state.words[this.state.activeWordIndex].uploadId}
                                        setLetterPitch={(x, y, z) => (null)}
                                        showAccentPitch={true}
                                        showSyllableText={true}
                                        showVerticallyCentered={true}
                                        showPitchArtLines={true}
                                        showTimeNormalization={false}
                                        showPitchScale={false}
                                        showPerceptualScale={true}
                                        showLargeCircles={true}
                                        showPitchArtImageColor={true}
                                        showPrevPitchValueLists={this.state.showPrevPitchValueLists}
                                        speakers={speakers}
                                        rawPitchValueLists={this.state.userPitchValueLists}
                                        firebase={this.props.firebase}
                                    />

                                }
                                {this.state.isLoadingPitchResults && spinner()}
                                <PlayerBar audioUrl={AudioAnalysis.formatAudioUrl(
                                    this.state.words[this.state.activeWordIndex].uploadId,
                                    this.minPitchArtTime(),
                                    this.maxPitchArtTime()
                                )}/>
                                <div className="pitch-art-controls-container">
                                    <button className="waves-effect waves-light btn metilda-btn align-left globalbtn"
                                            onClick={this.clearPrevious}
                                            disabled={this.state.isRecording
                                                      || this.state.userPitchValueLists.length === 0}>
                                        Clear
                                    </button>
                                    <div className="pitch-art-btn-container">
                                        <button className="waves-effect waves-light btn metilda-btn globalbtn"
                                                onClick={this.toggleRecord}
                                                disabled={this.state.isLoadingPitchResults}>
                                            {!this.state.isRecording ? "Start Record" : "Stop Record"}
                                        </button>
                                        <button className="waves-effect waves-light btn metilda-btn globalbtn"
                                                onClick={this.playPitchArt}
                                                disabled={this.state.isRecording}>
                                            <i className="material-icons right">
                                                play_circle_filled
                                            </i>
                                            Play Tones
                                        </button>
                                        <button className="waves-effect waves-light btn metilda-btn globalbtn"
                                                onClick={this.saveImage}
                                                disabled={this.state.isRecording}>
                                            <i className="material-icons right">
                                                cloud_upload
                                            </i>
                                            Save Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(WordSyllableReview as any);
