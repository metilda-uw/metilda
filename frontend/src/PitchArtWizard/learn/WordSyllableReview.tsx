import * as React from 'react';
import './WordSyllableReview.css';
import '../GlobalStyling.css';
import {MetildaWord} from "./types";
import {RouteComponentProps} from "react-router";
import PitchArtDrawingWindow from "../PitchArtDrawingWindow";
import {RawPitchValue} from "../PitchArtViewer/types";
import Recorder from 'recorder-js';
import {createRef} from "react";

interface MatchParams {
    numSyllables: string
}

interface Props extends RouteComponentProps<MatchParams> {
}

interface State {
    activeWordIndex: number,
    userPitchValues: Array<RawPitchValue>,
    words: Array<MetildaWord>
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

    private recorder: any;
    private pitchArtRef = createRef<PitchArtDrawingWindow>();

    constructor(props: Props) {
        super(props);
        this.state = {
            activeWordIndex: 0,
            userPitchValues: [],
            words: [
                {
                    text: "Onni",
                    letters: [
                        {
                            letter: "ON",
                            t0: 1,
                            t1: 1.1,
                            pitch: 90.0,
                            isManualPitch: false,
                            isWordSep: false
                        },
                        {
                            letter: "NI",
                            t0: 2,
                            t1: 2.3,
                            pitch: 70.0,
                            isManualPitch: false,
                            isWordSep: false
                        }
                    ]
                },
                {
                    text: "Isska",
                    letters: [
                        {
                            letter: "IS",
                            t0: 1,
                            t1: 1.1,
                            pitch: 90.0,
                            isManualPitch: false,
                            isWordSep: false
                        },
                        {
                            letter: "SKA",
                            t0: 2,
                            t1: 2.3,
                            pitch: 60.0,
                            isManualPitch: false,
                            isWordSep: false
                        }
                    ]
                },
                {
                    text: "Kayiis",
                    letters: [
                        {
                            letter: "KAY",
                            t0: 1,
                            t1: 1.1,
                            pitch: 120.0,
                            isManualPitch: false,
                            isWordSep: false
                        },
                        {
                            letter: "IIS",
                            t0: 2,
                            t1: 2.3,
                            pitch: 60.0,
                            isManualPitch: false,
                            isWordSep: false
                        }
                    ]
                },
                {
                    text: "Saaakohmappiwa",
                    letters: [
                        {
                            letter: "SAH",
                            t0: 0.5715557612244353,
                            t1: 0.5715557612244353,
                            pitch: 79.4,
                            isManualPitch: false,
                            isWordSep: false
                        },
                        {
                            letter: "KOH",
                            t0: 1.011578934170736,
                            t1: 1.011578934170736,
                            pitch: 99.26,
                            isManualPitch: false,
                            isWordSep: false
                        },
                        {
                            letter: "MAP",
                            t0: 1.2641848297510196,
                            t1: 1.2641848297510196,
                            pitch: 67.96,
                            isManualPitch: false,
                            isWordSep: false
                        },
                        {
                            letter: "PI",
                            t0: 1.5982764980991369,
                            t1: 1.5982764980991369,
                            pitch: 65.64,
                            isManualPitch: false,
                            isWordSep: false
                        }
                    ]
                }
            ]
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
                console.log(result);
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
                        controller.setState({userPitchValues: pitchValues});
                    });
            });
        }
    };

    playPitchArt = () => {
        this.pitchArtRef.current!.playPitchArt();
    };

    render() {

        return (
            <div>
                <div className="metilda-page-header">
                    <h5>
                        Blackfoot Syllables > {this.props.match.params.numSyllables} Syllables
                    </h5>
                </div>
                <div className="metilda-page-content">
                    <div className="row">
                        <div className="col s4">
                            <div className="col s12">
                                <ul className="collection">
                                    {
                                        this.state.words.map((word, index) =>
                                            <li key={"metilda-word-" + index}
                                                className={"collection-item " + (index == this.state.activeWordIndex ? "active" : "")}
                                                onClick={() => (this.wordClicked(index))}>
                                                {word.text}
                                            </li>
                                        )
                                    }
                                </ul>
                            </div>
                        </div>
                        <div className="col s8">
                            <div className="metilda-syllable-pitch-art">
                                <PitchArtDrawingWindow
                                    ref={this.pitchArtRef}
                                    isVisible={true}
                                    width={WordSyllableReview.AUDIO_IMG_WIDTH}
                                    height={600}
                                    minPitch={WordSyllableReview.DEFAULT_MIN_ANALYSIS_PITCH}
                                    maxPitch={WordSyllableReview.DEFAULT_MAX_ANALYSIS_PITCH}
                                    fileName={this.state.words[this.state.activeWordIndex].text}
                                    manualPitchChange={(x, y) => (null)}
                                    maxPitchIndex={-1}
                                    showAccentPitch={false}
                                    showSyllableText={true}
                                    showVerticallyCentered={true}
                                    showPitchArtLines={true}
                                    showLargeCircles={true}
                                    letters={this.state.words[this.state.activeWordIndex].letters}
                                    rawPitchValues={this.state.userPitchValues}
                                />
                                <div className="pitch-art-btn-container">
                                    <button className="waves-effect waves-light btn metilda-btn"
                                            onClick={this.toggleRecord}>
                                        {this.recorder == null ? 'Start Record' : 'Stop Record'}
                                    </button>
                                    <button className="waves-effect waves-light btn metilda-btn"
                                            onClick={this.playPitchArt}>
                                        Play
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