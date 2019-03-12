import React, {Component} from 'react';
import PitchArtDrawingWindow from "../PitchArtDrawingWindow";
import PitchArt from "../PitchArt";
import TranscribeAudio from "../TranscribeAudio";
import AccentPitchToggle from "./AccentPitchToggle";
import "./PitchArtContainer.css";
import SyllableToggle from "./SyllableToggle";
import PitchArtLinesToggle from "./PitchArtLinesToggle";
import PitchArtCircleToggle from "./PitchArtCircleToggle";

class PitchArtContainer extends Component {
    state = {};

    constructor(props) {
        super(props);
        this.state = {
            showAccentPitch: false,
            showSyllableText: false,
            showPitchArtLines: true,
            showLargeCircles: true
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;

        let value = null;
        if (target.type === "checkbox") {
            value = target.checked;
        } else if (target.type === "file") {
            value = target.files[0];
        } else {
            value = target.value;
        }

        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    render() {
        let pitchArtLetters = this.props.letters.map(item => Object.assign({startTime: item.t0 * this.props.soundLength}, item));
        let sortedPitches = pitchArtLetters.map(item => item.pitch);
        let maxPitchIndex = sortedPitches.indexOf(Math.max(...sortedPitches));
        return (
            <div>
                <div className="col s4">
                    <h6 className="metilda-control-header">Pitch Art</h6>
                    <div className="metilda-pitch-art-container-control-list col s12">
                        <AccentPitchToggle
                            handleInputChange={this.handleInputChange}
                            showAccentPitch={this.state.showAccentPitch}/>
                        <SyllableToggle
                            handleInputChange={this.handleInputChange}
                            showSyllableText={this.state.showSyllableText}/>
                        <PitchArtLinesToggle
                            handleInputChange={this.handleInputChange}
                            showPitchArtLines={this.state.showPitchArtLines}/>
                        <PitchArtCircleToggle
                            handleInputChange={this.handleInputChange}
                            showLargeCircles={this.state.showLargeCircles}/>
                    </div>
                </div>
                <div className="col s8">
                    <PitchArt width={this.props.width}
                              height={this.props.height}
                              minPitch={this.props.minPitch}
                              maxPitch={this.props.maxPitch}
                              uploadId={this.props.uploadId}
                              manualPitchChange={this.props.manualPitchChange}
                              maxPitchIndex={maxPitchIndex}
                              showAccentPitch={this.state.showAccentPitch}
                              showSyllableText={this.state.showSyllableText}
                              showPitchArtLines={this.state.showPitchArtLines}
                              showLargeCircles={this.state.showLargeCircles}
                              letters={pitchArtLetters}/>
                </div>
            </div>
        )
    }
}

export default PitchArtContainer;