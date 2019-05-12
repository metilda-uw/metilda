import React, {Component} from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import {AppState} from "../store";
import {removeLetter, resetLetters, setLetterSyllable} from "../store/audio/actions";
import {AudioAction} from "../store/audio/types";
import {Letter, Speaker} from "../types/types";
import AudioLetter from "./AudioLetter";

export interface TargetPitchBarProps {
    speakers: Speaker[];
    speakerIndex: number;
    minAudioTime: number;
    maxAudioTime: number;
    minAudioX: number;
    maxAudioX: number;
    targetPitchSelected: (letterIndex: number) => void;
    removeLetter: (speakerIndex: number, index: number) => void;
    resetLetters: (speakerIndex: number) => void;
    setLetterSyllable: (speakerIndex: number, index: number, syllable: string) => void;
}

interface State {
    selectedIndex: number;
}

interface PitchBarLetter extends Letter {
    isShown: boolean;
    leftX: number;
    rightX: number;
}

export class TargetPitchBar extends Component<TargetPitchBarProps, State> {
    constructor(props: TargetPitchBarProps) {
        super(props);
        this.state = {
            selectedIndex: -1
        };
        this.timeCoordToImageCoord = this.timeCoordToImageCoord.bind(this);
        this.targetPitchSelected = this.targetPitchSelected.bind(this);
        this.scaleIntervals = this.scaleIntervals.bind(this);
        this.removeLetterEvent = this.removeLetterEvent.bind(this);
        this.resetAllLettersEvent = this.resetAllLettersEvent.bind(this);
        this.setLetterSyllableEvent = this.setLetterSyllableEvent.bind(this);
    }

    resetAllLettersEvent() {
        this.props.resetLetters(this.props.speakerIndex);
    }

    timeCoordToImageCoord(t: number) {
        // clip times that lie beyond the image boundaries
        if (t < this.props.minAudioTime) {
            return 0;
        } else if (t > this.props.maxAudioTime) {
            return this.props.maxAudioX - this.props.minAudioX;
        }

        const dt = this.props.maxAudioTime - this.props.minAudioTime;
        const u0 = (t - this.props.minAudioTime) / dt;

        const dx = this.props.maxAudioX - this.props.minAudioX;
        const x0 = u0 * dx;

        return x0;
    }

    scaleIntervals(): PitchBarLetter[] {
        // Scale letter intervals to be within the range [0, 1], where
        // 0 is the left side of the selection interval and 1 is the right
        // side of the selection interval.
        const controller = this;
        const intervalsInSelection: PitchBarLetter[] = this.props.speakers[this.props.speakerIndex].letters.map(
            function(item: Letter) {
                const pitchBarLetter: PitchBarLetter = Object.assign(
                    {leftX: -1, rightX: -1, isShown: false}, item
                );
                const tooFarLeft = pitchBarLetter.t1 < controller.props.minAudioTime;
                const tooFarRight = pitchBarLetter.t0 > controller.props.maxAudioTime;
                pitchBarLetter.isShown = !(tooFarLeft || tooFarRight);
                return pitchBarLetter;
            });

        // Since the letters are relatively positioned, we need to decrement
        // their positions based on all previous letters' widths.
        let prevLetterWidths = 0.0;
        return intervalsInSelection.map(function(item) {
            if (!item.isShown) {
                return item;
            }

            const itemCopy = Object.assign({}, item);
            itemCopy.leftX = controller.timeCoordToImageCoord(itemCopy.t0) - prevLetterWidths;
            itemCopy.rightX = controller.timeCoordToImageCoord(itemCopy.t1) - prevLetterWidths;

            prevLetterWidths += itemCopy.rightX - itemCopy.leftX;

            // transform letter interval into new time scale
            // clip boundaries to prevent overflow
            return itemCopy;
        });
    }

    targetPitchSelected(letterIndex: number) {
        this.setState({selectedIndex: letterIndex});
        this.props.targetPitchSelected(letterIndex);
    }

    removeLetterEvent() {
        this.props.removeLetter(this.props.speakerIndex, this.state.selectedIndex);
        this.setState({selectedIndex: -1});
        this.props.targetPitchSelected(-1);
    }

    setLetterSyllableEvent() {
        let isValidInput = false;
        let syllable = "";

        while (!isValidInput) {
            const response = prompt("Enter syllable text", "X");

            if (response == null) {
                // user canceled input
                return;
            }

            syllable = response.trim();
            if (syllable.length === 0) {
                alert("Syllable should contain at least one character");
            } else {
                isValidInput = true;
            }
        }

        this.props.setLetterSyllable(this.props.speakerIndex, this.state.selectedIndex, syllable);
        this.setState({selectedIndex: -1});
        this.props.targetPitchSelected(-1);
    }

    render() {
        const controller = this;
        const letters = this.scaleIntervals();
        return (
            <div className="TargetPitchBar">
                <div className="metilda-control-container metilda-target-pitch-bar">
                    <div className="metilda-audio-analysis-image-col-1">
                        <span>Target Pitch</span>
                    </div>
                    <div className="metilda-audio-analysis-image-col-2 metilda-audio-analysis-letter-container">
                        {
                            letters.map(function(item, index) {
                                if (!item.isShown) {
                                    return;
                                }

                                return <AudioLetter key={index}
                                                    letter={item.syllable}
                                                    leftX={item.leftX}
                                                    rightX={item.rightX}
                                                    isSelected={index === controller.state.selectedIndex}
                                                    isWordSep={item.isWordSep}
                                                    onClick={() => controller.targetPitchSelected(index)}/>;
                            })
                        }
                    </div>
                    <div className="metilda-audio-analysis-image-col-3">
                    </div>
                </div>
                <div className="right-align">
                    <button className="TargetPitchBar-set-syllable btn waves-effect waves-light m-r-16"
                            type="submit"
                            name="action"
                            disabled={this.state.selectedIndex === -1}
                            onClick={this.setLetterSyllableEvent}>
                        Set Syllable
                    </button>
                    <button className="TargetPitchBar-remove-letter btn waves-effect waves-light m-r-16"
                            type="submit"
                            name="action"
                            disabled={this.state.selectedIndex === -1}
                            onClick={this.removeLetterEvent}>
                        Remove
                    </button>
                    <button className="TargetPitchBar-clear-letter btn waves-effect waves-light"
                            type="submit"
                            name="action"
                            disabled={this.props.speakers[this.props.speakerIndex].letters.length === 0}
                            onClick={this.resetAllLettersEvent}>
                        Clear
                    </button>
                </div>
            </div>

        );
    }
}

const mapStateToProps = (state: AppState) => ({
    speakers: state.audio.speakers
});

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, void, AudioAction>) => ({
    removeLetter: (speakerIndex: number, index: number) => dispatch(removeLetter(speakerIndex, index)),
    resetLetters: (speakerIndex: number) => dispatch(resetLetters(speakerIndex)),
    setLetterSyllable: (speakerIndex: number, index: number, syllable: string) =>
        dispatch(setLetterSyllable(speakerIndex, index, syllable))
});

export default connect(mapStateToProps, mapDispatchToProps)(TargetPitchBar);
