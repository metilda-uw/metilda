import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import Konva from 'konva';
import { Stage, Layer, Rect, Line, Circle} from 'react-konva';


class PitchArt extends React.Component {
    state = {};

    constructor(props) {
        super(props);
        this.horzIndexToRectCoords = this.horzIndexToRectCoords.bind(this);
        this.vertValueToRectCoords = this.vertValueToRectCoords.bind(this);
    }

    horzIndexToRectCoords(index) {
        let innerWidth = this.props.width * 0.80;
        let pointDx0 = (this.props.width - innerWidth) / 2.0;
        let pointDx = innerWidth / (this.props.pitches.length - 1);
        return pointDx0 + (pointDx * index);
    }

    vertValueToRectCoords(value) {
        // scale the coordinates to occupy the full height
        let minPitch = Math.min(...this.props.pitches);
        value = value - minPitch;
        let innerHeight = this.props.height * 0.80;
        let pointDy0 = (this.props.height - innerHeight) / 2.0;
        let rectHeight = innerHeight * (value / Math.max(...this.props.pitches.map(val => val - minPitch)));
        return innerHeight - rectHeight + pointDy0;
    }

    render() {
        let points = [];
        let lineCircles = [];
        for (let i = 0; i < this.props.pitches.length; i++) {
            let x = this.horzIndexToRectCoords(i);
            let y = this.vertValueToRectCoords(this.props.pitches[i]);

            points.push(x);
            points.push(y);
            lineCircles.push(
                <Circle x={x}
                        y={y}
                        fill="#00cc44"
                        stroke="blue"
                        radius={10}/>);
        }

        return (
            <Stage width={this.props.width} height={this.props.height}>
                <Layer>
                    <Rect width={this.props.width}
                          height={this.props.height}
                          fill="white" />
                    <Line points={points}
                          strokeWidth={5}
                          stroke="blue"/>
                    <Line points={[0, this.props.height / 2.0, this.props.width, this.props.height / 2.0]}
                          stroke="blue"/>
                    <Line points={[this.props.width / 2.0, 0, this.props.width / 2.0, this.props.height]}
                          stroke="yellow"/>
                </Layer>
                <Layer>
                    {lineCircles}
                </Layer>
                <Layer>

                </Layer>
            </Stage>
        )
    }
}

export default PitchArt;