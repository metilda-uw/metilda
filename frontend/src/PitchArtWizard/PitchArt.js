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
        this.playPitchArt = this.playPitchArt.bind(this);
        this.colorScheme = this.colorScheme.bind(this);
    }

    saveImage() {
        this.hiddenRef.saveImage();
    }

    playPitchArt() {
        this.visibleRef.playPitchArt();
    }

    colorScheme() {
        let lineStrokeColor = null;
        let praatDotFillColor = null;

        // determine color scheme
        switch (this.props.letters.length) {
            case 2:
                switch (this.props.maxPitchIndex) {
                    case 0:
                        lineStrokeColor = "#272264";
                        praatDotFillColor = "#0ba14a";
                        break;
                    case 1:
                        lineStrokeColor = "#71002b";
                        praatDotFillColor = "#2e3192";
                        break;
                }
                break;
            case 3:
                switch (this.props.maxPitchIndex) {
                    case 0:
                        lineStrokeColor = "#92278f";
                        praatDotFillColor = "#000000";
                        break;
                    case 1:
                        lineStrokeColor = "#056839";
                        praatDotFillColor = "#be72b0";
                        break;
                    case 2:
                    default:
                        lineStrokeColor = "#5b4a42";
                        praatDotFillColor = "#166e92";
                }
                break;
            case 4:
                switch (this.props.maxPitchIndex) {
                    case 0:
                        lineStrokeColor = "#f1592a";
                        praatDotFillColor = "#12a89d";
                        break;
                    case 1:
                        lineStrokeColor = "#283890";
                        praatDotFillColor = "#8cc63e";
                        break;
                    case 2:
                    default:
                        lineStrokeColor = "#9e1f62";
                        praatDotFillColor = "#f7941d";
                }
                break;
            default:
                lineStrokeColor = "black";
                praatDotFillColor = "black";
        }

        return {lineStrokeColor: lineStrokeColor,
                praatDotFillColor: praatDotFillColor}
    }

    render() {
        let colorScheme = this.colorScheme();

        let visiblePitchArt =
              <PitchArtDrawingWindow
                        ref={node => { this.visibleRef = node}}
                        width={this.props.width}
                        height={this.props.height}
                        minPitch={this.props.minPitch}
                        maxPitch={this.props.maxPitch}
                        uploadId={this.props.uploadId}
                        manualPitchChange={this.props.manualPitchChange}
                        maxPitchIndex={this.props.maxPitchIndex}
                        showAccentPitch={this.props.showAccentPitch}
                        showSyllableText={this.props.showSyllableText}
                        showPitchArtLines={this.props.showPitchArtLines}
                        activePlayIndex={this.props.activePlayIndex}
                        onActivePlayIndex={this.props.onActivePlayIndex}
                        letters={this.props.letters}/>;
        let hiddenPitchArt = <PitchArtDrawingWindow ref={node => { this.hiddenRef = node}}
                                              width={this.props.width}
                                              height={this.props.height}
                                              uploadId={this.props.uploadId}
                                              minPitch={this.props.minPitch}
                                              maxPitch={this.props.maxPitch}
                                              lineStrokeColor={colorScheme.lineStrokeColor}
                                              praatDotFillColor={colorScheme.praatDotFillColor}
                                              maxPitchIndex={this.props.maxPitchIndex}
                                              manualPitchChange={this.props.manualPitchChange}
                                              showAccentPitch={true}
                                              showSyllableText={this.props.showSyllableText}
                                              showPitchArtLines={this.props.showPitchArtLines}
                                              activePlayColor={this.activePlayColor}
                                              activePlayIndex={-1}
                                              onActivePlayIndex={this.props.onActivePlayIndex}
                                              letters={this.props.letters}/>;

        return (
            <div>
                <div>
                    {visiblePitchArt}
                </div>
                <div className="hide">
                    {hiddenPitchArt}
                </div>
                <div id="metilda-pitch-art-btn-container">
                    <button className="waves-effect waves-light btn metilda-pitch-art-btn"
                            disabled={this.props.letters.length === 0}
                            onClick={this.playPitchArt}>
                        Play
                    </button>
                    <button className="waves-effect waves-light btn metilda-pitch-art-btn"
                            disabled={this.props.letters.length === 0}
                            onClick={this.saveImage}>
                        Save Image
                    </button>
                </div>
            </div>
        )
    }
}

export default PitchArt;