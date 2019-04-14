import * as React from "react";
import {ChangeEvent} from "react";
import "../GlobalStyling.css";

interface Props {
    showPitchArtLines: boolean;
    handleInputChange: (event: ChangeEvent) => void;
}

class PitchArtLinesToggle extends React.Component<Props> {
    render() {
        return (
            <div className="metilda-pitch-art-container-control-list-item col s6">
                <div className="top-label">
                    <label>Lines</label>
                </div>
                <div className="switch">
                    <label>
                        Hide
                        <input type="checkbox"
                               checked={this.props.showPitchArtLines}
                               onChange={this.props.handleInputChange}
                               name="showPitchArtLines"/>
                        <span className="lever"></span>
                        Show
                    </label>
                </div>
            </div>
        );
    }
}

export default PitchArtLinesToggle;
