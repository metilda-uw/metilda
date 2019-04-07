import React, {Component} from 'react';
import {controls, Media, Player} from 'react-media-player';
import "../GlobalStyling.css";
import "./PitchRange.css";

const {PlayPause, MuteUnmute, SeekBar} = controls;

class PitchRange extends Component {
    constructor(props) {
        super(props);
        this.state = {
            minPitch: null,
            maxPitch: null,
            isMinDirty: false,
            isMaxDirty: false
        };
        this.submitMaxPitch = this.submitMaxPitch.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    submitMaxPitch(event) {
        event.preventDefault();
        this.props.applyPitchRange(this.state.minPitch || this.props.initMinPitch,
            this.state.maxPitch || this.props.initMaxPitch);
    }

    handleInputChange(event) {
        const name = event.target.name;
        this.setState({[name]: parseFloat(event.target.value)});

        if (name === 'minPitch') {
            this.setState({isMinDirty: true});
        } else if (name === 'maxPitch') {
            this.setState({isMaxDirty: true});
        }
    }

    enterPressed = (event) => {
        if (event.key === 'Enter') {
            this.submitMaxPitch(event);
        }
    }

    render() {
        let minValue = this.props.initMinPitch;
        if (this.state.isMinDirty) {
            minValue = this.state.minPitch;
        }

        let maxValue = this.props.initMaxPitch;
        if (this.state.isMaxDirty) {
            maxValue = this.state.maxPitch;
        }

        return (
            <div className="metilda-audio-analysis-controls-list-item col s12">
                <label className="group-label">Pitch Range</label>
                <div className="metilda-audio-analysis-controls-list-item-row">
                    <input name="minPitch"
                           id="minPitch"
                           value={minValue}
                           onChange={this.handleInputChange}
                           onKeyPress={this.enterPressed}
                           placeholder="min Hz"
                           className="validate pitch-range-input"
                           pattern="(\d+)(\.\d+)?"
                           required={true}
                           type="text"/>
                    <div>
                        <p>to</p>
                    </div>
                    <input name="maxPitch"
                           id="maxPitch"
                           value={maxValue}
                           onChange={this.handleInputChange}
                           onKeyPress={this.enterPressed}
                           placeholder="max Hz"
                           className="validate pitch-range-input"
                           pattern="(\d+)(\.\d+)?"
                           required={true}
                           type="text"/>
                    <button className="waves-effect waves-light btn"
                            type="submit"
                            onClick={this.submitMaxPitch}>
                        Apply
                    </button>
                </div>


            </div>
        );
    }
}

export default PitchRange;