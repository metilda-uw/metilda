import * as React from "react";
import {ChangeEvent} from "react";
import "../GlobalStyling.css";

interface Props {
    showPitchArtImageColor: boolean;
    handleInputChange: (event: ChangeEvent) => void;
}

class PitchArtColorToggle extends React.Component<Props> {
    render() {
        return (
            <div className="metilda-pitch-art-container-control-list-item col s6">
                <div className="top-label">
                    <label>Saved Image Colors</label>
                </div>
                <div className="switch">
                    <label>
                        Basic
                        <input type="checkbox"
                               checked={this.props.showPitchArtImageColor}
                               onChange={this.props.handleInputChange}
                               name="showPitchArtImageColor"/>
                        <span className="lever"></span>
                        Pitch Art
                    </label>
                </div>
            </div>
        );
    }
}

export default PitchArtColorToggle;
