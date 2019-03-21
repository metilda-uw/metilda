import * as React from 'react';
import './WordSyllableReview.css';
import {MetildaWord} from "./types";
import {RouteComponentProps} from "react-router";
import PitchArtDrawingWindow from "../PitchArtDrawingWindow";
import {RawPitchValue} from "../PitchArtViewer/types";
import Recorder from 'recorder-js';

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
                }
            ]
        };
    }

    wordClicked = (index: number) => {
        this.setState({activeWordIndex: index});
    };

    toggleRecord = () => {
        const audioClass =  (window as any).AudioContext || (window as any).webkitAudioContext;
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
                const formData = new FormData();
                formData.append('file', result.blob);
                fetch(`/api/all-pitches`, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                })
                .then(response => response.json())
                .then(function(data) {
                    let pitchValues = (data as Array<Array<number>>).map(
                        item => ({t0: item[0], t1: item[0], pitch: item[1]}) as RawPitchValue
                    );
                    controller.recorder = null;
                    controller.setState({userPitchValues: pitchValues});
                });
            });
        }
    };

    render() {

        return (
            <div>
                <ol className="metilda-breadcrumb-list">
                    <li className="metilda-breadcrumb-list-item">
                        Blackfoot Syllables
                    </li>
                    <li className="metilda-breadcrumb-list-item">
                        >
                    </li>
                    <li className="metilda-breadcrumb-list-item">
                        {this.props.match.params.numSyllables} Syllables
                    </li>
                </ol>
                <div id="metilda-syllable-view">
                    <div className="row">
                        <div className="col s4">
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
                        <div className="col s8">
                            <div className="metilda-syllable-pitch-art">
                                <PitchArtDrawingWindow
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
                                        {this.recorder == null ? 'Start Record': 'Stop Record'}
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