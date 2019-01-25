import React, {Component} from 'react';
import PitchArtDrawingWindow from "../PitchArtDrawingWindow";
import PitchArt from "../PitchArt";
import TranscribeAudio from "../TranscribeAudio";
import AccentPitchToggle from "./AccentPitchToggle";
import "./PitchArtContainer.css";

class PitchArtContainer extends Component {
    state = {};

    constructor(props) {
        super(props);
        this.pitchArtLetters = this.props.letters.map(item => Object.assign({startTime: item.t0 * this.props.soundLength}, item));
        let sortedPitches = this.pitchArtLetters.map(item => item.pitch);
        this.maxPitchIndex = sortedPitches.indexOf(Math.max(...sortedPitches));
    }

    render() {
        return (
            <div>
                <div className="col s4">
                    <h6 className="metilda-control-header">Pitch Art</h6>
                    <div className="metilda-pitch-art-container-controls col s12">
                        <AccentPitchToggle
                            onAccentPitchToggle={this.props.onAccentPitchToggle}
                            showAccentPitch={this.props.showAccentPitch}/>
                    </div>
                </div>
                <div className="col s8">
                    <PitchArtDrawingWindow
                        width={this.props.width}
                        height={this.props.height}
                        minVertPitch={this.props.minVertPitch}
                        maxVertPitch={this.props.maxVertPitch}
                        uploadId={this.props.uploadId}
                        manualPitchChange={this.props.manualPitchChange}
                        maxPitchIndex={this.props.showAccentPitch ? this.maxPitchIndex : null}
                        letters={this.pitchArtLetters}/>
                    <PitchArt width={this.props.width}
                              height={this.props.height}
                              minVertPitch={this.props.minVertPitch}
                              maxVertPitch={this.props.maxVertPitch}
                              uploadId={this.props.uploadId}
                              manualPitchChange={this.props.manualPitchChange}
                              maxPitchIndex={this.maxPitchIndex}
                              letters={this.pitchArtLetters}/>
                </div>
            </div>
        )
    }
}

export default PitchArtContainer;