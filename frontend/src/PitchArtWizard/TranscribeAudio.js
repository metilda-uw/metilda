import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import './UploadAudio.css'
import queryString from 'query-string'


class TranscribeAudio extends Component {
  state = {};

  constructor(props) {
      super(props);
      // TODO: get spectogram and waveform
      //this.state = {}
      const values = queryString.parse(this.props.location.search);
      console.log(values.id);
  }

  render() {
    return (
      <div>
        <div className="wizard-header">
            <h3>Pitch Art Wizard</h3>
            <h4>Transcribe Audio (step 2/4)</h4>
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
      </div>
    );
  }
}

export default TranscribeAudio;