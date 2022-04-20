import * as React from "react";
import {Stage, Group, Layer, Line, Text} from "react-konva";
import {PitchArtWindowConfig} from "./types";

interface Props {
    type: string;
    fontSize: number;
    windowConfig: PitchArtWindowConfig;
    xOrigin: number;
    xMax: number;
}

export default class PitchArtMetildaWatermark extends React.Component<Props> {

    renderWatermarkOption1 = (width, height) => {
        let text = [];
        let currX = width * .25;
        let currY = height * .20;

        for (let i = 1; i < 3; i++){
            for (let j = 1; j < 4; j++){
                text.push(
                    <Text key={i.toString() + j.toString() + "_wm"}
                        x={currX}
                        y={currY}
                        fontFamily={"Trebuchet MS"}
                        fontSize={this.props.fontSize * 2}
                        text="MeTilda"
                        rotation={45}
                        opacity={.25}
                    />
                );
            currX += width * .25;
            }
            currX = width * .25;
            currY += height * .40;
        }
        return (
            <Layer>
                {text}
            </Layer>
        );

    }

    renderWatermarkOption2 = (width, height) => {
        let text = [];

        for (let y = 10; y < height; y+=22){
            
            for (let x = 10; x < height; y+=65){
                text.push(
                    <Text key={x+ y + "_wm"}
                        x={x}
                        y={y}
                        fontFamily={"Trebuchet MS"}
                        fontSize={this.props.fontSize}
                        text="MeTilda"
                        opacity={.50}
                    />
                );
            }

        }
        return (
            <Layer 
                offsetX={-5}
                offsetY={-5}
                width={100}
                height={100}
            > 
                {text}
            </Layer>
        );

    }

    render() {

        const width = this.props.windowConfig.x0 + this.props.windowConfig.innerWidth;
        const height = this.props.windowConfig.y0 + this.props.windowConfig.innerHeight;

        if (this.props.type == "wm1") {         
            return this.renderWatermarkOption1(width, height);
        }

        // Option 2 is the Metilda text repeating
        // Create the text objects and add them to an array 

        return this.renderWatermarkOption2(width, height);
    }
}
