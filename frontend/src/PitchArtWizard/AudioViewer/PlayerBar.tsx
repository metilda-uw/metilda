import * as React from "react";
import {controls, Media, Player} from "react-media-player";

const {PlayPause, SeekBar} = controls;

interface Props {
    audioUrl: string;
}

class PlayerBar extends React.Component<Props> {
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
