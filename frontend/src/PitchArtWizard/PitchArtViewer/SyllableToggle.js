import React, {Component} from 'react';
import "../GlobalStyling.css";

class SyllableToggle extends Component {
    render() {
        return (
            <div className="metilda-pitch-art-container-control-list-item">
                <div className="top-label">
                    <label>Syllable Text</label>
                </div>
                <div className="switch">
                    <label>
                        Hide
                        <input type="checkbox"
                               checked={this.props.showSyllableText}
                               onChange={this.props.handleInputChange}
                               name="showSyllableText"/>
                        <span className="lever"></span>
                        Show
                    </label>
                </div>
            </div>
        );
    }
}

export default SyllableToggle;