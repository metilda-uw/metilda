import React, {Component} from 'react';
import {controls, Media, Player} from 'react-media-player';
const {PlayPause, MuteUnmute, SeekBar} = controls;

class PlayerBar extends Component {
    render() {
        return (
            <div>
                <Media>
                    <div className="media">
                        <div className="media-player">
                            <Player src={this.props.audioUrl} vendor="audio"/>
                        </div>
                        <div className="media-controls metilda-control-container">
                            <div className="metilda-audio-analysis-image-col-1">
                                <PlayPause/>
                            </div>
                            <div className="metilda-audio-analysis-image-col-2 vert-center">
                                <SeekBar className="no-border"/>
                            </div>
                            <div className="metilda-audio-analysis-image-col-3">
                            </div>
                        </div>
                    </div>
                </Media>
            </div>
        );
    }
}

export default PlayerBar;