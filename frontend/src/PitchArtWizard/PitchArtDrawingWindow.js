import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import './PitchArt.css';
import Konva from 'konva';
import { Stage, Layer, Rect, Line, Circle, Group} from 'react-konva';



class PitchArtDrawingWindow extends React.Component {
    state = {};

    constructor(props) {
        super(props);
        this.horzIndexToRectCoords = this.horzIndexToRectCoords.bind(this);
        this.vertValueToRectCoords = this.vertValueToRectCoords.bind(this);
        this.accentedPoint = this.accentedPoint.bind(this);
        this.saveImage = this.saveImage.bind(this);
        this.playSound = this.playSound.bind(this);
        this.imageBoundaryClicked = this.imageBoundaryClicked.bind(this);
        this.rectCoordsToVertValue = this.rectCoordsToVertValue.bind(this);

        this.innerWidth = this.props.width * 0.75;
        this.innerHeight = this.props.height * 0.90;
        this.pointDx0 = (this.props.width - this.innerWidth) / 2.0;
        this.pointDy0 = (this.props.height - this.innerHeight) / 2.0;

        this.innerBorderX0 = (this.props.width - this.props.width * 0.999) / 2.0;
        this.innerBorderY0 = (this.props.height - this.props.height * 0.999) / 2.0;

        // 94 quarter tones below A4
        this.minVertPitch = 30.0;

        // 11 quarter tones above A4
        this.maxVertPitch = 604.53;

        this.graphWidth = 5;
        this.borderWidth = 15;
        this.circleRadius = 10;
        this.circleStrokeWidth = 10;
        this.accentedCircleRadius = 30;
        this.lineStrokeColor = "#497dba";
        this.dotFillColor = "#497dba";
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

    playSound(pitch) {
        let synth = new window.Tone.Synth().toMaster();
        synth.triggerAttackRelease(pitch, 0.5);
    }

    imageBoundaryClicked() {
        let yPos = this.stageRef.getStage().getPointerPosition().y;
        let pitch = this.rectCoordsToVertValue(yPos);
        this.playSound(pitch);
    }

    horzIndexToRectCoords(index) {
        let time = this.props.times[index];
        let totalDuration = this.props.times[this.props.times.length - 1] - this.props.times[0];
        let timePerc = (time - this.props.times[0]) / totalDuration;
        let pointDx = timePerc * this.innerWidth;
        return this.pointDx0 + pointDx;
    }

    vertValueToRectCoords(value) {
        // scale the coordinate to be in the perceptual scale
        let valuePerc = (value - this.minVertPitch) / (this.maxVertPitch - this.minVertPitch);
        let rectHeight = this.innerHeight * valuePerc;
        return this.innerHeight - rectHeight + this.pointDy0;
    }

    rectCoordsToVertValue(rectCoord) {
        // scale the coordinate to be in the perceptual scale
        let rectCoordPerc = (rectCoord - this.pointDy0) / (this.innerHeight - this.pointDy0);
        let pitchInterval = this.maxVertPitch - this.minVertPitch;
        let pitchHeight = pitchInterval * rectCoordPerc;
        return pitchInterval - pitchHeight + this.minVertPitch;
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

    render() {
        let points = [];
        let pointPairs = [];
        let lineCircles = [];
        for (let i = 0; i < this.props.pitches.length; i++) {
            let currPitch = this.props.pitches[i];
            let x = this.horzIndexToRectCoords(i);
            let y = this.vertValueToRectCoords(currPitch);

            points.push(x);
            points.push(y);
            pointPairs.push([x, y]);

            lineCircles.push(
                <Circle x={x}
                        y={y}
                        fill={this.dotFillColor}
                        stroke={this.lineStrokeColor}
                        strokeWidth={this.circleStrokeWidth}
                        radius={this.circleRadius}
                        onClick={() => this.playSound(currPitch)}
                        key={i}/>);
        }

        var accentedPoint;

        try {
            accentedPoint = this.accentedPoint(
            pointPairs[this.maxPitchIndex][0],
            pointPairs[this.maxPitchIndex][1]);
        } catch(e) {
        }

        return (
            <div>
                <Stage ref={node => { this.stageRef = node}} width={this.props.width} height={this.props.height}>
                    <Layer>
                        <Rect width={this.props.width}
                              height={this.props.height}
                              fill="white" />
                        <Line points={[this.innerBorderX0, this.innerBorderY0,
                                       this.props.width - this.innerBorderX0, this.innerBorderY0,
                                       this.props.width - this.innerBorderX0, this.props.height - this.innerBorderY0,
                                       this.innerBorderX0, this.props.height - this.innerBorderY0,
                                       this.innerBorderX0, this.innerBorderY0]}
                              strokeWidth={this.borderWidth}
                              stroke={this.lineStrokeColor}
                              onClick={this.imageBoundaryClicked}/>
                        {accentedPoint}
                    </Layer>
                    <Layer>
                        <Line points={points}
                              strokeWidth={this.graphWidth}
                              stroke={this.lineStrokeColor}/>
                        {lineCircles}
                    </Layer>
                </Stage>
                <a className="hide" ref={node => {this.downloadRef = node}}>
                    Hidden Download Link
                </a>
                <button className="waves-effect waves-light btn metilda-pitch-art-btn"
                        onClick={this.saveImage}>
                    Save Image
                </button>
            </div>
        )
    }
}

export default PitchArtDrawingWindow;