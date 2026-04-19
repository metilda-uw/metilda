import * as React from "react";
import "./PitchArtToggle.css";

export type DotSize = "S" | "M" | "L";

export interface PitchArtDotSizeSelectProps {
    label: string;
    inputName: string;
    value: DotSize;
    onChange: (inputName: string, value: DotSize) => void;
    disabled?: boolean;
}

class PitchArtDotSizeSelect extends React.Component<PitchArtDotSizeSelectProps> {
    handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.props.onChange(this.props.inputName, e.target.value as DotSize);
    }

    render() {
        const selectId = `dotSize-${this.props.inputName}`;
        return (
            <div className="PitchArtToggle col s6">
                <div className="PitchArtToggle-label">
                    <label htmlFor={selectId}>{this.props.label}</label>
                </div>
                <div className="PitchArtToggle-toggle">
                    <select
                        id={selectId}
                        className="browser-default"
                        value={this.props.value}
                        disabled={this.props.disabled}
                        onChange={this.handleChange}
                        aria-label={this.props.label}
                    >
                        <option value="S">Small</option>
                        <option value="M">Medium</option>
                        <option value="L">Large</option>
                    </select>
                </div>
            </div>
        );
    }
}

export default PitchArtDotSizeSelect;
