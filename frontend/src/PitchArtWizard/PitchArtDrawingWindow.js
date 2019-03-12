import React, {Component} from 'react';
import './PitchArt.css';
import {Stage, Layer, Rect, Line, Circle, Group, Text} from 'react-konva';
import PitchArt from "./PitchArt";
import {roundToNearestNote, referenceExponent, exponentToNote} from "./PitchArtViewer/PitchArtScale";


class PitchArtDrawingWindow extends React.Component {
    state = {};

    constructor(props) {
        super(props);
        this.state = {
            activePlayIndex: -1
        };
        this.horzIndexToRectCoords = this.horzIndexToRectCoords.bind(this);
        this.vertValueToRectCoords = this.vertValueToRectCoords.bind(this);
        this.accentedPoint = this.accentedPoint.bind(this);
        this.saveImage = this.saveImage.bind(this);
        this.playPitchArt = this.playPitchArt.bind(this);
        this.playSound = this.playSound.bind(this);
        this.imageBoundaryClicked = this.imageBoundaryClicked.bind(this);
        this.rectCoordsToVertValue = this.rectCoordsToVertValue.bind(this);
        this.setPointerEnabled = this.setPointerEnabled.bind(this);
        this.pitchArtDragged = this.pitchArtDragged.bind(this);
        this.colorScheme = this.colorScheme.bind(this);
        this.centerOffset = this.centerOffset.bind(this);

        this.innerWidth = this.props.width * 0.75;
        this.innerHeight = this.props.height * 0.90;
        this.pointDx0 = (this.props.width - this.innerWidth) / 2.0;
        this.pointDy0 = (this.props.height - this.innerHeight) / 2.0;

        this.innerBorderX0 = (this.props.width - this.props.width * 0.999) / 2.0;
        this.innerBorderY0 = (this.props.height - this.props.height * 0.999) / 2.0;

        this.graphWidth = 5;
        this.borderWidth = 15;
        this.smallCircleRadius = 4;
        this.largeCircleRadius = 10;
        this.circleStrokeWidth = 10;
        this.accentedCircleRadius = 30;
        this.pitchArtSoundLengthSeconds = 0.20;
        this.fontSize = 16;
    }

    saveImage() {
        // trip file extension from upload ID
        let fileName = this.props.uploadId.split(".")[0] + ".png";

        // follows example from:
        // https://konvajs.github.io/docs/data_and_serialization/Stage_Data_URL.html
        let dataURL = this.stageRef.getStage().toDataURL();
        this.downloadRef.href = dataURL;
        this.downloadRef.download = fileName;
        this.downloadRef.click();
    }

    playPitchArt() {
        var env = new window.Tone.AmplitudeEnvelope({
            "attack": 0.001,
            "decay": 0.001,
            "sustain": 0.001,
            "release": 0.001
        }).toMaster();

        var filter = new window.Tone.Filter({type: "highpass", frequency: 50, rolloff: -48}).toMaster();

        //var synth = new window.Tone.Synth().toMaster().chain(filter, env);
        var synth = new window.Tone.Synth().toMaster().chain(filter, env);

        let tStart = this.props.letters.length > 0 ? this.props.letters[0].t0 : 0;
        let tEnd = this.props.letters.length > 0 ? this.props.letters[this.props.letters.length - 1].t1 : 0;
        let notes = this.props.letters.map(function (item, index) {
                return {time: item.t0 - tStart, duration: item.t1 - item.t0, pitch: item.pitch, index: index};
            }
        );
        notes.push({time: tEnd, duration: 1, pitch: 1, index: -1});
        let controller = this;
        let midiPart = new window.Tone.Part(function (time, note) {
            controller.setState({activePlayIndex: note.index});
            if (note.index !== -1) {
                synth.triggerAttackRelease(note.pitch, note.duration, time);
            }
        }, notes).start();

        window.Tone.Transport.start();
    }

    playSound(pitch) {
        let synth = new window.Tone.Synth().toMaster();
        synth.triggerAttackRelease(pitch, this.pitchArtSoundLengthSeconds);
    }

    imageBoundaryClicked() {
        let yPos = this.stageRef.getStage().getPointerPosition().y;
        let pitch = this.rectCoordsToVertValue(yPos);
        this.playSound(pitch);
    }

    horzIndexToRectCoords(index) {
        let time = this.props.letters[index].startTime;
        let timePerc;

        if (this.props.letters.length === 1) {
            timePerc = 0.1;
        } else {
            let totalDuration = this.props.letters[this.props.letters.length - 1].startTime - this.props.letters[0].startTime;
            timePerc = (time - this.props.letters[0].startTime) / totalDuration;
        }

        let pointDx = timePerc * this.innerWidth;
        return this.pointDx0 + pointDx;
    }

    vertValueToRectCoords(pitch, vertOffset=0) {
        let refExp = referenceExponent(pitch);
        let pitchIntervalSteps = referenceExponent(this.props.maxPitch) - referenceExponent(this.props.minPitch);
        let valuePerc = (refExp - referenceExponent(this.props.minPitch)) / pitchIntervalSteps;
        let rectHeight = this.innerHeight * valuePerc;
        return this.innerHeight - rectHeight + this.pointDy0 - vertOffset;
    }

    rectCoordsToVertValue(rectCoord) {
        let rectCoordPerc = (rectCoord - this.pointDy0) / (this.innerHeight - this.pointDy0);
        rectCoordPerc = Math.min(rectCoordPerc, 1.0);
        rectCoordPerc = Math.max(rectCoordPerc, 0.0);
        rectCoordPerc = 1.0 - rectCoordPerc; // invert so 0.0 is lowest frequency and 1.0 is highest frequency

        // Convert the rectangular coordinate to the appropriate "step" along the perceptual scale
        let pitchIntervalSteps = referenceExponent(this.props.maxPitch) - referenceExponent(this.props.minPitch);
        let rectCoordStepOffset = Math.round(pitchIntervalSteps * rectCoordPerc);
        let rectCoordPitch = exponentToNote(referenceExponent(this.props.minPitch) + rectCoordStepOffset);

        rectCoordPitch = Math.min(rectCoordPitch, this.props.maxPitch);
        rectCoordPitch = Math.max(rectCoordPitch, this.props.minPitch);
        return rectCoordPitch;
    }

    accentedPoint(x, y) {
        let accentedPoint =
            <Circle x={x}
                    y={y}
                    fill={"#fcb040"}
                    radius={this.accentedCircleRadius}
            />;

        let outlineCircles = [0, 1, 2].map(index =>
            <Circle key={index}
                    x={x}
                    y={y}
                    stroke={"#e38748"}
                    radius={this.accentedCircleRadius + index * 8}
            />
        );

        return (
            <Group>
                {accentedPoint}
                {outlineCircles}
            </Group>
        );
    }

    setPointerEnabled(isEnabled) {
        this.stageRef.getStage().container().style.cursor
            = isEnabled ? 'pointer' : 'default';
    }

    pitchArtDragged(pos) {
        return {
            x: this.getAbsolutePosition().x,
            y: pos.y
        }
    }

    colorScheme(isVisible) {
        if (isVisible) {
            return {
                lineStrokeColor: "#497dba",
                praatDotFillColor: "#497dba",
                activePlayColor: "#e8e82e",
                manualDotFillColor: "#af0008"
            };
        }

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
                praatDotFillColor: praatDotFillColor,
                activePlayColor: null,
                manualDotFillColor: null};
    }

    centerOffset() {
        if (this.props.letters.length < 1) {
            return 0.0;
        }

        let coords = this.props.letters.map(
            letter => this.vertValueToRectCoords(letter.pitch));

        let figureHeight = Math.max(...coords) - Math.min(...coords);
        let figureCenterY = Math.min(...coords) + (figureHeight / 2.0);
        let windowCenterY = this.pointDy0 + (this.innerHeight / 2.0);

        return figureCenterY - windowCenterY;
    }

    render() {
        let colorScheme = this.colorScheme(this.props.isVisible);

        let circleRadius = this.props.showLargeCircles ?
            this.largeCircleRadius : this.smallCircleRadius;

        let vertOffset = this.props.showVerticallyCentered ? this.centerOffset(): 0.0;

        let points = [];
        let pointPairs = [];
        let lineCircles = [];
        let controller = this;
        let letterSyllables = [];
        for (let i = 0; i < this.props.letters.length; i++) {
            let currPitch = this.props.letters[i].pitch;
            let x = this.horzIndexToRectCoords(i);
            let y = this.vertValueToRectCoords(currPitch, vertOffset);

            // The 'align' property is not working with the current version of
            // react-konva that's used. As a result, we're manually shifting
            // the text to be centered.
            let konvaFontSizeAsPixels = this.fontSize * 0.65;
            let text = this.props.letters[i].letter;

            letterSyllables.push(
                <Text key={i}
                      x={x - (konvaFontSizeAsPixels * text.length / 2.0)}
                      y={y + circleRadius * 1.9}  // position text below the pitch circle
                      fontSize={this.fontSize}
                      text={text}/>
            );

            let circleFill = null;
            let circleStroke = null;

            if (this.props.isVisible) {
                if (this.state.activePlayIndex === i) {
                    circleFill = colorScheme.activePlayColor;
                    circleStroke = colorScheme.activePlayColor;
                } else if (this.props.letters[i].isManualPitch)  {
                    circleFill = colorScheme.manualDotFillColor;
                    circleStroke = colorScheme.manualDotFillColor;
                } else {
                    circleFill = colorScheme.praatDotFillColor;
                    circleStroke = colorScheme.lineStrokeColor;
                }
            } else {
                circleFill = colorScheme.praatDotFillColor;
                circleStroke = colorScheme.lineStrokeColor;
            }

            points.push(x);
            points.push(y);
            pointPairs.push([x, y]);
            lineCircles.push(
                <Circle key={i + circleFill + circleStroke}
                        x={x}
                        y={y}
                        fill={circleFill}
                        stroke={circleStroke}
                        strokeWidth={this.circleStrokeWidth}
                        radius={circleRadius}
                        onClick={() => this.playSound(currPitch)}
                        onMouseEnter={() => this.setPointerEnabled(true)}
                        onMouseLeave={() => this.setPointerEnabled(false)}
                        draggable={this.props.letters[i].isManualPitch}
                        dragDistance={5}
                        dragBoundFunc={function (pos) {
                            if (!this.isDragging()) {
                                return pos;
                            }

                            let newPitch = controller.rectCoordsToVertValue(pos.y);
                            return {
                                x: this.getAbsolutePosition().x,
                                y: controller.vertValueToRectCoords(newPitch)
                            };
                        }
                        }
                        onDragEnd={function () {
                            let newPitch = controller.rectCoordsToVertValue(this.getPosition().y);
                            controller.props.manualPitchChange(i, newPitch);
                        }
                        }/>);
        }

        var accentedPoint;

        if (this.props.showAccentPitch
            && this.props.maxPitchIndex !== null
            && pointPairs.length >= 1) {
            accentedPoint = this.accentedPoint(
                pointPairs[this.props.maxPitchIndex][0],
                pointPairs[this.props.maxPitchIndex][1]);
        }

        return (
            <div>
                <Stage ref={node => {
                    this.stageRef = node
                }} width={this.props.width} height={this.props.height}>
                    <Layer>
                        <Rect width={this.props.width}
                              height={this.props.height}
                              fill="white"/>
                        <Line points={[this.innerBorderX0, this.innerBorderY0,
                            this.props.width - this.innerBorderX0, this.innerBorderY0,
                            this.props.width - this.innerBorderX0, this.props.height - this.innerBorderY0,
                            this.innerBorderX0, this.props.height - this.innerBorderY0,
                            this.innerBorderX0, this.innerBorderY0]}
                              strokeWidth={this.borderWidth}
                              stroke={colorScheme.lineStrokeColor}
                              onClick={this.imageBoundaryClicked}
                              onMouseEnter={() => this.setPointerEnabled(true)}
                              onMouseLeave={() => this.setPointerEnabled(false)}/>
                        {accentedPoint}
                    </Layer>
                    <Layer>
                        {
                            this.props.showPitchArtLines ?
                                <Line points={points}
                                      strokeWidth={this.graphWidth}
                                      stroke={colorScheme.lineStrokeColor}/>
                                : []
                        }
                        {lineCircles}
                    </Layer>
                    <Layer>
                        {this.props.showSyllableText ? letterSyllables : []}
                    </Layer>
                </Stage>
                <a className="hide" ref={node => {
                    this.downloadRef = node
                }}>
                    Hidden Download Link
                </a>
            </div>
        )
    }
}

export default PitchArtDrawingWindow;