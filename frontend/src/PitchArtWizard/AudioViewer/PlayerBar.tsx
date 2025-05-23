import * as React from "react";
import {controls, Media, Player} from "react-media-player";

const {PlayPause, SeekBar, MuteUnmute, Volume,} = controls;

interface Props {
    audioUrl: string;
}

class PlayerBar extends React.Component<Props> {
    render() {
        return (
            <div>
                {/* <Media>
                        <div className="media">
                            <div className="media-player">
                                <Player src={this.props.audioUrl} vendor="audio"/>
                            </div>
                            <div className="media-controls metilda-control-container">
                                <div className="metilda-audio-analysis-image-col-11">
                                    <PlayPause/>
                                </div>
                                <div className="metilda-audio-analysis-image-col-2 vert-center">
                                    <MuteUnmute/>
                                </div>
                                <div className="metilda-audio-analysis-image-col-2 vert-center">
                                    <SeekBar className="no-border"/>
                                </div>
                                <Volume />
                            </div>
                        </div>
                </Media> */}
                <Media>
                {({ mediaProps, player }) => (
                    <div className="media">
                        <div className="media-player">
                            <Player src={this.props.audioUrl} vendor="audio" />
                        </div>
                        <div className="media-controls metilda-control-container">
                            <div className="metilda-audio-analysis-image-col-11">
                                <PlayPause />
                            </div>
                       
                            <div className="metilda-audio-analysis-image-col-2 vert-center">
                                <SeekBar className="no-border" />
                            </div>

                        </div>
                        <div className="metilda-audio-analysis-volume-control-col-2 vert-center m-a-8">
                            <div className="metilda-audio-analysis-volume-btn">
                                <MuteUnmute />
                            </div>
                            <Volume />
                            
                        </div>
                    </div>
                )}
                </Media>

            </div>
        );
    }
}

export default PlayerBar;
