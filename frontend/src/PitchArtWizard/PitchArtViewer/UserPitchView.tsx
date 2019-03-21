import * as React from 'react';
import {PitchArtWindowConfig, RawPitchValue} from "./types";
import {Layer, Line} from "react-konva";
import PitchArtCoordConverter from "./PitchArtCoordConverter";

interface Props {
    pitchValues: Array<RawPitchValue>,
    windowConfig: PitchArtWindowConfig,
    showVerticallyCentered: boolean
}

class UserPitchView extends React.Component<Props> {
    private readonly lineWidth: number;
    private readonly lineColor: string;

    constructor(props: Props) {
        super(props);
        this.lineWidth = 3;
        this.lineColor = "#FF0000";
    }

    render() {
        let coordConverter = new PitchArtCoordConverter(
            this.props.windowConfig,
            this.props.pitchValues,
            this.props.showVerticallyCentered
        );

        let points: Array<number> = [];
        this.props.pitchValues.forEach(function(value) {
            points.push(coordConverter.horzIndexToRectCoords(value.t0));
            points.push(coordConverter.vertValueToRectCoords(value.pitch));
        });

        return (
            <Layer>
                <Line points={points}
                      strokeWidth={this.lineWidth}
                      stroke={this.lineColor} />
            </Layer>
        );
    }
}

export default UserPitchView;
