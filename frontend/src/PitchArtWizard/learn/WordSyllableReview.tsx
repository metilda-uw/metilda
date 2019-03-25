import * as React from 'react';
import './WordSyllableReview.css';
import '../GlobalStyling.css';
import {MetildaWord} from "./types";
import {RouteComponentProps} from "react-router";
import PitchArtDrawingWindow from "../PitchArtDrawingWindow";
import {RawPitchValue} from "../PitchArtViewer/types";
import Recorder from 'recorder-js';
import StaticWordSyallableData from './StaticWordSyallableData';
import {createRef} from "react";
import * as queryString from "query-string";
import PlayerBar from "../AudioViewer/PlayerBar";
import TranscribeAudio from "../TranscribeAudio";
import AudioImgLoading from "../AudioImgLoading";

interface MatchParams {
    numSyllables: string
}

interface Props extends RouteComponentProps<MatchParams> {
}

interface State {
    activeWordIndex: number,
    userPitchValues: Array<RawPitchValue>,
    words: Array<MetildaWord>,
    isLoadingPitchResults: boolean
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
        return 0.2
    }

    private recorder: any;
    private pitchArtRef = createRef<PitchArtDrawingWindow>();

    constructor(props: Props) {
        super(props);
        const values = queryString.parse(this.props.location.search);
        let accentIndex = values['accentIndex'];

        this.state = {
            activeWordIndex: 0,
            userPitchValues: [],
            words: new StaticWordSyallableData().getData(
                parseFloat(this.props.match.params.numSyllables),
                parseFloat(accentIndex as string)
            ),
            isLoadingPitchResults: false
        };
    }

    wordClicked = (index: number) => {
        this.setState({activeWordIndex: index});
    };

    toggleRecord = () => {
        const audioClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        const audioContext = new audioClass();

        if (this.recorder == null) {
            this.recorder = new Recorder(audioContext);
            navigator.mediaDevices.getUserMedia({audio: true})
                .then(stream => this.recorder.init(stream).then(() => this.recorder.start()))
                .catch(err => console.log('Unable to initiate recording', err));
            this.setState({userPitchValues: []});
        } else {
            let controller = this;
            this.recorder.stop().then((result: any) => {
                controller.setState({isLoadingPitchResults: true});
                const formData = new FormData();
                formData.append('file', result.blob);
                fetch(`/api/all-pitches?min-pitch=30.0&max-pitch=300.0`, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                })
                    .then(response => response.json())
                    .then(function (data) {
                        let pitchValues = (data as Array<Array<number>>).map(
                            item => ({t0: item[0], t1: item[0], pitch: item[1]}) as RawPitchValue
                        );
                        console.log(JSON.stringify(data));
                        controller.recorder = null;
                        controller.setState({userPitchValues: pitchValues, isLoadingPitchResults: false});
                    });
            });
        }
    };

    playPitchArt = () => {
        this.pitchArtRef.current!.playPitchArt();
    };

    saveImage = () => {
        this.pitchArtRef.current!.saveImage();
    };

    minPitchArtTime = () => {
        if (this.state.words.length === 0
            || this.state.words[this.state.activeWordIndex].letters.length === 0) {
            return 0;
        }

        return Math.max(
            this.state.words[this.state.activeWordIndex].letters[0].t0 - WordSyllableReview.AUDIO_BUFFER_TIME,
            0);
    };

    maxPitchArtTime = () => {
        if (this.state.words.length === 0
            || this.state.words[this.state.activeWordIndex].letters.length === 0) {
            return 0;
        }

        let numLetters = this.state.words[this.state.activeWordIndex].letters.length;
        return (this.state.words[this.state.activeWordIndex].letters[numLetters - 1].t1
            + WordSyllableReview.AUDIO_BUFFER_TIME);
    };

    pageTitle = () => {
        let syllableStr = `${this.props.match.params.numSyllables} Syllables`;

        const values = queryString.parse(this.props.location.search);
        let accentIndex = parseFloat(values['accentIndex'] as string);
        let accentSuffix: string = "";

        if (accentIndex == 0) {
            accentSuffix = "st"
        } else if (accentIndex == 1) {
            accentSuffix = "nd"
        } else if (accentIndex == 2) {
            accentSuffix = "rd"
        }

        let accentStr = "Accent " + (accentIndex + 1) + accentSuffix + " syllable";
        return syllableStr + ", " + accentStr;
    };

    render() {
        let maxPitchIndex = -1;
        if (this.state.words[this.state.activeWordIndex].letters.length > 1) {
            let letters = this.state.words[this.state.activeWordIndex].letters;

            if (!letters.some(item => item.isWordSep)) {
                let maxValue = Math.max(...letters.map(item => item.pitch));
                maxPitchIndex = letters.map(item => item.pitch).indexOf(maxValue);
            }
        }

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
                            <div id="metilda-word-list" className="col s12">
                                <ul className="collection">
                                    {
                                        this.state.words.map((word, index) =>
                                            <li key={"metilda-word-" + index}
                                                className={"collection-item " + (index == this.state.activeWordIndex ? "active" : "")}
                                                onClick={() => (this.wordClicked(index))}>
                                                {word.uploadId}
                                            </li>
                                        )
                                    }
                                </ul>
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
                                        manualPitchChange={(x, y) => (null)}
                                        maxPitchIndex={maxPitchIndex}
                                        showAccentPitch={true}
                                        showSyllableText={true}
                                        showVerticallyCentered={true}
                                        showPitchArtLines={true}
                                        showLargeCircles={true}
                                        letters={this.state.words[this.state.activeWordIndex].letters}
                                        rawPitchValues={this.state.userPitchValues}
                                    />

                                }
                                {this.state.isLoadingPitchResults && spinner()}
                                <PlayerBar audioUrl={TranscribeAudio.formatAudioUrl(
                                    this.state.words[this.state.activeWordIndex].uploadId,
                                    this.minPitchArtTime(),
                                    this.maxPitchArtTime()
                                )}/>
                                <div className="pitch-art-btn-container">
                                    <button className="waves-effect waves-light btn metilda-btn"
                                            onClick={this.toggleRecord}>
                                        {this.recorder == null ? 'Start Record' : 'Stop Record'}
                                    </button>
                                    <button className="waves-effect waves-light btn metilda-btn"
                                            onClick={this.playPitchArt}>
                                        Play Tones
                                    </button>
                                    <button className="waves-effect waves-light btn metilda-btn"
                                            onClick={this.saveImage}>
                                        Save Image
                                    </button>
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