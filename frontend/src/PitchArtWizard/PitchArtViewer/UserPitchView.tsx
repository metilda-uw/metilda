import * as React from "react";
import {Circle, Layer} from "react-konva";
import PitchArtCoordConverter from "./PitchArtCoordConverter";
import {PitchArtWindowConfig, RawPitchValue} from "./types";

interface Props {
    pitchValues: RawPitchValue[];
    windowConfig: PitchArtWindowConfig;
    showVerticallyCentered: boolean;
    showTimeNormalized: boolean;
    showPerceptualScale: boolean;
    fillColor?: string;
    opacity?: number;
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
        const coordConverter = new PitchArtCoordConverter(
            this.props.windowConfig,
            this.props.pitchValues,
            this.props.showVerticallyCentered,
            this.props.showTimeNormalized,
            this.props.showPerceptualScale
        );

        const points: number[] = [];
        const circles: any[] = [];
        const circleRadius = this.circleRadius;
        const lineColor = this.props.fillColor || this.fillColor;
        const opacity = this.props.opacity || 1.0;

        this.props.pitchValues.forEach(function(value, index) {
            const x = coordConverter.horzIndexToRectCoords(value.t0);
            const y = coordConverter.vertValueToRectCoords(value.pitch);
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
