import * as React from "react";
import {ChangeEvent} from "react";
import "../GlobalStyling.css";

interface Props {
    showPitchScale: boolean;
    handleInputChange: (event: ChangeEvent) => void;
}

class PitchArtShowScaleToggle extends React.Component<Props> {
    render() {
        return (
            <div className="metilda-pitch-art-container-control-list-item col s6">
                <div className="top-label">
                    <label>Show Scale</label>
                </div>
                <div className="switch">
                    <label>
                        Hide
                        <input type="checkbox"
                               checked={this.props.showPitchScale}
                               onChange={this.props.handleInputChange}
                               name="showPitchScale"/>
                        <span className="lever"></span>
                        Show
                    </label>
                </div>
            </div>
        );
    }
}

export default PitchArtShowScaleToggle;
