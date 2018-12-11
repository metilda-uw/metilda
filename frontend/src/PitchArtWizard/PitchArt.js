import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
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
        this.maxPitchIndex = this.props.pitches.indexOf(Math.max(...this.props.pitches));
        switch (this.props.pitches.length) {
            case 2:
                switch (this.maxPitchIndex) {
                    case 0:
                        this.lineStrokeColor = "#272264";
                        this.dotFillColor = "#0ba14a";
                        break;
                    case 1:
                        this.lineStrokeColor = "#71002b";
                        this.dotFillColor = "#2e3192";
                        break;
                }
                break;
            case 3:
                switch (this.maxPitchIndex) {
                    case 0:
                        this.lineStrokeColor = "#92278f";
                        this.dotFillColor = "#000000";
                        break;
                    case 1:
                        this.lineStrokeColor = "#056839";
                        this.dotFillColor = "#be72b0";
                        break;
                    case 2:
                    default:
                        this.lineStrokeColor = "#5b4a42";
                        this.dotFillColor = "#166e92";
                }
                break;
            case 4:
                switch (this.maxPitchIndex) {
                    case 0:
                        this.lineStrokeColor = "#f1592a";
                        this.dotFillColor = "#12a89d";
                        break;
                    case 1:
                        this.lineStrokeColor = "#283890";
                        this.dotFillColor = "#8cc63e";
                        break;
                    case 2:
                    default:
                        this.lineStrokeColor = "#9e1f62";
                        this.dotFillColor = "#f7941d";
                }
                break;
            default:
                this.lineStrokeColor = "black";
                this.dotFillColor = "black";
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
                                              pitches={this.props.pitches}
                                              times={this.props.times}
                                              lineStrokeColor={this.lineStrokeColor}
                                              dotFillColor={this.dotFillColor}
                                              maxPitchIndex={this.maxPitchIndex}/>;

        return (
            pitchArt
        )
    }
}

export default PitchArt;