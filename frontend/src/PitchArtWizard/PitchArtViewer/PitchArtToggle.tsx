import * as React from "react";
import "./PitchArtToggle.css";

export interface PitchArtToggleProps {
    label: string;
    offText: string;
    onText: string;
    inputName: string;
    isSelected: boolean;
    onChange: (inputName: string, isSelected: boolean) => void;
    disabled?: boolean;
}

class PitchArtToggle extends React.Component<PitchArtToggleProps> {
    render() {
        return (
            <div className="PitchArtToggle col s6">
                <div className="PitchArtToggle-label">
                    <label>{this.props.label}</label>
                </div>
                <div className="switch PitchArtToggle-toggle">
                    <label>
                        <span className="PitchArtToggle-toggle-off-label">{this.props.offText}</span>
                        <input type="checkbox"
                               checked={this.props.isSelected}
                               disabled={this.props.disabled}
                               onChange={() => this.props.onChange(this.props.inputName, !this.props.isSelected)}
                               className="PitchArtToggle-toggle-input"/>
                        <span className="lever"></span>
                        <span className="PitchArtToggle-toggle-on-label">{this.props.onText}</span>
                    </label>
                </div>
            </div>
        );
    }
}

export default PitchArtToggle;
