import React, {Component} from 'react';
import {controls, Media, Player} from 'react-media-player';

const {PlayPause, MuteUnmute, SeekBar} = controls;

class MaxFrequencyBar extends Component {
    render() {
        return (
            <div>
                <div className="metilda-control-container">
                    <div className="metilda-audio-analysis-image-col-1">
                        Max Frequency
                    </div>
                    <div className="metilda-audio-analysis-image-col-2">
                        <input name="maxPitch"
                               onChange={this.props.handleInputChange}
                               placeholder="Max frequency (ex: 200)"
                               type="text"/>
                    </div>
                    <div className="metilda-audio-analysis-image-col-3">
                        <a className="waves-effect waves-light btn fill-parent vert-center"
                           onClick={this.props.applyMaxPitch}>Apply</a>
                    </div>
                </div>
            </div>
        );
    }
}

export default MaxFrequencyBar;