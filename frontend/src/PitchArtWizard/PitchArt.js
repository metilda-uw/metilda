import React, {Component} from 'react';
import './PitchArt.css';
import Konva from 'konva';
import { Stage, Layer, Rect, Line, Circle, Group} from 'react-konva';
import PitchArtDrawingWindow from "./PitchArtDrawingWindow";


class PitchArt extends React.Component {
    state = {};

    constructor(props) {
        super(props);

        this.saveImage = this.saveImage.bind(this);

        // determine color scheme
        switch (this.props.letters.length) {
            case 2:
                switch (this.props.maxPitchIndex) {
                    case 0:
                        this.lineStrokeColor = "#272264";
                        this.praatDotFillColor = "#0ba14a";
                        break;
                    case 1:
                        this.lineStrokeColor = "#71002b";
                        this.praatDotFillColor = "#2e3192";
                        break;
                }
                break;
            case 3:
                switch (this.props.maxPitchIndex) {
                    case 0:
                        this.lineStrokeColor = "#92278f";
                        this.praatDotFillColor = "#000000";
                        break;
                    case 1:
                        this.lineStrokeColor = "#056839";
                        this.praatDotFillColor = "#be72b0";
                        break;
                    case 2:
                    default:
                        this.lineStrokeColor = "#5b4a42";
                        this.praatDotFillColor = "#166e92";
                }
                break;
            case 4:
                switch (this.props.maxPitchIndex) {
                    case 0:
                        this.lineStrokeColor = "#f1592a";
                        this.praatDotFillColor = "#12a89d";
                        break;
                    case 1:
                        this.lineStrokeColor = "#283890";
                        this.praatDotFillColor = "#8cc63e";
                        break;
                    case 2:
                    default:
                        this.lineStrokeColor = "#9e1f62";
                        this.praatDotFillColor = "#f7941d";
                }
                break;
            default:
                this.lineStrokeColor = "black";
                this.praatDotFillColor = "black";
        }
    }

    saveImage() {
        this.pitchArtRef.saveImage();
    }

    render() {
        let pitchArt = <PitchArtDrawingWindow ref={node => { this.pitchArtRef = node}}
                                              width={this.props.width}
                                              height={this.props.height}
                                              uploadId={this.props.uploadId}
                                              minVertPitch={this.props.minVertPitch}
                                              maxVertPitch={this.props.maxVertPitch}
                                              lineStrokeColor={this.lineStrokeColor}
                                              praatDotFillColor={this.praatDotFillColor}
                                              maxPitchIndex={this.props.maxPitchIndex}
                                              manualPitchChange={this.props.manualPitchChange}
                                              showSyllableText={this.props.showSyllableText}
                                              letters={this.props.letters}/>;

        return (
            <div>
                <div className="hide">
                    {pitchArt}
                </div>
                <div id="metilda-pitch-art-btn-container">
                    <button className="waves-effect waves-light btn metilda-pitch-art-btn"
                            onClick={this.saveImage}>
                        Save Image
                    </button>
                </div>
            </div>
        )
    }
}

export default PitchArt;