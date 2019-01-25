import React, {Component} from 'react';
import "../GlobalStyling.css";

class AccentPitchToggle extends Component {
    render() {
        return (
            <div>
                <div className="top-label">
                    <label>Pitch Accent Symbol</label>
                </div>
                <div className="switch">
                    <label>
                        Off
                        <input type="checkbox"
                               checked={this.props.showAccentPitch}
                               onChange={this.props.onAccentPitchToggle}/>
                        <span className="lever"></span>
                        On
                    </label>
                </div>
            </div>
        );
    }
}

export default AccentPitchToggle;