import * as React from "react";
import {Group, Layer, Line, Text} from "react-konva";
import PitchArtCoordConverter from "./PitchArtCoordConverter";
import {PitchArtWindowConfig, RawPitchValue} from "./types";

interface Props {
    fontSize: number;
    windowConfig: PitchArtWindowConfig;
    xOrigin: number;
    xMax: number;
    showPerceptualScale: boolean;
    axisTickMarkClicked: (coordConverter: PitchArtCoordConverter) => void;
    setPointerEnabled: (isEnabled: boolean) => void;
}

export default class PitchArtCoordinateSystem extends React.Component<Props> {
    static TEXT_BOX_HEIGHT(): number {
        return 20;
    }

    static TEXT_BOX_WIDTH(): number {
        return 30;
    }

    render() {
        const coordConverter = new PitchArtCoordConverter(
            this.props.windowConfig,
            [{pitch: this.props.windowConfig.dMin, t0: 0, t1: 0},
                        {pitch: this.props.windowConfig.dMax, t0: 1, t1: 1}],
            false,
            false,
            this.props.showPerceptualScale
        );

        const yMin = coordConverter.vertValueToRectCoords(this.props.windowConfig.dMin);
        const yMax = coordConverter.vertValueToRectCoords(this.props.windowConfig.dMax);

        // Intelligently choose the number of steps to avoid picking values
        // that are too close together
        const axisTickMarks = coordConverter.vertValueRange(
            this.props.windowConfig.dMin,
            this.props.windowConfig.dMax
        );

        const tickWidth = 5;

        const yAxisTitle = this.props.showPerceptualScale ? "MeTILDA Perceptual Scale (Hz)" : "Linear Scale (Hz)";

        return (
            <Layer>
                {
                    axisTickMarks.map((value, index) => {
                        const currVertValue = coordConverter.vertValueToRectCoords(value);
                        return (
                            <Group key={index}>
                                <Line points={[this.props.xOrigin - tickWidth, currVertValue,
                                               this.props.xOrigin, currVertValue]}
                                      strokeWidth={1}
                                      stroke="black"
                                />
                                <Text x={this.props.xOrigin - PitchArtCoordinateSystem.TEXT_BOX_WIDTH()}
                                      y={currVertValue - PitchArtCoordinateSystem.TEXT_BOX_HEIGHT() / 2.0}
                                      fontSize={this.props.fontSize}
                                      height={PitchArtCoordinateSystem.TEXT_BOX_HEIGHT()}
                                      verticalAlign="middle"
                                      onClick={() => this.props.axisTickMarkClicked(coordConverter)}
                                      onMouseEnter={() => this.props.setPointerEnabled(true)}
                                      onMouseLeave={() => this.props.setPointerEnabled(false)}
                                      text={`${Math.round(value).toFixed(0)}`}
                                />
                            </Group>
                        );
                    })
                }
                <Text x={this.props.xOrigin * 0.17}
                      y={yMin}
                      width={Math.abs(yMax - yMin)}
                      align={"center"}
                      fontSize={this.props.fontSize * 1.4}
                      text={yAxisTitle}
                      rotation={-90}/>
                <Line points={[this.props.xOrigin, yMin, this.props.xMax, yMin]}
                      strokeWidth={1}
                      stroke="black"
                />
                <Line points={[this.props.xOrigin, yMin, this.props.xOrigin, yMax]}
                      strokeWidth={1}
                      stroke="black"/>
            </Layer>
        );
    }
}
