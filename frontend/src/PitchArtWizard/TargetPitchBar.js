import React, {Component} from 'react';
import AudioLetter from "./AudioLetter";
import {removeLetter, resetLetters, setLetterSyllable} from "../store/audio/actions/audioAnalysisActions";
import {connect} from "react-redux";

class TargetPitchBar extends Component {
    state = {};

    constructor(props) {
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
        this.props.resetLetters();
    }

    timeCoordToImageCoord(t) {
        // clip times that lie beyond the image boundaries
        if (t < this.props.minAudioTime) {
            return 0;
        } else if (t > this.props.maxAudioTime) {
            return this.props.maxAudioX - this.props.minAudioX;
        }

        let dt = this.props.maxAudioTime - this.props.minAudioTime;
        let u0 = (t - this.props.minAudioTime) / dt;

        let dx = this.props.maxAudioX - this.props.minAudioX;
        let x0 = u0 * dx;

        return x0
    }

    scaleIntervals() {
        // Scale letter intervals to be within the range [0, 1], where
        // 0 is the left side of the selection interval and 1 is the right
        // side of the selection interval.
        let controller = this;
        let intervalsInSelection = this.props.letters.map(function (item) {
            let tooFarLeft = item.t1 < controller.props.minAudioTime;
            let tooFarRight = item.t0 > controller.props.maxAudioTime;
            item.isShown = !(tooFarLeft || tooFarRight)
            return item;
        });

        // Since the letters are relatively positioned, we need to decrement
        // their positions based on all previous letters' widths.
        let prevLetterWidths = 0.0;
        return intervalsInSelection.map(function (item) {
            if (!item.isShown) {
                return item;
            }

            let itemCopy = Object.assign({}, item);
            itemCopy.leftX = controller.timeCoordToImageCoord(itemCopy.t0) - prevLetterWidths;
            itemCopy.rightX = controller.timeCoordToImageCoord(itemCopy.t1) - prevLetterWidths;

            prevLetterWidths += itemCopy.rightX - itemCopy.leftX;

            // transform letter interval into new time scale
            // clip boundaries to prevent overflow
            return itemCopy;
        });
    }

    targetPitchSelected(index) {
        this.setState({selectedIndex: index});
        this.props.targetPitchSelected(index);
    }

    removeLetterEvent() {
        this.props.removeLetter(this.state.selectedIndex);
        this.setState({selectedIndex: -1});
        this.props.targetPitchSelected(-1);
    }

    setLetterSyllableEvent() {
        let isValidInput = false;
        let syllable = "";

        while (!isValidInput) {
            let response = prompt("Enter syllable text", "X");

            if (response == null) {
                // user canceled input
                return
            }

            syllable = response.trim();
            if (syllable.length === 0) {
                alert("Syllable should contain at least one character");
            } else {
                isValidInput = true;
            }
        }

        this.props.setLetterSyllable(this.state.selectedIndex, syllable);
        this.setState({selectedIndex: -1});
        this.props.targetPitchSelected(-1);
    }

    render() {
        let controller = this;
        let letters = this.scaleIntervals();
        return (
            <div>
                <div className="metilda-control-container">
                    <div className="metilda-audio-analysis-image-col-1">
                        <span>Target Pitch</span>
                    </div>
                    <div className="metilda-audio-analysis-image-col-2 metilda-audio-analysis-letter-container">
                        {
                            letters.map(function (item, index) {
                                if (!item.isShown) {
                                    return;
                                }

                                return <AudioLetter key={index}
                                                    letter={item.letter}
                                                    leftX={item.leftX}
                                                    rightX={item.rightX}
                                                    isSelected={index === controller.state.selectedIndex}
                                                    isWordSep={item.isWordSep}
                                                    onClick={() => controller.targetPitchSelected(index)}/>
                            })
                        }
                    </div>
                    <div className="metilda-audio-analysis-image-col-3">
                    </div>
                </div>
                <div className="right-align">
                    <button className="btn waves-effect waves-light m-r-16"
                            type="submit"
                            name="action"
                            disabled={this.state.selectedIndex === -1}
                            onClick={this.setLetterSyllableEvent}>
                        Set Syllable
                    </button>
                    <button className="btn waves-effect waves-light m-r-16"
                            type="submit"
                            name="action"
                            disabled={this.state.selectedIndex === -1}
                            onClick={this.removeLetterEvent}>
                        Remove
                    </button>
                    <button className="btn waves-effect waves-light"
                            type="submit"
                            name="action"
                            disabled={this.props.letters.length === 0}
                            onClick={this.resetAllLettersEvent}>
                        Reset
                    </button>
                </div>
            </div>

        );
    }
}

const mapStateToProps = (state) => ({
    letters: state.audioAnalysisReducer.letters
});

const mapDispatchToProps = dispatch => ({
    removeLetter: (index) => dispatch(removeLetter(index)),
    resetLetters: () => dispatch(resetLetters()),
    setLetterSyllable: (index, syllable) => dispatch(setLetterSyllable(index, syllable))
});

export default connect(mapStateToProps, mapDispatchToProps)(TargetPitchBar);