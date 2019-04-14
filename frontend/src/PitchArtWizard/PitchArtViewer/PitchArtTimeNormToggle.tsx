import * as React from "react";
import {ChangeEvent} from "react";
import "../GlobalStyling.css";

interface Props {
    showTimeNormalization: boolean;
    handleInputChange: (event: ChangeEvent) => void;
}

class PitchArtTimeNormToggle extends React.Component<Props> {
    render() {
        return (
            <div className="metilda-pitch-art-container-control-list-item col s6">
                <div className="top-label">
                    <label>Time Normalization</label>
                </div>
                <div className="switch">
                    <label>
                        No
                        <input type="checkbox"
                               checked={this.props.showTimeNormalization}
                               onChange={this.props.handleInputChange}
                               name="showTimeNormalization"/>
                        <span className="lever"></span>
                        Yes
                    </label>
                </div>
            </div>
        );
    }
}

export default PitchArtTimeNormToggle;
