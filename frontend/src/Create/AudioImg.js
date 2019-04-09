import React, {Component} from 'react';

import $ from "jquery";
import '../Lib/imgareaselect/css/imgareaselect-default.css';
import * as ImgAreaSelect from '../Lib/imgareaselect/scripts/jquery.imgareaselect.js';
import "../PitchArtWizard/GlobalStyling.css";

class AudioImg extends Component {
    state = {};

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            imgObj: null
        };

        this.timeCoordToImageCoord = this.timeCoordToImageCoord.bind(this);
        this.metildaAudioAnalysisImageRef = React.createRef();
    }

    timeCoordToImageCoord(t) {
        let startOffset = this.props.imageWidth * this.props.xminPerc;

        // clip times that lie beyond the image boundaries
        if (t < this.props.minAudioTime) {
            return startOffset;
        } else if (t > this.props.maxAudioTime) {
            return startOffset + this.props.maxAudioX - this.props.minAudioX;
        }

        let dt = this.props.maxAudioTime - this.props.minAudioTime;
        let u0 = (t - this.props.minAudioTime) / dt;

        let dx = this.props.maxAudioX - this.props.minAudioX;

        let x0 = startOffset + u0 * dx;

        return x0
    }

    componentWillUnmount() {
        this.state.imgObj.remove();
    }

    audioImgId = () => {
        return `imgareaselect-speaker-${this.props.speakerIndex}`;
    }

    componentDidMount() {
        const {xminPerc, xmaxPerc} = this.props;

        let audioImage = this;
        let cropAreaLeftX;
        let cropAreaRightX;
        let $el = $(this.metildaAudioAnalysisImageRef.current);
        $el.mousedown(this.onMouseDown);

        let imgBox = {xminPerc, xmaxPerc};
        let prevMaxWidth;
        let isProgrammaticSelection = false;

        window.onresize = function () {
            prevMaxWidth = undefined;
        };

        const audioImgId = this.audioImgId();

        let imgObj = $el.imgAreaSelect({
            instance: true,
            handles: true,
            classPrefix: audioImgId,
            resizable: false,
            movable: false,
            parent: `#${audioImgId}`,
            onInit: function () {
                $(`.${audioImgId}-selection, ` +
                    `.${audioImgId}-border1, ` +
                    `.${audioImgId}-border2, ` +
                    `.${audioImgId}-border3, ` +
                    `.${audioImgId}-border4, ` +
                    `.${audioImgId}-outer`).mousedown((e) => {
                    e.preventDefault();
                    audioImage.onMouseDown(e)
                }).contextmenu((e) => e.preventDefault());

                // apply styling to custom imgareaselect divs
                $(`.${audioImgId}-border1`).addClass("imgareaselect-border1");
                $(`.${audioImgId}-border2`).addClass("imgareaselect-border2");
                $(`.${audioImgId}-border3`).addClass("imgareaselect-border3");
                $(`.${audioImgId}-border4`).addClass("imgareaselect-border4");
                $(`.${audioImgId}-outer`).addClass("imgareaselect-outer");

                audioImage.setState({isLoaded: true, imgObj: imgObj}, function () {
                    imgObj.setOptions({minHeight: $el.height()});
                });

                audioImage.props.onAudioImageLoaded(imgObj.cancelSelection, function (t1, t2) {
                    isProgrammaticSelection = true;
                    // clear existing selections
                    imgObj.cancelSelection();

                    let leftX = audioImage.timeCoordToImageCoord(t1);
                    let rightX = audioImage.timeCoordToImageCoord(t2);
                    if (leftX < rightX) {
                        // The y1 and y2 values are intentionally set such that the resulting
                        // height of the selection is less than the image height. This is
                        // done on purpose to avoid a weird resize bug that results in the
                        // wrong selection being shown.
                        let y1 = imgObj.getOptions().minHeight * 0.002;
                        let y2 = imgObj.getOptions().minHeight * 0.998;
                        imgObj.setSelection(leftX, y1, rightX, y2, true);
                        imgObj.setOptions({show: true});
                        imgObj.update();
                    }
                    isProgrammaticSelection = false;
                });
            },
            onSelectStart: function (img, loc) {
                if (isProgrammaticSelection) {
                    return;
                }
                if (loc.x1 < imgBox.xminPerc * img.width || loc.x2 > imgBox.xmaxPerc * img.width) {
                    imgObj.cancelSelection();
                } else {
                    cropAreaLeftX = loc.x1;
                    cropAreaRightX = loc.x2;
                }
            },
            onSelectChange: function (img, loc) {
                if (isProgrammaticSelection) {
                    return;
                }
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
            onSelectEnd: function (img, loc) {
                if (isProgrammaticSelection) {
                    return;
                }
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

    onMouseDown = (event) => {
        if (event.which === 1) {
            this.props.showImgMenu(-1, -1);
        } else if (event.which === 3) {
            this.props.showImgMenu(event.pageX, event.pageY);
        }
    }

    render() {
        const {src} = this.props;
        return (
            <div onContextMenu={(e) => e.preventDefault()}>
                <div id={this.audioImgId()} />
                <img id="metilda-audio-analysis-image"
                     ref={this.metildaAudioAnalysisImageRef}
                     className={"metilda-audio-analysis-image " + (this.state.isLoaded ? "" : "hide")}
                     src={src}/>
            </div>
        );
    }
}

export default AudioImg;