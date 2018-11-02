import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import './UploadAudio.css'
import {Redirect} from "react-router-dom";

class UploadAudio extends Component {
  state = {};

  constructor(props) {
      super(props);
      this.state = {
          audioFile: null,
          audioFileName: null,
          description: null,
          gender: null,
          redirectId: null
      }

      this.sendFormSubmit = this.sendFormSubmit.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
  }

  sendFormSubmit(event) {
      event.preventDefault();
      const audioForm = new FormData();
      audioForm.append("file", this.state.audioFile);

      const reactController = this;
      let jsonObj = Object.assign({}, this.state);
      jsonObj["audioFileName"] = this.state.audioFile.name;

      fetch("/api/upload-audio-file", {
            method: "POST",
            body: audioForm})
      .then(response => response.json())
      .then(function(data) {
        let uploadId = data["id"];
        jsonObj["id"] = uploadId;
        const jsonData = JSON.stringify(jsonObj);

        fetch("/api/upload-audio-metadata", {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: jsonData})
        .then(response => response.text())
        .then(data => reactController.setState({redirectId: uploadId}));
      });
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
      return <Redirect to={"/pitchartwizard/2/" + this.state.redirectId} />
    }

    return (
      <div>
        <div className="wizard-header">
            <h3>Pitch Art Wizard</h3>
            <h4>Upload Recording (step 1/4)</h4>
        </div>
        <form className="wizard-form" method="post">
            <div className="row">
                <div className="file-field input-field col s6">
                    <div className="btn">
                        <span>Select File</span>
                        <input type="file" name="audioFile" onChange={this.handleInputChange}/>
                    </div>
                    <div className="file-path-wrapper">
                        <input className="file-path validate"
                               onChange={this.handleInputChange}
                               name="audioFileName"
                               type="text"
                               required="required"/>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="input-field col s6">
                    <input type="text"
                          onChange={this.handleInputChange}
                           name="description"
                           required="required"/>
                    <label htmlFor="description">Description</label>
                </div>
            </div>
            <div className="row">
                <div className="col s6 gender-selection">
                    <p>Gender</p>
                    <p>
                        <label>
                            <input name="gender"
                                   onChange={this.handleInputChange}
                                   type="radio"
                                   required="required" />
                            <span>Male</span>
                        </label>
                    </p>
                    <p>
                        <label>
                            <input name="gender"
                                   onChange={this.handleInputChange}
                                   type="radio"
                                   required="required" />
                            <span>Female</span>
                        </label>
                    </p>
                    <p>
                        <label>
                            <input name="gender"
                                   onChange={this.handleInputChange}
                                   type="radio"
                                   required="required" />
                            <span>Unknown</span>
                        </label>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col s12">
                    <button className="btn waves-effect waves-light"
                            type="submit"
                            onClick={this.sendFormSubmit}
                            name="action">
                        Next
                    </button>
                </div>
            </div>
        </form>
      </div>
    );
  }
}

export default UploadAudio;
