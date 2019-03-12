import React, {Component} from 'react';
import {controls, Media, Player} from 'react-media-player';
import "../GlobalStyling.css";

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
        this.setState({[name]: event.target.value});

        if (name === 'minPitch') {
            this.setState({isMinDirty: true});
        } else if (name === 'maxPitch') {
            this.setState({isMaxDirty: true});
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
                <div className="row">
                    <form onSubmit={this.submitMaxPitch}>
                        <div className="input-field inline col s4">
                            <input name="minPitch"
                                   id="minPitch"
                                   value={minValue}
                                   onChange={this.handleInputChange}
                                   placeholder="min Hz"
                                   className="validate"
                                   pattern="(\d+)(\.\d+)?"
                                   required={true}
                                   type="text"/>
                        </div>
                        <div className="input-field inline col s1">
                            <p>to</p>
                        </div>
                        <div className="input-field inline col s4">
                            <input name="maxPitch"
                                   id="maxPitch"
                                   value={maxValue}
                                   onChange={this.handleInputChange}
                                   placeholder="max Hz"
                                   className="validate"
                                   pattern="(\d+)(\.\d+)?"
                                   required={true}
                                   type="text"/>
                        </div>
                        <div className="input-field col s2">
                            <button className="waves-effect waves-light btn"
                                    type="submit">Apply
                            </button>
                        </div>
                    </form>
                </div>


            </div>
        );
    }
}

export default PitchRange;