import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import {controls, Media, Player} from 'react-media-player';

const {PlayPause, MuteUnmute, SeekBar} = controls;

class MaxFrequencyBar extends Component {
    constructor(props) {
        super(props);
        this.submitMaxPitch = this.submitMaxPitch.bind(this);
    }

    submitMaxPitch(event) {
        event.preventDefault();
        this.props.applyMaxPitch();
    }

    render() {
        return (
            <div className="col s12">
                <div className="row">
                    <form onSubmit={this.submitMaxPitch}>
                        <div className="input-field col s9">
                            <input name="maxPitch"
                                   id="maxPitch"
                                   onChange={this.props.handleInputChange}
                                   placeholder="hertz"
                                   className="validate"
                                   pattern="(\d+)?(\.\d+)?"
                                   type="text"/>
                            <label className="active" htmlFor="maxPitch">Pitch Ceiling</label>
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

export default MaxFrequencyBar;