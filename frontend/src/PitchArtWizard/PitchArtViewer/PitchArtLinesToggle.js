import React, {Component} from 'react';
import "../GlobalStyling.css";

class PitchArtLinesToggle extends Component {
    render() {
        return (
            <div className="metilda-pitch-art-container-control-list-item">
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