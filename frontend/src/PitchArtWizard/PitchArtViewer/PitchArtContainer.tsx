import * as React from "react";
import {SyntheticEvent} from "react";
import {Letter} from "../../types/types";
import PitchArt from "../PitchArt";
import AccentPitchToggle from "./AccentPitchToggle";
import PitchArtCenterToggle from "./PitchArtCenterToggle";
import PitchArtCircleToggle from "./PitchArtCircleToggle";
import "./PitchArtContainer.css";
import PitchArtLinesToggle from "./PitchArtLinesToggle";
import SyllableToggle from "./SyllableToggle";

interface Props {
    letters: Letter[];
    width: number;
    height: number;
    minPitch: number;
    maxPitch: number;
    uploadId: string;
    manualPitchChange: (index: number, newPitch: number) => void;
}

interface State {
    showAccentPitch: boolean;
    showSyllableText: boolean;
    showVerticallyCentered: boolean;
    showPitchArtLines: boolean;
    showLargeCircles: boolean;
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

    handleInputChange(event: SyntheticEvent) {
        const target = event.target as HTMLInputElement;

        let value: boolean | File | string;
        if (target.type === "checkbox") {
            value = target.checked;
        } else if (target.type === "file") {
            value = target.files![0];
        } else {
            value = target.value;
        }

        const name = target.name;

        this.setState({[name]: value} as any);
    }

    render() {
        const sortedPitches = this.props.letters.map((item) => item.pitch);
        const maxPitchIndex = sortedPitches.indexOf(Math.max(...sortedPitches));
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
                              letters={this.props.letters}/>
                </div>
            </div>
        );
    }
}

export default PitchArtContainer;
