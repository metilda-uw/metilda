import * as React from 'react';
import {PitchArtWindowConfig, RawPitchValue} from "./types";
import {Layer, Line, Circle} from "react-konva";
import PitchArtCoordConverter from "./PitchArtCoordConverter";

interface Props {
    pitchValues: Array<RawPitchValue>,
    windowConfig: PitchArtWindowConfig,
    showVerticallyCentered: boolean,
    fillColor?: string,
    opacity?: number
}

class UserPitchView extends React.Component<Props> {
    private readonly lineWidth: number;
    private readonly fillColor: string;
    private readonly circleRadius: number;

    constructor(props: Props) {
        super(props);
        this.lineWidth = 3;
        this.fillColor = "#FF0000";
        this.circleRadius = 3;
    }

    render() {
        let coordConverter = new PitchArtCoordConverter(
            this.props.windowConfig,
            this.props.pitchValues,
            this.props.showVerticallyCentered
        );

        let points: Array<number> = [];
        let circles: Array<any> = [];
        let circleRadius = this.circleRadius;
        let lineColor = this.props.fillColor || this.fillColor;
        let opacity = this.props.opacity || 1.0;

        this.props.pitchValues.forEach(function(value, index) {
            let x = coordConverter.horzIndexToRectCoords(value.t0);
            let y = coordConverter.vertValueToRectCoords(value.pitch);
            circles.push(
                <Circle key={index}
                        radius={circleRadius}
                        x={x}
                        y={y}
                        opacity={opacity}
                        fill={lineColor}
                />
            );
            points.push(x);
            points.push(y);
        });

        return (
            <Layer>
                {/*<Line points={points}*/}
                      {/*strokeWidth={this.lineWidth}*/}
                      {/*stroke={this.lineColor} />*/}
                {circles}
            </Layer>
        );
    }
}

export default UserPitchView;
