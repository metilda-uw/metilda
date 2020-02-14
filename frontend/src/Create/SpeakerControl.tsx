import * as React from "react";
import {SyntheticEvent} from "react";
import {connect} from "react-redux";
import "../PitchArtWizard/GlobalStyling.css";
import {AppState} from "../store";
import {Speaker} from "../types/types";
import "./CreatePitchArt.css";
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
            <button className="SpeakerControl-remove-speaker waves-effect waves-light btn globalbtn"
                    onClick={this.checkIfSpeakerRemovalIsOk}>
                 <i className="material-icons right">
                    remove_circle
                 </i>
                Remove Speaker
            </button>
        );
    }

    maybeRenderAddSpeaker = () => {
        if (!this.props.canAddSpeaker) {
            return;
        }

        return (
            <button className="SpeakerControl-add-speaker waves-effect waves-light btn globalbtn"
                    onClick={this.props.addSpeaker}>
                <i className="material-icons right">
                    person_add
                 </i>
                Add Speaker
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
                <div className="metilda-audio-analysis-controls-list-item-row-left-align">
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
