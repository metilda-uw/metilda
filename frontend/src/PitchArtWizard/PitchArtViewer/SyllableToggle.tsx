import * as React from "react";
import {ChangeEvent} from "react";
import "../GlobalStyling.css";

interface Props {
    showSyllableText: boolean;
    handleInputChange: (event: ChangeEvent) => void;
}

class SyllableToggle extends React.Component<Props> {
    render() {
        return (
            <div className="metilda-pitch-art-container-control-list-item col s6">
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
