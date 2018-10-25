import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import './UploadAudio.css'

class UploadAudio extends Component {
  state = {};

  componentDidMount() {

  }

  render() {
    return (
      <div>
        <div className="wizard-header">
            <h3>Pitch Art Wizard</h3>
            <h4>Upload Recording (step 1/4)</h4>
        </div>
        <form className="wizard-form">
            <div className="row">
                <div className="file-field input-field col s6">
                    <div className="btn">
                        <span>Select File</span>
                        <input type="file" />
                    </div>
                    <div className="file-path-wrapper">
                        <input className="file-path validate" name="audio-file" type="text" required="required"/>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="input-field col s6">
                    <input type="text" name="description" required="required"/>
                    <label htmlFor="description">Description</label>
                </div>
            </div>
            <div className="row">
                <div className="col s6 gender-selection">
                    <p>Gender</p>
                    <p>
                        <label>
                            <input name="gender" type="radio" required="required" />
                            <span>Male</span>
                        </label>
                    </p>
                    <p>
                        <label>
                            <input name="gender" type="radio" required="required" />
                            <span>Female</span>
                        </label>
                    </p>
                    <p>
                        <label>
                            <input name="gender" type="radio" required="required" />
                            <span>Unknown</span>
                        </label>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col s12">
                    <button className="btn waves-effect waves-light"
                            type="submit"
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
