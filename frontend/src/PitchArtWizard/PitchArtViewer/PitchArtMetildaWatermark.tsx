import * as React from "react";
import {Layer, Text} from "react-konva";
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
        let offset = 0;
        for (let y = 10; y < height; y+=22){
            
            for (let x = 5; x < width + 60; x+=60){
                if (offset == 1) { 
                    x+=5;
                }
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
            if (offset == 0) {
                offset = 1;
            } else if (offset == 1) {
                offset = 0;
            }
        }
        return (
            <Layer 
                offsetX={-5}
                offsetY={-5}
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

        if (this.props.type == "wm2") {         
            return this.renderWatermarkOption2(width, height);
        }
    }
}
