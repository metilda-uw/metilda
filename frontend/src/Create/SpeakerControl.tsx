import * as React from "react";
import "../PitchArtWizard/GlobalStyling.css";
import "./CreatePitchArt.css";
import "./SpeakerControl.css";

interface Props {
    addSpeaker: () => void;
    removeSpeaker: () => void;
    canRemoveSpeaker: boolean;
}

export default class SpeakerControl extends React.Component<Props> {
    maybeRenderRemoveSpeaker = () => {
        if (!this.props.canRemoveSpeaker) {
            return;
        }

        return (
            <button className="waves-effect waves-light btn"
                    onClick={this.props.removeSpeaker}>
                Remove
            </button>
        );
    }

    render() {
        return (
            <div className="metilda-audio-analysis-controls-list-item col s12">
                <label className="group-label">Speaker</label>
                <div className="metilda-audio-analysis-controls-list-item-row-left-align">
                    <button className="waves-effect waves-light btn"
                            onClick={this.props.addSpeaker}>
                        Add New
                    </button>
                    {this.maybeRenderRemoveSpeaker()}
                </div>
            </div>
        );
    }
}
