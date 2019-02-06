import React, {Component} from 'react';
import './UploadAudio.css'
import "./GlobalStyling.css";
import {Redirect} from "react-router-dom";
import M from 'materialize-css/dist/js/materialize.min.js'

class UploadAudio extends Component {
    state = {};

    constructor(props) {
        super(props);
        this.state = {
            availableFiles: [],
            updateCounter: 0
        };

        this.sendFormSubmit = this.sendFormSubmit.bind(this);
        this.initInputField = this.initInputField.bind(this);
    }

    componentDidMount() {
        let controller = this;
        fetch("/api/available-files")
            .then(data => data.json())
            .then(data => this.setState({availableFiles: data["available_files"]}))
            .then(function () {
                controller.initInputField();
            })
    }

    componentDidUpdate() {
        // We reset the select field to force the select input to re-render with the
        // correct file.
        this.initInputField();
    }

    initInputField() {
        // initialize dropdowns
        var elems = document.querySelectorAll('#audioFileInput');
        M.FormSelect.init(elems);
    }

    sendFormSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        if (this.props.initFileName) {
            let isOk = window.confirm(
                "Selecting a new file will reload the " +
                "page, do you want to continue?");

            if (!isOk) {
                this.setState({updateCounter: this.state.updateCounter + 1});
                return false;
            }
        }

        const fileName = event.target.value;
        window.location.href = "/pitchartwizard/" + fileName;
    }

    render() {
        const availableFilesList = this.state.availableFiles.map(item =>
            <option key={item}>{item}</option>
        );

        return (
            <div className="metilda-audio-analysis-controls-list-item col s12"
                 key={this.state.updateCounter}>
                <label className="group-label">Audio File</label>
                <div className="row">
                    <div className="input-field inline col s12">
                        <select id="audioFileInput"
                                value={this.props.initFileName || ""}
                                name="audioFileName"
                                onChange={this.sendFormSubmit}>
                            <option value="" disabled="disabled">Choose audio file</option>
                            {availableFilesList}
                        </select>
                    </div>
                </div>
            </div>
        );
    }
}

export default UploadAudio;
