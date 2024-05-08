import * as React from "react";
import { Layer, Text } from "react-konva";
import { PitchArtWindowConfig } from "./types";
import PitchArtCoordConverter from "./PitchArtCoordConverter";
import moment from 'moment';

interface Props {
  type: string;
  fontSize: number;
  windowConfig: PitchArtWindowConfig;
  xOrigin: number;
  xMax: number;
  showPerceptualScale: boolean;
  showPitchScale: boolean;
}

export default class PitchArtMetildaWatermark extends React.Component<Props> {
  renderWatermarkOption1 = (width, height) => {
    const text = [];
    let currX = width * 0.25;
    let currY = height * 0.2;

    for (let i = 1; i < 3; i++) {
      for (let j = 1; j < 4; j++) {
        text.push(
          <Text
            key={i.toString() + j.toString() + "_wm"}
            x={currX}
            y={currY}
            fontFamily={"Trebuchet MS"}
            fontSize={this.props.fontSize * 2}
            text="MeTILDA"
            rotation={45}
            opacity={0.15}
          />
        );
        currX += width * 0.25;
      }
      currX = width * 0.25;
      currY += height * 0.4;
    }
    return <Layer>{text}</Layer>;
  };

  renderWatermarkOption2 = (width, height, xStart, yStart) => {
    let date = moment().format("MM DD YYYY");
    console.log(date);
    const text = "Made with MeTILDA " + date; 
    console.log(text);
    // let text = ["Made with MeTILDA ",date]; 
    let offset = 0;
    // for (let y = yStart; y < height; y += 20) {
    //   for (let x = xStart; x < width; x += 66) {
    //     if (offset === 1) {
    //       x += 3;
    //     }
    //     text.push(
    //       <Text
    //         key={x.toString() + y.toString() + "_wm"}
    //         x={x}
    //         y={y}
    //         fontFamily={"Trebuchet MS"}
    //         fontSize={this.props.fontSize}
    //         text="MeTILDA"
    //         opacity={0.15}
    //       />
    //     );
    //   }
    //   if (offset === 0) {
    //     offset = 1;
    //   } else if (offset === 1) {
    //     offset = 0;
    //   }
    // }
    console.log("width is "+ width, "height is " + height, "xstart is "+ xStart, "ytart is " + yStart);
    return (
      <Layer offsetX={-340} offsetY={-425}>
        <Text
          
            x ={xStart}
            y = {yStart}
            fontFamily={"Trebuchet MS"}
            fontSize={this.props.fontSize}
            text = {text}  
            opacity={0.15}
        />
      </Layer>
    );
  };

  render() {
    const coordConverter = new PitchArtCoordConverter(
      this.props.windowConfig,
      [
        { pitch: this.props.windowConfig.dMin, t0: 0, t1: 0 },
        { pitch: this.props.windowConfig.dMax, t0: 1, t1: 1 },
      ],
      false,
      false,
      this.props.showPerceptualScale
    );
    let width = this.props.windowConfig.x0 + this.props.windowConfig.innerWidth;
    let height =
      this.props.windowConfig.y0 + this.props.windowConfig.innerHeight;

    if (this.props.type === "wm1") {
      return this.renderWatermarkOption1(width, height);
    }

    if (this.props.type === "wm2") {
      let xStart = 0;
      let yStart = 0;
      if (!this.props.showPitchScale) {
        xStart = 20;
        yStart = 20;
        width = this.props.windowConfig.innerWidth * 1.2;
        height = this.props.windowConfig.innerHeight * 1.2;
      } else {
        // xStart = coordConverter.horzIndexToRectCoords(
        //   this.props.windowConfig.tMin
        // );
        // yStart = coordConverter.vertValueToRectCoords(
        //   this.props.windowConfig.dMax
        // );
        width = this.props.windowConfig.innerWidth * 1.2;
        height = this.props.windowConfig.innerHeight * 1.1;
      }
      return this.renderWatermarkOption2(width, height, xStart, yStart);
    }
  }
}
