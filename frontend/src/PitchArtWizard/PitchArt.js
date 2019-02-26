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
        this.hiddenRef.saveImage();
    }

    playPitchArt() {
        this.visibleRef.playPitchArt();
    }

    render() {
          let visiblePitchArt =
              <PitchArtDrawingWindow
                        ref={node => { this.visibleRef = node}}
                        width={this.props.width}
                        height={this.props.height}
                        minPitch={this.props.minPitch}
                        maxPitch={this.props.maxPitch}
                        uploadId={this.props.uploadId}
                        manualPitchChange={this.props.manualPitchChange}
                        maxPitchIndex={this.props.showAccentPitch ? this.props.maxPitchIndex : null}
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
                                              lineStrokeColor={this.lineStrokeColor}
                                              praatDotFillColor={this.praatDotFillColor}
                                              maxPitchIndex={this.props.maxPitchIndex}
                                              manualPitchChange={this.props.manualPitchChange}
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