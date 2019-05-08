import * as React from "react";
import {SyntheticEvent} from "react";
import {Speaker} from "../../types/types";
import PitchRange from "../AudioViewer/PitchRange";
import PitchArt from "./PitchArt";
import "./PitchArtContainer.css";
import PitchArtLegend from "./PitchArtLegend";
import PitchArtToggle from "./PitchArtToggle";

interface Props {
    speakers: Speaker[];
    width: number;
    height: number;
    minPitch?: number;
    maxPitch?: number;
    uploadId: string;
    setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) => void;
}

interface State {
    minPitch: number;
    maxPitch: number;
    showAccentPitch: boolean;
    showSyllableText: boolean;
    showVerticallyCentered: boolean;
    showPitchArtLines: boolean;
    showLargeCircles: boolean;
    showTimeNormalization: boolean;
    showPitchScale: boolean;
    showPerceptualScale: boolean;
    showPitchArtImageColor: boolean;
}

class PitchArtContainer extends React.Component<Props, State> {
    static get DEFAULT_MIN_ANALYSIS_PITCH(): number {
        return 75.0;
    }

    static get DEFAULT_MAX_ANALYSIS_PITCH(): number {
        return 500.0;
    }

    constructor(props: Props) {
        super(props);
        this.state = {
            minPitch: this.props.minPitch || PitchArtContainer.DEFAULT_MIN_ANALYSIS_PITCH,
            maxPitch: this.props.maxPitch || PitchArtContainer.DEFAULT_MAX_ANALYSIS_PITCH,
            showAccentPitch: false,
            showSyllableText: false,
            showVerticallyCentered: false,
            showPitchArtLines: true,
            showLargeCircles: true,
            showTimeNormalization: false,
            showPitchScale: false,
            showPerceptualScale: true,
            showPitchArtImageColor: true
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

    toggleChanged = (inputName: string, isSelected: boolean) => {
        if (inputName === "showVerticallyCentered") {
            this.onVerticallyCenterClick(isSelected);
        }

        this.setState({[inputName]: isSelected} as any);
    }

    applyPitchRange = (minPitch: number, maxPitch: number) => {
        this.setState({minPitch, maxPitch});
    }

    onVerticallyCenterClick = (isVerticallyCentered: boolean) => {
        if (isVerticallyCentered) {
            this.setState({showPitchScale: false});
        }
    }

    render() {
        return (
            <div>
                <div className="col s4">
                    <h6 className="metilda-control-header">Pitch Art</h6>
                    <div className="metilda-pitch-art-container-control-list">
                        <PitchRange initMinPitch={this.state.minPitch}
                                    initMaxPitch={this.state.maxPitch}
                                    applyPitchRange={this.applyPitchRange}/>
                        <div className="row metilda-pitch-art-container-control-toggle-list">
                            <PitchArtToggle
                                label="Accent Symbol"
                                inputName="showAccentPitch"
                                isSelected={this.state.showAccentPitch}
                                offText="Hide"
                                onText="Show"
                                onChange={this.toggleChanged}
                            />
                            <PitchArtToggle
                                label={"Syllable Text"}
                                inputName={"showSyllableText"}
                                isSelected={this.state.showSyllableText}
                                offText="Hide"
                                onText="Show"
                                onChange={this.toggleChanged}
                            />
                            <PitchArtToggle
                                label={"Vertically Center"}
                                inputName={"showVerticallyCentered"}
                                isSelected={this.state.showVerticallyCentered}
                                offText="No"
                                onText="Yes"
                                onChange={this.toggleChanged}
                            />
                            <PitchArtToggle
                                label={"Lines"}
                                inputName={"showPitchArtLines"}
                                isSelected={this.state.showPitchArtLines}
                                offText="No"
                                onText="Yes"
                                onChange={this.toggleChanged}
                            />
                            <PitchArtToggle
                                label={"Circle Size"}
                                inputName={"showLargeCircles"}
                                isSelected={this.state.showLargeCircles}
                                offText="Small"
                                onText="Large"
                                onChange={this.toggleChanged}
                            />
                            <PitchArtToggle
                                label={"Time Normalization"}
                                inputName={"showTimeNormalization"}
                                isSelected={this.state.showTimeNormalization}
                                offText="No"
                                onText="Yes"
                                onChange={this.toggleChanged}
                            />
                            <PitchArtToggle
                                label={"Pitch Scale"}
                                inputName={"showPitchScale"}
                                isSelected={this.state.showPitchScale}
                                offText="No"
                                onText="Yes"
                                onChange={this.toggleChanged}
                                disabled={this.state.showVerticallyCentered}
                            />
                            <PitchArtToggle
                                label={"Pitch Type"}
                                inputName={"showPerceptualScale"}
                                isSelected={this.state.showPerceptualScale}
                                offText="Linear"
                                onText="Metilda"
                                onChange={this.toggleChanged}
                            />
                            <PitchArtToggle
                                label={"Saved Image Colors"}
                                inputName={"showPitchArtImageColor"}
                                isSelected={this.state.showPitchArtImageColor}
                                offText="Basic"
                                onText="Pitch Art"
                                onChange={this.toggleChanged}
                            />
                        </div>
                        {
                            this.props.speakers.length > 1
                            && <PitchArtLegend speakers={this.props.speakers}/>
                        }
                    </div>
                </div>
                <div className="col s8">
                    <PitchArt width={this.props.width}
                              height={this.props.height}
                              minPitch={this.state.minPitch}
                              maxPitch={this.state.maxPitch}
                              uploadId={this.props.uploadId}
                              setLetterPitch={this.props.setLetterPitch}
                              showAccentPitch={this.state.showAccentPitch}
                              showSyllableText={this.state.showSyllableText}
                              showVerticallyCentered={this.state.showVerticallyCentered}
                              showPitchArtLines={this.state.showPitchArtLines}
                              showLargeCircles={this.state.showLargeCircles}
                              showTimeNormalization={this.state.showTimeNormalization}
                              showPitchScale={this.state.showPitchScale}
                              showPerceptualScale={this.state.showPerceptualScale}
                              showPitchArtImageColor={this.state.showPitchArtImageColor}
                              speakers={this.props.speakers}/>
                </div>
            </div>
        );
    }
}

export default PitchArtContainer;
