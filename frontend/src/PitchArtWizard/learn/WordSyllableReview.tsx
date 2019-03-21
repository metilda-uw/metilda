import * as React from 'react';
import './WordSyllableReview.css';
import {MetildaWord} from "./types";
import {RouteComponentProps} from "react-router";
import PitchArtDrawingWindow from "../PitchArtDrawingWindow";
import {RawPitchValue} from "../PitchArtViewer/types";

interface MatchParams  {
    numSyllables: string
}

interface Props extends RouteComponentProps<MatchParams> {}

interface State {
    activeWordIndex: number;
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

    constructor(props: Props) {
        super(props);
        this.state = {
            activeWordIndex: 0,
            words: [
                {
                    text: "Onni",
                    letters: [
                        {
                            letter: "ON",
                            t0: 1,
                            t1: 1.1,
                            pitch: 80.0,
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

    render() {
        let rawPitchValues: Array<RawPitchValue> = [
            {t0: 1.0, t1: 1.2, pitch: 80},
            {t0: 2.3, t1: 2.5, pitch: 70},
        ];

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
                                            className={"collection-item " + (index == this.state.activeWordIndex ? "active": "")}
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
                                    rawPitchValues={rawPitchValues}
                                    />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default WordSyllableReview;