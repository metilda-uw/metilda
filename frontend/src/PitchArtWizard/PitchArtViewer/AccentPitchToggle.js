import React, {Component} from 'react';
import "../GlobalStyling.css";

class AccentPitchToggle extends Component {
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