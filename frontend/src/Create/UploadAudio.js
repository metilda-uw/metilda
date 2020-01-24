import React, {Component} from 'react';
import './UploadAudio.css'
import "../PitchArtWizard/GlobalStyling.css";
import M from 'materialize-css/dist/js/materialize.min.js'

class UploadAudio extends Component {
    state = {};

    constructor(props) {
        super(props);
        this.state = {
            updateCounter: 0
        };

        this.sendFormSubmit = this.sendFormSubmit.bind(this);
        this.initInputField = this.initInputField.bind(this);
    }

    componentDidMount() {
        let controller = this;
        fetch("/api/audio")
            .then(data => data.json())
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
        M.FormSelect.init(elems, {classes: 'metilda-select-dropdown'});
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

        const index = event.target.value;
        this.props.setUploadId(this.props.userFiles[index][1], this.props.userFiles[index][2], this.props.userFiles[index][0]);
    }

    render() {
        const availableFilesList = this.props.userFiles.map((item, index) => {
            return (
                <option key={index} value={index}>{item[1]}</option>
            )
        });
        return (
            <div className="metilda-audio-analysis-controls-list-item col s12"
                 key={this.state.updateCounter}>
                <label className="group-label">Audio File</label>
                <div className="metilda-audio-analysis-controls-list-item-row">
                    <select id="audioFileInput"
                            value={this.props.initFileName || ''}
                            name="audioFileName"
                            onChange={this.sendFormSubmit}>
                        <option value={''} disabled="disabled">Choose audio file</option>
                        {availableFilesList}
                    </select>
                </div>
            </div>
        );
    }
}

export default UploadAudio;
