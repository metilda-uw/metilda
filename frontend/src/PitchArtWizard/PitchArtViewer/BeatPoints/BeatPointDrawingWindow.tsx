import { red } from "@material-ui/core/colors";
import * as React from "react";
import {Layer, Line, Rect, Stage, Text, Circle} from "react-konva";
import {Letter, Speaker} from "../../../types/types";
import PitchArtCoordConverter from "../PitchArtCoordConverter";
import {PitchArtWindowConfig, RawPitchValue} from "../types";

interface Props {
    speaker: Speaker;
    index: number;
    width: number;
    height: number;
    minPitch: number;
    maxPitch: number;
    showPitchArtImageColor: boolean;
}

class BeatPointDrawingWindow extends React.Component<Props> {
    private readonly innerWidth: number;
    private readonly innerHeight: number;
    private readonly pointDx0: number;
    private readonly pointDy0: number;
    private readonly innerBorderX0: number;
    private readonly innerBorderY0: number;
    private readonly graphWidth: number;
    private readonly borderWidth: number;
    private readonly smallCircleRadius: number;


    constructor(props: Props) {
        super(props);

        this.innerWidth = this.props.width * 0.75;
        this.innerHeight = this.props.height * 0.90;
        this.pointDx0 = (this.props.width - this.innerWidth) / 2.0;
        this.pointDy0 = (this.props.height - this.innerHeight) / 2.0;

        this.innerBorderX0 = (this.props.width - this.props.width * 0.999) / 2.0;
        this.innerBorderY0 = (this.props.height - this.props.height * 0.999) / 2.0;

        this.graphWidth = 5;
        this.borderWidth = 15;
        this.smallCircleRadius = 4;
    }

    // Draw the beat point for a speakers letters.
    // Adapt from PitchArtGeometry which draws the speakers PitchArt 
    renderSpeakersLayers = (speaker: Speaker, speakerIndex: number) => {
        
        const windowConfig = {
            innerHeight: this.innerHeight,
            innerWidth: this.innerWidth,
            y0: this.pointDy0,
            x0: this.pointDx0,
            dMin: this.props.minPitch,
            dMax: this.props.maxPitch
        };

        const pitchValues: RawPitchValue[] = speaker.letters.filter((data) => !data.isWordSep);


        const coordConverter = new PitchArtCoordConverter(
            windowConfig,
            pitchValues,
            false,
            false,
            //this.props.showPerceptualScale);
            false
        )

        const pitches = speaker.letters.map((item) => item.pitch);
        const maxPitchIndex = pitches.indexOf(Math.max(...pitches));

        const circleRadius = 15;

        const points = [];
        const pointPairs = [];
        const lineCircles = [];
        const controller = this;
        const lines = [];
        let currLinePoints = [];

        for (let i = 0; i < speaker.letters.length; i++) {
            if (speaker.letters[i].isWordSep) {
                if (currLinePoints.length > 0) {
                    lines.push(
                        <Line key={i + "_pa_line"}
                              points={currLinePoints}
                              strokeWidth={5}
                              stroke={"Red"}/>
                    );
                    currLinePoints = [];
                }
                continue;
            }

            const currPitch = speaker.letters[i].pitch;
            const x = coordConverter.horzIndexToRectCoords(speaker.letters[i].t0);
            const y = coordConverter.vertValueToRectCoords(speaker.letters[i].pitch);

            // The 'align' property is not working with the current version of
            // react-konva that's used. As a result, we're manually shifting
            // the text to be centered.
            const konvaFontSizeAsPixels = 11 * 0.65;

            let circleFill = {red};
            let circleStroke = {red};

            points.push(x);
            points.push(y);
            currLinePoints.push(x);
            currLinePoints.push(y);
            pointPairs.push([x, y]);
            lineCircles.push(
                <Circle key={i.toString() + circleFill + circleStroke}
                        x={x}
                        y={this.props.height/2}
                        fill={"red"}
                        stroke={"red"}
                        strokeWidth={15}
                        radius={circleRadius}
                        draggable={speaker.letters[i].isManualPitch}
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
                            }
                        }
                />);
        }

        if (currLinePoints.length > 0) {
            lines.push(
                <Line key={"last_pa_line"}
                        points={currLinePoints}
                        strokeWidth={15}
                        stroke={"red"}/>
            );
        }

        return (
            <Layer key={speakerIndex}>
                {lineCircles}
            </Layer>
        );
    }
    
        // horizontal position is taken from a letters t0.
        //const x = coordConverter.horzIndexToRectCoords(speaker.letters[i].t0);
    
    // Figure out how to adjust t0 time by dragging - setLetterTime using dispatch.
    // Konva has a draggable property for objects

    render() {

        return (
            <div className="BeatPointWindow">
                <Stage className="BeatPointWindow-stage"
                    width={this.props.width}
                    height={this.props.height}>
                        <Layer>
                            <Rect width={this.props.width}
                                    height={this.props.height}
                                    fill="white"/>
                            
                            <Line points={[this.innerBorderX0, this.innerBorderY0,
                                this.innerBorderX0, this.props.height - this.innerBorderY0,
                                this.props.width - this.innerBorderX0, this.props.height - this.innerBorderY0,
                                this.props.width - this.innerBorderX0, this.innerBorderY0]}
                                strokeWidth={this.props.showPitchArtImageColor ? this.borderWidth : 0}
                                stroke={"#497dba"}
                            />
                        </Layer>
                {this.renderSpeakersLayers(this.props.speaker, this.props.index)}        
                </Stage>
            </div>
        );       
    }

}

export default BeatPointDrawingWindow;