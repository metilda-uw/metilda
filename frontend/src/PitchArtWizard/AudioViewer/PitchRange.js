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
            errors: [],
            isMinDirty: false,
            isMaxDirty: false
        };
        this.minPitchRef = React.createRef();
        this.maxPitchRef = React.createRef();
        this.submitMaxPitch = this.submitMaxPitch.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    submitMaxPitch(event) {
        if (this.state.errors.length > 0) {
            return;
        }

        this.props.applyPitchRange(parseFloat(this.minPitchRef.current.value),
                                   parseFloat(this.maxPitchRef.current.value));
    }

    validateInput = () => {
        const minPitch = this.minPitchRef.current.value;
        const maxPitch = this.maxPitchRef.current.value;

        const errors = [];
        const invalidValues = [minPitch, maxPitch].filter((value) => isNaN(value) || value <= 0.0);
        if (invalidValues.length > 0) {
            errors.push("Pitch must be a positive number");
        }

        this.setState({errors: errors});

        return errors.length === 0;
    }

    handleInputChange(event) {
        this.validateInput();

        const name = event.target.name;
        let num = parseFloat(event.target.value);

        if (isNaN(num) || num <= 0) {
            this.setState({[name]: ''});
            return;
        }

        this.setState({[name]: num});

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
                <span className="pitch-range-err-list">
                    {this.state.errors.map((item, index) => <p key={index} className="pitch-range-err-list-item">{item}</p>)}
                </span>
                <div className="metilda-audio-analysis-controls-list-item-row">
                    <input name="minPitch"
                           id="minPitch"
                           ref={this.minPitchRef}
                           value={minValue}
                           onChange={(event) => this.handleInputChange(event)}
                           onKeyPress={(event) => this.enterPressed(event)}
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
                           ref={this.maxPitchRef}
                           value={maxValue}
                           onChange={(event) => this.handleInputChange(event)}
                           onKeyPress={(event) => this.enterPressed(event)}
                           placeholder="max Hz"
                           className="validate pitch-range-input"
                           pattern="(\d+)(\.\d+)?"
                           required={true}
                           type="text"/>
                    <button className="waves-effect waves-light btn"
                            type="submit"
                            onClick={(event) => this.submitMaxPitch(event)}>
                        Apply
                    </button>
                </div>


            </div>
        );
    }
}

export default PitchRange;