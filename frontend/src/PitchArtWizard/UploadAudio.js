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
            audioFile: null,
            audioFileName: "",
            description: null,
            gender: null,
            redirectId: null,
            availableFiles: []
        }

        this.sendFormSubmit = this.sendFormSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount() {
        fetch("/api/available-files")
            .then(data => data.json())
            .then(data => this.setState({availableFiles: data["available_files"]}))
            .then(function () {
                // initialize dropdowns
                var elems = document.querySelectorAll('select');
                M.FormSelect.init(elems);
            })
    }

    sendFormSubmit(event) {
        event.preventDefault();
        this.setState({redirectId: this.state.audioFileName});
    }

    handleInputChange(event) {
        const target = event.target;

        let value = null;
        if (target.type === "checkbox") {
            value = target.checked;
        } else if (target.type === "file") {
            value = target.files[0];
        } else {
            value = target.value;
        }

        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    render() {
        if (this.state.redirectId !== null) {
            window.location.href = "/pitchartwizard/" + this.state.redirectId;
            return;
        }

        const availableFilesList = this.state.availableFiles.map(item =>
            <option key={item}>{item}</option>
        );

        return (
            <div className="col s12">
                <label className="group-label">Audio File</label>
                <div className="row">
                    <div className="input-field inline col s9">
                        <select value={this.state.audioFileName || this.props.uploadId || ""}
                                name="audioFileName"
                                onChange={this.handleInputChange}>
                            <option value="" disabled="disabled">Choose audio file</option>
                            {availableFilesList}
                        </select>
                    </div>
                    <div className="input-field inline col s2">
                        <button className="btn waves-effect waves-light"
                                type="submit"
                                onClick={this.sendFormSubmit}
                                name="action">
                            Load
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default UploadAudio;
