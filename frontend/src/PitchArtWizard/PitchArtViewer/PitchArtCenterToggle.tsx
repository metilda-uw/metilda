import * as React from "react";
import {ChangeEvent, SyntheticEvent} from "react";
import "../GlobalStyling.css";

interface Props {
    showVerticallyCentered: boolean;
    handleInputChange: (event: ChangeEvent) => void;
    onVerticallyCenterClick: (isVerticallyCentered: boolean) => void;
}

class PitchArtCenterToggle extends React.Component<Props> {
    onChangeEvent = (event: ChangeEvent) => {
        this.props.handleInputChange(event);
        this.props.onVerticallyCenterClick(!this.props.showVerticallyCentered);
    }

    render() {
        return (
            <div className="metilda-pitch-art-container-control-list-item col s6">
                <div className="top-label">
                    <label>Vertically Center</label>
                </div>
                <div className="switch">
                    <label>
                        No
                        <input type="checkbox"
                               checked={this.props.showVerticallyCentered}
                               onChange={this.onChangeEvent}
                               name="showVerticallyCentered"/>
                        <span className="lever"></span>
                        Yes
                    </label>
                </div>
            </div>
        );
    }
}

export default PitchArtCenterToggle;
