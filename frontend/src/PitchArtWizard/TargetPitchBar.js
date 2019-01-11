import React, {Component} from 'react';
import AudioLetter from "./AudioLetter";

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
    }

    timeCoordToImageCoord(t) {
        // clip times that lie beyond the image boundaries
        if (t < this.props.minAudioTime) {
            return this.props.minAudioX;
        } else if (t > this.props.maxAudioTime) {
            return this.props.maxAudioX;
        }

        let dt = this.props.maxAudioTime - this.props.minAudioTime;
        let u0 = (t - this.props.minAudioTime) / dt;

        let dx = this.props.maxAudioX - this.props.minAudioX;
        let x0 = this.props.minAudioX + (u0 * dx);

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

        return intervalsInSelection.map(function (item) {
            if (!item.isShown) {
                return item;
            }

            let itemCopy = Object.assign({}, item);

            itemCopy.leftX = controller.timeCoordToImageCoord(itemCopy.t0);
            itemCopy.rightX = controller.timeCoordToImageCoord(itemCopy.t1);

            // transform letter interval into new time scale
            // clip boundaries to prevent overflow
            return itemCopy;
        });
    }

    targetPitchSelected(index) {
        this.setState({selectedIndex: index});
    }

    removeLetterEvent() {
        this.props.removeLetter(this.state.selectedIndex);
        this.setState({selectedIndex: -1});
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
                    <div className="metilda-audio-analysis-image-col-2">
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
                            onClick={this.removeLetterEvent}>
                        Remove
                    </button>
                    <button className="btn waves-effect waves-light"
                            type="submit"
                            name="action"
                            disabled={this.props.letters.length === 0}
                            onClick={this.props.resetAllLetters}>
                        Reset
                    </button>
                </div>
            </div>

        );
    }
}

export default TargetPitchBar;