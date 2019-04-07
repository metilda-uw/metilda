import React from "react";
import {Circle, Group, Layer, Line, Text} from "react-konva";
import {Letter} from "../../types/types";
import {ColorScheme} from "../PitchArtDrawingWindow";
import PitchArtCoordConverter from "./PitchArtCoordConverter";
import {PitchArtWindowConfig, RawPitchValue} from "./types";

interface Props {
    letters: Letter[][];
    windowConfig: PitchArtWindowConfig;
    manualPitchChange: (index: number, newPitch: number) => void;
    playSound: (pitch: number) => void;
    activePlayIndex: number;
    colorScheme: ColorScheme;
    showDynamicContent: boolean;
    showArtDesign: boolean;
    showPitchArtLines: boolean;
    showLargeCircles: boolean;
    showVerticallyCentered: boolean;
    showAccentPitch: boolean;
    showSyllableText: boolean;
    showPrevPitchValueLists: boolean;
    largeCircleRadius: number;
    smallCircleRadius: number;
    graphWidth: number;
    fontSize: number;
    circleStrokeWidth: number;
    pitchArtSoundLengthSeconds: number;
    accentedCircleRadius: number;
    setPointerEnabled: (isEnabled: boolean) => (void);
}

export default class PitchArtGeometry extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    renderLayer = (letters: Letter[]) => {
        const pitches = letters.map((item) => item.pitch);
        const maxPitchIndex = pitches.indexOf(Math.max(...pitches));

        const circleRadius = this.props.showLargeCircles ?
            this.props.largeCircleRadius : this.props.smallCircleRadius;

        const pitchValues: RawPitchValue[] = letters.filter((data) => !data.isWordSep);

        const coordConverter = new PitchArtCoordConverter(
            this.props.windowConfig,
            pitchValues,
            this.props.showVerticallyCentered
        );

        const points = [];
        const pointPairs = [];
        const lineCircles = [];
        const controller = this;
        const letterSyllables = [];
        const lines = [];
        let currLinePoints = [];
        for (let i = 0; i < letters.length; i++) {
            if (letters[i].isWordSep) {
                if (currLinePoints.length > 0) {
                    lines.push(
                        <Line key={i + "_pa_line"}
                              points={currLinePoints}
                              strokeWidth={this.props.graphWidth}
                              stroke={this.props.colorScheme.lineStrokeColor}/>
                    );
                    currLinePoints = [];
                }
                continue;
            }

            const currPitch = letters[i].pitch;
            const x = coordConverter.horzIndexToRectCoords(letters[i].t0);
            const y = coordConverter.vertValueToRectCoords(letters[i].pitch);

            // The 'align' property is not working with the current version of
            // react-konva that's used. As a result, we're manually shifting
            // the text to be centered.
            const konvaFontSizeAsPixels = this.props.fontSize * 0.65;
            const text = letters[i].syllable;

            letterSyllables.push(
                <Text key={i}
                      x={x - (konvaFontSizeAsPixels * text.length / 2.0)}
                      y={y + circleRadius * 1.9}  // position text below the pitch circle
                      fontSize={this.props.fontSize}
                      text={text}/>
            );

            let circleFill = this.props.colorScheme.praatDotFillColor;
            let circleStroke = this.props.colorScheme.lineStrokeColor;

            if (this.props.showDynamicContent) {
                if (this.props.activePlayIndex === i) {
                    circleFill = this.props.colorScheme.activePlayColor;
                    circleStroke = this.props.colorScheme.activePlayColor;
                } else if (letters[i].isManualPitch) {
                    circleFill = this.props.colorScheme.manualDotFillColor;
                    circleStroke = this.props.colorScheme.manualDotFillColor;
                } else {
                    circleFill = this.props.colorScheme.praatDotFillColor;
                    circleStroke = this.props.colorScheme.lineStrokeColor;
                }
            }

            points.push(x);
            points.push(y);
            currLinePoints.push(x);
            currLinePoints.push(y);
            pointPairs.push([x, y]);
            lineCircles.push(
                <Circle key={i + circleFill + circleStroke}
                        x={x}
                        y={y}
                        fill={circleFill}
                        stroke={circleStroke}
                        strokeWidth={this.props.circleStrokeWidth}
                        radius={circleRadius}
                        onClick={() => this.props.playSound(currPitch)}
                        onMouseEnter={() => this.props.setPointerEnabled(true)}
                        onMouseLeave={() => this.props.setPointerEnabled(false)}
                        draggable={letters[i].isManualPitch}
                        dragDistance={5}
                        dragBoundFunc={
                            function(pos) {
                                // @ts-ignore
                                if (!this.isDragging()) {
                                    return pos;
                                }

                                const newPitch = coordConverter.rectCoordsToVertValue(pos.y);
                                return {
                                    // @ts-ignore
                                    x: this.getAbsolutePosition().x,
                                    y: coordConverter.vertValueToRectCoords(newPitch)
                                };
                            }
                        }
                        onDragEnd={
                            function() {
                                // @ts-ignore
                                const yPos: number = this.getPosition().y;
                                const newPitch = coordConverter.rectCoordsToVertValue(yPos);
                                controller.props.manualPitchChange(i, newPitch);
                            }
                        }
                />);
        }

        if (currLinePoints.length > 0) {
            lines.push(
                <Line key={"last_pa_line"}
                      points={currLinePoints}
                      strokeWidth={this.props.graphWidth}
                      stroke={this.props.colorScheme.lineStrokeColor}/>
            );
        }

        let accentedPoint;

        if (this.props.showAccentPitch
            && maxPitchIndex !== null
            && pointPairs.length >= 1) {
            accentedPoint = this.accentedPoint(
                pointPairs[maxPitchIndex][0],
                pointPairs[maxPitchIndex][1]);
        }

        return (
            <Layer>
                {accentedPoint}
                {
                    this.props.showPitchArtLines ? lines : []
                }
                {lineCircles}
                {this.props.showSyllableText ? letterSyllables : []}
            </Layer>
        );
    }

    accentedPoint = (x: number, y: number) => {
        const accentedPoint =
            <Circle x={x}
                    y={y}
                    fill={"#fcb040"}
                    radius={this.props.accentedCircleRadius}
            />;

        const outlineCircles = [0, 1, 2].map((index) =>
            <Circle key={index}
                    x={x}
                    y={y}
                    stroke={"#e38748"}
                    radius={this.props.accentedCircleRadius + index * 8}
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
        return (
            <React.Fragment>
                {
                    this.props.letters.map((item) => this.renderLayer(item))
                }
            </React.Fragment>
        );
    }
}
