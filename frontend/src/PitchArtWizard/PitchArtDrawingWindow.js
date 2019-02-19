import React, {Component} from 'react';
import './PitchArt.css';
import {Stage, Layer, Rect, Line, Circle, Group, Text} from 'react-konva';
import PitchArt from "./PitchArt";
import {roundToNearestNote, referenceExponent, exponentToNote} from "./PitchArtViewer/PitchArtScale";


class PitchArtDrawingWindow extends React.Component {
    state = {};

    constructor(props) {
        super(props);
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

        this.innerWidth = this.props.width * 0.75;
        this.innerHeight = this.props.height * 0.90;
        this.pointDx0 = (this.props.width - this.innerWidth) / 2.0;
        this.pointDy0 = (this.props.height - this.innerHeight) / 2.0;

        this.innerBorderX0 = (this.props.width - this.props.width * 0.999) / 2.0;
        this.innerBorderY0 = (this.props.height - this.props.height * 0.999) / 2.0;

        this.minPitch = this.props.minPitch;
        this.maxPitch = this.props.maxPitch;

        this.graphWidth = 5;
        this.borderWidth = 15;
        this.circleRadius = 10;
        this.circleStrokeWidth = 10;
        this.accentedCircleRadius = 30;
        this.pitchArtSoundLengthSeconds = 0.20;
        this.fontSize = 16;

        // overrideable properties
        this.lineStrokeColor = this.props.lineStrokeColor || "#497dba";
        this.praatDotFillColor = this.props.praatDotFillColor || "#497dba";
        this.manualDotFillColor = this.props.manualDotFillColor || "#af0008";
        this.maxPitchIndex = this.props.maxPitchIndex !== null
            ? this.props.maxPitchIndex : -1;
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
        let notes = this.props.letters.map((item) => (
            {time: item.t0 - tStart, duration: item.t1 - item.t0, pitch: item.pitch}));

        let midiPart = new window.Tone.Part(function (time, note) {
            synth.triggerAttackRelease(note.pitch, note.duration, time);
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

    vertValueToRectCoords(pitch) {
        let refExp = referenceExponent(pitch);
        let pitchIntervalSteps = referenceExponent(this.maxPitch) - referenceExponent(this.minPitch);
        let valuePerc = (refExp - referenceExponent(this.minPitch)) / pitchIntervalSteps;
        let rectHeight = this.innerHeight * valuePerc;
        return this.innerHeight - rectHeight + this.pointDy0;
    }

    rectCoordsToVertValue(rectCoord) {
        let rectCoordPerc = (rectCoord - this.pointDy0) / (this.innerHeight - this.pointDy0);
        rectCoordPerc = Math.min(rectCoordPerc, 1.0);
        rectCoordPerc = Math.max(rectCoordPerc, 0.0);
        rectCoordPerc = 1.0 - rectCoordPerc; // invert so 0.0 is lowest frequency and 1.0 is highest frequency

        // Convert the rectangular coordinate to the appropriate "step" along the perceptual scale
        let pitchIntervalSteps = referenceExponent(this.maxPitch) - referenceExponent(this.minPitch);
        let rectCoordStepOffset = Math.round(pitchIntervalSteps * rectCoordPerc);
        let rectCoordPitch = exponentToNote(referenceExponent(this.minPitch) + rectCoordStepOffset);

        rectCoordPitch = Math.min(rectCoordPitch, this.maxPitch);
        rectCoordPitch = Math.max(rectCoordPitch, this.minPitch);
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

    render() {
        let points = [];
        let pointPairs = [];
        let lineCircles = [];
        let controller = this;
        let letterSyllables = [];
        for (let i = 0; i < this.props.letters.length; i++) {
            let currPitch = this.props.letters[i].pitch;
            let x = this.horzIndexToRectCoords(i);
            let y = this.vertValueToRectCoords(currPitch);

            // The 'align' property is not working with the current version of
            // react-konva that's used. As a result, we're manually shifting
            // the text to be centered.
            let konvaFontSizeAsPixels = this.fontSize * 0.65;
            let text = this.props.letters[i].letter;

            letterSyllables.push(
                <Text key={i}
                      x={x - (konvaFontSizeAsPixels * text.length / 2.0)}
                      y={y + this.circleRadius * 1.9}  // position text below the pitch circle
                      fontSize={this.fontSize}
                      text={text}/>
            );

            points.push(x);
            points.push(y);
            pointPairs.push([x, y]);
            lineCircles.push(
                <Circle key={i}
                        x={x}
                        y={y}
                        fill={this.props.letters[i].isManualPitch ? this.manualDotFillColor : this.praatDotFillColor}
                        stroke={this.props.letters[i].isManualPitch ? this.manualDotFillColor : this.lineStrokeColor}
                        strokeWidth={this.circleStrokeWidth}
                        radius={this.circleRadius}
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

        if (this.maxPitchIndex !== -1 && pointPairs.length >= 1) {
            accentedPoint = this.accentedPoint(
                pointPairs[this.maxPitchIndex][0],
                pointPairs[this.maxPitchIndex][1]);
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
                              stroke={this.lineStrokeColor}
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
                                      stroke={this.lineStrokeColor}/>
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