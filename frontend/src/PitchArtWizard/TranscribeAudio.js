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
    var imgBox = {
        xminPerc: 320.0 / 2560.0,
        xmaxPerc: 2306.0 / 2560.0
    };

    let cropAreaLeftX;
    let cropAreaRightX;
    let $el = $("#metilda-audio-analysis-image");
    let imgObj = $el.imgAreaSelect({
        instance: true,
        handles: true,
        onInit: function() {
            imgObj.setOptions({minHeight: $el.height()});
        },
        onSelectStart: function(img, loc) {
            if (loc.x1 < imgBox.xminPerc * img.width || loc.x2 > imgBox.xmaxPerc * img.width) {
                imgObj.cancelSelection();
            } else {
                cropAreaLeftX = loc.x1;
                cropAreaRightX = loc.x2;
            }
        },
        onSelectChange: function(img, loc) {
            if (cropAreaLeftX !== undefined && cropAreaRightX !== undefined) {
                let isLeftEdgeMovingLeft = loc.x1 < cropAreaLeftX;
                let isRightEdgeMovingRight = loc.x2 > cropAreaRightX;
                let maxWidth;

                if (isLeftEdgeMovingLeft) {
                    let imgLeftX = imgBox.xminPerc * img.width;
                    maxWidth = loc.x2 - imgLeftX;
                } else if (isRightEdgeMovingRight) {
                    let imgRightX = imgBox.xmaxPerc * img.width;
                    maxWidth = imgRightX - loc.x1;
                }

                if (maxWidth !== undefined) {
                    imgObj.setOptions({maxWidth: maxWidth});
                }
            }
        },
        onSelectEnd: function(img, loc) {
            cropAreaLeftX = undefined;
            cropAreaRightX = undefined;
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