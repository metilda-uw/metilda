import * as React from "react";
import {ChangeEvent} from "react";
import "../GlobalStyling.css";

interface Props {
    showLargeCircles: boolean;
    handleInputChange: (event: ChangeEvent) => void;
}

class PitchArtCircleToggle extends React.Component<Props> {
    render() {
        return (
            <div className="metilda-pitch-art-container-control-list-item col s12">
                <div className="top-label">
                    <label>Circle Size</label>
                </div>
                <div className="switch">
                    <label>
                        Small
                        <input type="checkbox"
                               checked={this.props.showLargeCircles}
                               onChange={this.props.handleInputChange}
                               name="showLargeCircles"/>
                        <span className="lever"></span>
                        Large
                    </label>
                </div>
            </div>
        );
    }
}

export default PitchArtCircleToggle;
