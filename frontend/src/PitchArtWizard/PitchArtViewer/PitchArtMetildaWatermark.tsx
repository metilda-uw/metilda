import * as React from "react";
import {Group, Layer, Line, Text} from "react-konva";
import PitchArtCoordConverter from "./PitchArtCoordConverter";
import {PitchArtWindowConfig} from "./types";

interface Props {
    fontSize: number;
    windowConfig: PitchArtWindowConfig;
    xOrigin: number;
    xMax: number;
}

export default class PitchArtMetildaWatermark extends React.Component<Props> {
    static TEXT_BOX_HEIGHT(): number {
        return 20;
    }

    static TEXT_BOX_WIDTH(): number {
        return 30;
    }

    render() {
        console.log("Rendering Watermark");
        const coordConverter = new PitchArtCoordConverter(
            this.props.windowConfig,
            [{pitch: this.props.windowConfig.dMin, t0: 0, t1: 0},
                        {pitch: this.props.windowConfig.dMax, t0: 1, t1: 1}],
            false,
            false,
            false
        );


        const yMin = coordConverter.vertValueToRectCoords(this.props.windowConfig.dMin);
        const yMax = coordConverter.vertValueToRectCoords(this.props.windowConfig.dMax);

        console.log(this.props.windowConfig.dMax);
        return (

            <Layer>
                <Text 
                    x={this.props.xMax * .25}
                    y={this.props.windowConfig.dMax * .75}
                    fontSize={this.props.fontSize * 2}
                    fontFamily={"Helvetica"}
                    text="Created with MeTilda"
                    opacity={.5}/>
            </Layer>
        );
    }
}