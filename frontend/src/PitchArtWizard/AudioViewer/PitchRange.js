import React, {Component} from 'react';
import {controls, Media, Player} from 'react-media-player';
import "../GlobalStyling.css";

const {PlayPause, MuteUnmute, SeekBar} = controls;

class PitchRange extends Component {
    constructor(props) {
        super(props);
        this.submitMaxPitch = this.submitMaxPitch.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    submitMaxPitch(event) {
        event.preventDefault();
        this.props.applyPitchRange();
    }

    handleInputChange(event) {
        try {
            event.target.value = parseFloat(event.target.value);
        } catch(e) {
            console.log("parse error: "  + e);
        }

        this.props.handleInputChange(event);
    }

    render() {
        return (
            <div className="metilda-audio-analysis-controls-list-item col s12">
                <label className="group-label">Pitch Range</label>
                <div className="row">
                    <form onSubmit={this.submitMaxPitch}>
                        <div className="input-field inline col s4">
                            <input name="minPitch"
                                   id="minPitch"
                                   value={this.props.initMinPitch}
                                   onChange={this.props.handleInputChange}
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
                                   value={this.props.initMaxPitch}
                                   onChange={this.props.handleInputChange}
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