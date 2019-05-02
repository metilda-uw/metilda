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

interface MatchParams {
    numSyllables: string;
}

interface Props extends RouteComponentProps<MatchParams> {
}

interface State {
    activeWordIndex: number;
    userPitchValueLists: RawPitchValue[][];
    words: MetildaWord[];
    isRecording: boolean;
    isLoadingPitchResults: boolean;
    showPrevPitchValueLists: boolean;
}

function spinner() {
    return (
        <div className="metilda-pitch-art-image-loading">
            <div className="preloader-wrapper big active">
                <div className="spinner-layer spinner-blue-only">
                    <div className="circle-clipper left">
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

class WordSyllableReview extends React.Component<Props, State> {
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
    private pitchArtRef = createRef<PitchArtDrawingWindow>();

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
            showPrevPitchValueLists: false
        };
    }

    wordClicked = (index: number) => {
        this.setState({activeWordIndex: index});
    }

    toggleRecord = () => {
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
            this.recorder.stop().then((result: any) => {
                controller.setState({isLoadingPitchResults: true});
                const formData = new FormData();
                formData.append("file", result.blob);
                fetch(`/api/upload/pitch/range?min-pitch=30.0&max-pitch=300.0`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                    .then((response) => response.json())
                    .then(function(data) {
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
                    });
            });
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
                                    />

                                }
                                {this.state.isLoadingPitchResults && spinner()}
                                <PlayerBar audioUrl={AudioAnalysis.formatAudioUrl(
                                    this.state.words[this.state.activeWordIndex].uploadId,
                                    this.minPitchArtTime(),
                                    this.maxPitchArtTime()
                                )}/>
                                <div className="pitch-art-controls-container">
                                    <button className="waves-effect waves-light btn metilda-btn align-left"
                                            onClick={this.clearPrevious}
                                            disabled={this.state.isRecording
                                                      || this.state.userPitchValueLists.length === 0}>
                                        Clear
                                    </button>
                                    <div className="pitch-art-btn-container">
                                        <button className="waves-effect waves-light btn metilda-btn"
                                                onClick={this.toggleRecord}
                                                disabled={this.state.isLoadingPitchResults}>
                                            {!this.state.isRecording ? "Start Record" : "Stop Record"}
                                        </button>
                                        <button className="waves-effect waves-light btn metilda-btn"
                                                onClick={this.playPitchArt}
                                                disabled={this.state.isRecording}>
                                            Play Tones
                                        </button>
                                        <button className="waves-effect waves-light btn metilda-btn"
                                                onClick={this.saveImage}
                                                disabled={this.state.isRecording}>
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

export default WordSyllableReview;
