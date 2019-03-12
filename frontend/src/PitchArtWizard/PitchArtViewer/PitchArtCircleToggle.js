import React, {Component} from 'react';
import "../GlobalStyling.css";

class PitchArtCircleToggle extends Component {
    render() {
        return (
            <div className="metilda-pitch-art-container-control-list-item">
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