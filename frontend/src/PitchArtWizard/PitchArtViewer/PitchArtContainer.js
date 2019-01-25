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
        let timesAndPitches = this.props.letters.map(item => [item.t0, item.pitch]);
        let sortedTimesAndPitches = timesAndPitches.sort((a, b) => a[0] - b[0]);
        this.sortedPitches = sortedTimesAndPitches.map(item => item[1]);
        this.sortedTimes = sortedTimesAndPitches.map(item => item[0] * this.props.soundLength);
        this.maxPitchIndex = this.sortedPitches.indexOf(Math.max(...this.sortedPitches));
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
                        pitches={this.sortedPitches}
                        maxPitchIndex={this.props.showAccentPitch ? this.maxPitchIndex : null}
                        times={this.sortedTimes}/>
                    <PitchArt width={this.props.width}
                              height={this.props.height}
                              minVertPitch={this.props.minVertPitch}
                              maxVertPitch={this.props.maxVertPitch}
                              uploadId={this.props.uploadId}
                              pitches={this.sortedPitches}
                              times={this.sortedTimes}/>
                </div>
            </div>
        )
    }
}

export default PitchArtContainer;