import React, {Component} from 'react';
import "../GlobalStyling.css";

class PitchArtCenterToggle extends Component {
    render() {
        return (
            <div className="metilda-pitch-art-container-control-list-item">
                <div className="top-label">
                    <label>Vertically Center</label>
                </div>
                <div className="switch">
                    <label>
                        No
                        <input type="checkbox"
                               checked={this.props.showVerticallyCentered}
                               onChange={this.props.handleInputChange}
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