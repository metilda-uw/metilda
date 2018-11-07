import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import './UploadAudio.css';
import styles from "./TranscribeAudio.css";
import $ from "jquery";
import '../Lib/imgareaselect/css/imgareaselect-default.css';
import '../Lib/imgareaselect/scripts/jquery.imgareaselect.js';

class TranscribeAudio extends Component {
  state = {};

  constructor(props) {
      super(props);
  }

  componentDidMount() {
    var $el = $("#metilda-audio-analysis-image");
    var imgObj = $el.imgAreaSelect({
        instance: true,
        handles: true,
        onInit: function() {
            console.log("onInit");
            console.log("height: " + $el.height());
            imgObj.setOptions({minHeight: $el.height()});
        },
        onSelectStart: function() {
            console.log("onSelectStart")
        }
    });
  }

  render() {
    const {uploadId} = this.props.match.params;

    return (
      <div>
        <div className="wizard-header">
            <h3>Pitch Art Wizard</h3>
            <h4>Transcribe Audio (step 2/4)</h4>
        </div>
        <div className="metilda-audio-analysis-form">
            <div className="row">
                <div className="col s6">
                      <img className="metilda-audio-analysis-image"
                           id="metilda-audio-analysis-image"
                           ref={audioImage => this.audioImage = audioImage}
                           src={"/api/audio-analysis-image/" + uploadId + ".png?faketimestamp=" + Date.now()} />
                </div>
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
      </div>
    );
  }
}

export default TranscribeAudio;