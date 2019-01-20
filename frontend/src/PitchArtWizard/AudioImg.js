import React, {Component} from 'react';

import $ from "jquery";
import '../Lib/imgareaselect/css/imgareaselect-default.css';
import '../Lib/imgareaselect/scripts/jquery.imgareaselect.js';
import {audioSelectionAction} from "../actions/audioAnalysisActions";
import {connect} from "react-redux";

class AudioImg extends Component {
  state = {};

  constructor(props) {
      super(props);
  }

  componentDidMount() {
    const {xminPerc, xmaxPerc} = this.props;

    let audioImage = this;
    let cropAreaLeftX;
    let cropAreaRightX;
    let $el = $("#metilda-audio-analysis-image");
    let imgBox = {xminPerc, xmaxPerc};
    let prevMaxWidth;

    window.onresize = function() {
        prevMaxWidth = undefined;
    };

    let imgObj = $el.imgAreaSelect({
        instance: true,
        handles: true,
        onInit: function() {
            imgObj.setOptions({minHeight: $el.height()});
            audioImage.props.onAudioImageLoaded(imgObj.cancelSelection);
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
                    let graphLeftX = imgBox.xminPerc * img.width;
                    maxWidth = loc.x2 - graphLeftX;
                } else if (isRightEdgeMovingRight) {
                    let graphRightX = imgBox.xmaxPerc * img.width;
                    maxWidth = graphRightX - loc.x1;
                }

                // The prevMaxWidth check avoids an infinite loop bug for certain
                // image sizes.
                if (maxWidth !== undefined && prevMaxWidth !== maxWidth) {
                    prevMaxWidth = maxWidth;
                    imgObj.setOptions({maxWidth: maxWidth});
                }
            }
        },
        onSelectEnd: function(img, loc) {
            cropAreaLeftX = undefined;
            cropAreaRightX = undefined;

            if (loc.x1 < loc.x2) {
                let startOffset = audioImage.props.imageWidth * audioImage.props.xminPerc;
                audioImage.props.audioIntervalSelected(loc.x1 - startOffset,
                                                       loc.x2 - startOffset);
            } else if (loc.x1 === loc.x2) {
                audioImage.props.audioIntervalSelectionCanceled();
            }
        }
    });
  }

  render() {
    const {src} = this.props;
    return (
      <img id="metilda-audio-analysis-image"
           className="metilda-audio-analysis-image"
           src={src} />
    );
  }
}

const mapStateToProps = state => ({
    ...state
});

const mapDispatchToProps = dispatch => ({
    audioSelectionAction: (leftX, rightX) => dispatch(audioSelectionAction(leftX, rightX))
});

export default connect(mapStateToProps, mapDispatchToProps)(AudioImg);