import React, {Component} from 'react';
import {controls, Media, Player} from 'react-media-player';

const {PlayPause, MuteUnmute, SeekBar} = controls;

class MaxFrequencyBar extends Component {
    render() {
        return (
            <div className="col s12">
                <div className="row">
                    <div className="input-field col s9">
                        <input name="maxPitch"
                               id="maxPitch"
                               onChange={this.props.handleInputChange}
                               placeholder="hertz"
                               className="validate"
                               pattern="(\d+)?(\.\d+)?"
                               type="text"/>
                        <label htmlFor="maxPitch">Pitch Ceiling</label>
                        <span className="helper-text" data-error="Must be a positive number"></span>
                    </div>
                    <div className="input-field col s2">
                        <button className="waves-effect waves-light btn"
                           onClick={this.props.applyMaxPitch}>Apply</button>
                    </div>
                </div>


            </div>
        );
    }
}

export default MaxFrequencyBar;