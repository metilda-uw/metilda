import * as React from "react";
import {SyntheticEvent} from "react";
import {Speaker} from "../../types/types";
import PitchRange from "../AudioViewer/PitchRange";
import TimeRange from "./TimeRange";
import PitchArt from "./PitchArt";
import "./PitchArtContainer.css";
import PitchArtLegend from "./PitchArtLegend";
import PitchArtToggle from "./PitchArtToggle";

interface Props {
    firebase: any;
    speakers: Speaker[];
    width: number;
    height: number;
    minPitch?: number;
    maxPitch?: number;
    minTime?: number;
    maxTime?: number;
    uploadId: string;
    setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) => void;
}

interface State {
    minPitch: number;
    maxPitch: number;
    minTime: number;
    maxTime: number;
    showAccentPitch: boolean;
    showSyllableText: boolean;
    showVerticallyCentered: boolean;
    showPitchArtLines: boolean;
    showLargeCircles: boolean;
    showTimeNormalization: boolean;
    showPitchScale: boolean;
    showPerceptualScale: boolean;
    showPitchArtImageColor: boolean;
    showMetildaWatermark: boolean;
}

class PitchArtContainer extends React.Component<Props, State> {
    static get DEFAULT_MIN_ANALYSIS_PITCH(): number {
        return 75.0;
    }

    static get DEFAULT_MAX_ANALYSIS_PITCH(): number {
        return 500.0;
    }

    static get DEFAULT_MIN_ANALYSIS_TIME(): number {
        return 0.0;
    }

    static get DEFAULT_MAX_ANALYSIS_TIME(): number {
        return 1.0;
    }

    constructor(props: Props) {
        super(props);
        this.state = {
            minPitch: this.props.minPitch || PitchArtContainer.DEFAULT_MIN_ANALYSIS_PITCH,
            maxPitch: this.props.maxPitch || PitchArtContainer.DEFAULT_MAX_ANALYSIS_PITCH,
            minTime: this.props.minPitch || PitchArtContainer.DEFAULT_MIN_ANALYSIS_TIME,
            maxTime: this.props.maxPitch || PitchArtContainer.DEFAULT_MAX_ANALYSIS_TIME,
            showAccentPitch: false,
            showSyllableText: false,
            showVerticallyCentered: false,
            showPitchArtLines: true,
            showLargeCircles: true,
            showTimeNormalization: false,
            showPitchScale: false,
            showPerceptualScale: true,
            showPitchArtImageColor: true,
            showMetildaWatermark: false
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

    applyTimeRange = (minTime: number, maxTime: number) => {
        this.setState({maxTime});
    }

    onVerticallyCenterClick = (isVerticallyCentered: boolean) => {
        if (isVerticallyCentered) {
            this.setState({showPitchScale: false});
        }
    }

    render() {
        return (
            <div>
                <div className="col s5">
                    <h6 className="metilda-control-header">Pitch Art</h6>
                    <div className="metilda-pitch-art-container-control-list">
                        <PitchRange initMinPitch={this.state.minPitch}
                                    initMaxPitch={this.state.maxPitch}
                                    applyPitchRange={this.applyPitchRange}/>
                        <TimeRange initMinTime={this.state.minTime}
                                    initMaxTime={this.state.maxTime}
                                    applyTimeRange={this.applyTimeRange}/>
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
                                label={"Pitch & Time Axis"}
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
                            <PitchArtToggle
                                label={"Metilda Watermark"}
                                inputName={"showMetildaWatermark"}
                                isSelected={this.state.showMetildaWatermark}
                                offText="Option 1"
                                onText="Option 2"
                                onChange={this.toggleChanged}
                            />
                        </div>
                        {
                            this.props.speakers.length > 1
                            && <PitchArtLegend speakers={this.props.speakers}/>
                        }
                    </div>
                </div>
                <div className="col s7">
                    <PitchArt width={this.props.width}
                              height={this.props.height}
                              minPitch={this.state.minPitch}
                              maxPitch={this.state.maxPitch}
                              minTime={this.state.minTime}
                              maxTime={this.state.maxTime}
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
                              showMetildaWatermark={this.state.showMetildaWatermark}
                              speakers={this.props.speakers}
                              firebase={this.props.firebase}/>
                </div>
            </div>
        );
    }
}

export default PitchArtContainer;
