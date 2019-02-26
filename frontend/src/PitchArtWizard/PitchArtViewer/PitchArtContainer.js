import React, {Component} from 'react';
import PitchArtDrawingWindow from "../PitchArtDrawingWindow";
import PitchArt from "../PitchArt";
import TranscribeAudio from "../TranscribeAudio";
import AccentPitchToggle from "./AccentPitchToggle";
import "./PitchArtContainer.css";
import SyllableToggle from "./SyllableToggle";
import PitchArtLinesToggle from "./PitchArtLinesToggle";

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
                    <div className="metilda-pitch-art-container-control-list col s12">
                        <AccentPitchToggle
                            onAccentPitchToggle={this.props.onAccentPitchToggle}
                            showAccentPitch={this.props.showAccentPitch}/>
                        <SyllableToggle
                            onSyllableTextToggle={this.props.onSyllableTextToggle}
                            showSyllableText={this.props.showSyllableText}/>
                        <PitchArtLinesToggle
                            onPitchArtLinesToggle={this.props.onPitchArtLinesToggle}
                            showPitchArtLines={this.props.showPitchArtLines}/>
                    </div>
                </div>
                <div className="col s8">
                    <PitchArt width={this.props.width}
                              height={this.props.height}
                              minPitch={this.props.minPitch}
                              maxPitch={this.props.maxPitch}
                              uploadId={this.props.uploadId}
                              manualPitchChange={this.props.manualPitchChange}
                              maxPitchIndex={this.maxPitchIndex}
                              showAccentPitch={this.props.showAccentPitch}
                              showSyllableText={this.props.showSyllableText}
                              showPitchArtLines={this.props.showPitchArtLines}
                              activePlayIndex={this.props.activePlayIndex}
                              onActivePlayIndex={this.props.onActivePlayIndex}
                              letters={this.pitchArtLetters}/>
                </div>
            </div>
        )
    }
}

export default PitchArtContainer;