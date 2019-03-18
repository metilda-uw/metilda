import * as React from "react";
import PitchArtDrawingWindow from "../PitchArtDrawingWindow";
import PitchArt from "../PitchArt";
import TranscribeAudio from "../TranscribeAudio";
import AccentPitchToggle from "./AccentPitchToggle";
import "./PitchArtContainer.css";
import SyllableToggle from "./SyllableToggle";
import PitchArtLinesToggle from "./PitchArtLinesToggle";
import PitchArtCircleToggle from "./PitchArtCircleToggle";
import PitchArtCenterToggle from "./PitchArtCenterToggle";
import {ChangeEvent} from "react";

interface Letter {
    // TODO: Replace this with real Letter interface
    t0: number,
    pitch: number
}

interface Props {
    letters: Array<Letter>,
    soundLength: number,
    width: number,
    height: number,
    minPitch: number,
    maxPitch: number,
    uploadId: number,
    manualPitchChange: number,
    handleInputChange: (event: ChangeEvent) => void
}

interface State {
    showAccentPitch: boolean,
    showSyllableText: boolean,
    showVerticallyCentered: boolean,
    showPitchArtLines: boolean,
    showLargeCircles: boolean
}

class PitchArtContainer extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showAccentPitch: false,
            showSyllableText: false,
            showVerticallyCentered: false,
            showPitchArtLines: true,
            showLargeCircles: true
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event: ChangeEvent) {
        // TODO: replace with expected implementation
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
                        <PitchArtCenterToggle
                            handleInputChange={this.handleInputChange}
                            showVerticallyCentered={this.state.showVerticallyCentered}/>
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
                              showVerticallyCentered={this.state.showVerticallyCentered}
                              showPitchArtLines={this.state.showPitchArtLines}
                              showLargeCircles={this.state.showLargeCircles}
                              letters={pitchArtLetters}/>
                </div>
            </div>
        )
    }
}

export default PitchArtContainer;