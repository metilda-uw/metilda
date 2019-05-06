import * as React from "react";
import {SyntheticEvent} from "react";
import {connect} from "react-redux";
import "../PitchArtWizard/GlobalStyling.css";
import {AppState} from "../store";
import {Speaker} from "../types/types";
import "./CreatePitchArt.css";
import ExportMetildaTranscribe from "./ExportMetildaTranscribe";
import ImportMetildaTranscribe from "./ImportMetildaTranscribe";
import "./SpeakerControl.css";

export interface SpeakerControlProps {
    speakerIndex: number;
    speakers: Speaker[];
    addSpeaker: () => void;
    removeSpeaker: () => void;
    canAddSpeaker: boolean;
    canRemoveSpeaker: boolean;
}

export class SpeakerControl extends React.Component<SpeakerControlProps> {
    maybeRenderRemoveSpeaker = () => {
        if (!this.props.canRemoveSpeaker) {
            return;
        }

        return (
            <button className="SpeakerControl-remove-speaker waves-effect waves-light btn"
                    onClick={this.checkIfSpeakerRemovalIsOk}>
                Remove
            </button>
        );
    }

    maybeRenderAddSpeaker = () => {
        if (!this.props.canAddSpeaker) {
            return;
        }

        return (
            <button className="SpeakerControl-add-speaker waves-effect waves-light btn"
                    onClick={this.props.addSpeaker}>
                Add
            </button>
        );
    }

    checkIfSpeakerRemovalIsOk = (event: SyntheticEvent) => {
        if (this.props.speakers[this.props.speakerIndex].letters.length === 0) {
            this.props.removeSpeaker();
            return;
        }

        const isOk: boolean = confirm(
            "The current speaker will be removed.\n\n" +
            "Do you want to continue?"
        );

        if (!isOk) {
            event.preventDefault();
        } else {
            this.props.removeSpeaker();
        }
    }

    checkIfSpeakerImportIsOk = (event: SyntheticEvent) => {
        if (this.props.speakers[this.props.speakerIndex].letters.length === 0) {
            return;
        }

        const isOk: boolean = confirm(
            "The current speaker will be reset.\n\n" +
            "Do you want to continue?"
        );

        if (!isOk) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    render() {
        return (
            <div className="SpeakerControl metilda-audio-analysis-controls-list-item col s12">
                <label className="SpeakerControl-title group-label">Speaker</label>
                <div className="metilda-audio-analysis-controls-list-item-row-left-align">
                    <ImportMetildaTranscribe
                        onImport={this.checkIfSpeakerImportIsOk}
                        speakerIndex={this.props.speakerIndex}
                    />
                    <ExportMetildaTranscribe speakerIndex={this.props.speakerIndex}/>
                    {this.maybeRenderRemoveSpeaker()}
                    {this.maybeRenderAddSpeaker()}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    speakers: state.audio.speakers,
});

export default connect(mapStateToProps)(SpeakerControl);
