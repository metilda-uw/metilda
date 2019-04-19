import * as React from "react";
import {ChangeEvent} from "react";
import "../GlobalStyling.css";

interface Props {
    showPerceptualScale: boolean;
    handleInputChange: (event: ChangeEvent) => void;
}

class PitchArtScaleToggle extends React.Component<Props> {
    render() {
        return (
            <div className="metilda-pitch-art-container-control-list-item col s6">
                <div className="top-label">
                    <label>Pitch Type</label>
                </div>
                <div className="switch">
                    <label>
                        Linear
                        <input type="checkbox"
                               checked={this.props.showPerceptualScale}
                               onChange={this.props.handleInputChange}
                               name="showPerceptualScale"/>
                        <span className="lever"></span>
                        Metilda
                    </label>
                </div>
            </div>
        );
    }
}

export default PitchArtScaleToggle;
