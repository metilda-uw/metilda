import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import M from 'materialize-css/dist/js/materialize.min.js'
import './UploadAudio.css'
import {Redirect} from "react-router-dom";

class UploadAudio extends Component {
  state = {};

  constructor(props) {
      super(props);
      this.state = {
          audioFile: null,
          audioFileName: "OldPart1.mp3",
          description: null,
          gender: null,
          redirectId: null
      }

      this.sendFormSubmit = this.sendFormSubmit.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);
  }

  sendFormSubmit(event) {
      event.preventDefault();
      console.log(this.state);
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
                <div className="input-field col s12">
                    <select value={this.state.audioFileName} name="audioFileName" onChange={this.handleInputChange}>
                        <option value="" disabled="disabled">Choose audio file</option>
                        <option>OldPart1.mp3</option>
                        <option>OldPart2.mp3</option>
                        <option>ShirleeFriends.mp3</option>
                    </select>
                    <label>Audio File</label>
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
