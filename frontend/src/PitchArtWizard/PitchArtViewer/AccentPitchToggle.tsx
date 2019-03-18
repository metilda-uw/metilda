import * as React from "react";
import "../GlobalStyling.css";
import {ChangeEvent} from "react";
import {SyntheticEvent} from "react";

interface Props {
    showAccentPitch: boolean,
    handleInputChange: (event: SyntheticEvent) => void
}


class AccentPitchToggle extends React.Component<Props> {
    render() {
        return (
            <div className="metilda-pitch-art-container-control-list-item">
                <div className="top-label">
                    <label>Accent Symbol</label>
                </div>
                <div className="switch">
                    <label>
                        Hide
                        <input type="checkbox"
                               checked={this.props.showAccentPitch}
                               onChange={this.props.handleInputChange}
                               name="showAccentPitch"/>
                        <span className="lever"></span>
                        Show
                    </label>
                </div>
            </div>
        );
    }
}

export default AccentPitchToggle;