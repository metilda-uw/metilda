import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import Konva from 'konva';
import { Stage, Layer, Rect, Line, Circle, Group} from 'react-konva';


class PitchArt extends React.Component {
    state = {};

    constructor(props) {
        super(props);
        this.horzIndexToRectCoords = this.horzIndexToRectCoords.bind(this);
        this.vertValueToRectCoords = this.vertValueToRectCoords.bind(this);
        this.accentedPoint = this.accentedPoint.bind(this);

        this.innerWidth = this.props.width * 0.75;
        this.innerHeight = this.props.height * 0.70;
        this.pointDx0 = (this.props.width - this.innerWidth) / 2.0;
        this.pointDy0 = (this.props.height - this.innerHeight) / 2.0;

        this.innerBorderX0 = (this.props.width - this.props.width * 0.95) / 2.0;
        this.innerBorderY0 = (this.props.height - this.props.height * 0.95) / 2.0;

        this.graphWidth = 10;
        this.borderWidth = 10;
        this.circleRadius = 15;
        this.circleStrokeWidth = 10;
        this.accentedCircleRadius = 30;

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

    horzIndexToRectCoords(index) {
        let pointDx = this.innerWidth / (this.props.pitches.length - 1);
        return this.pointDx0 + (pointDx * index);
    }

    vertValueToRectCoords(value) {
        // scale the coordinates to occupy the full height
        let minPitch = Math.min(...this.props.pitches);
        value = value - minPitch;
        let rectHeight = this.innerHeight * (value / Math.max(...this.props.pitches.map(val => val - minPitch)));
        return this.innerHeight - rectHeight + this.pointDy0;
    }

    accentedPoint(x, y) {
        let accentedPoint =
            <Circle x={x}
                    y={y}
                    fill={"#fcb040"}
                    radius={this.accentedCircleRadius}
            />;

        let outlineCircles = [0, 1, 2].map(index =>
            <Circle x={x}
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
            let x = this.horzIndexToRectCoords(i);
            let y = this.vertValueToRectCoords(this.props.pitches[i]);

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
                        key={i}/>);
        }

        let accentedPoint = this.accentedPoint(
            pointPairs[this.maxPitchIndex][0],
            pointPairs[this.maxPitchIndex][1]);

        return (
            <Stage width={this.props.width} height={this.props.height}>
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
                          stroke={this.lineStrokeColor}/>
                    {accentedPoint}
                </Layer>
                <Layer>
                    <Line points={points}
                          strokeWidth={this.graphWidth}
                          stroke={this.lineStrokeColor}/>
                    {lineCircles}
                </Layer>
            </Stage>
        )
    }
}

export default PitchArt;