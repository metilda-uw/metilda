import * as React from "react";
import "./PitchArtToggle.css";

export interface PitchArtToggleProps {
    label: string;
    inputName: string;
    isSelected: boolean;
    onChange: (inputName: string, isSelected: boolean) => void;
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
                        Hide
                        <input type="checkbox"
                               checked={this.props.isSelected}
                               onChange={() => this.props.onChange(this.props.inputName, !this.props.isSelected)}
                               className="PitchArtToggle-toggle-input"/>
                        <span className="lever"></span>
                        Show
                    </label>
                </div>
            </div>
        );
    }
}

export default PitchArtToggle;
