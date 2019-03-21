import React, {createRef} from 'react';
import './PitchArt.css';
import {Circle, Group, Layer, Line, Rect, Stage, Text} from 'react-konva';
import {exponentToNote, referenceExponent} from "./PitchArtViewer/PitchArtScale";
import {PitchArtLetter} from "../types/types";
import * as Tone from 'tone';
import {Encoding} from 'tone';
import UserPitchView from "./PitchArtViewer/UserPitchView";
import {RawPitchValue} from "./PitchArtViewer/types";
import PitchArtCoordConverter from "./PitchArtViewer/PitchArtCoordConverter";

interface Props {
    letters: Array<PitchArtLetter>,
    width: number,
    height: number,
    minPitch: number,
    maxPitch: number,
    maxPitchIndex: number,
    fileName: string,
    manualPitchChange: (index: number, newPitch: number) => void,
    isVisible: boolean,
    showPitchArtLines: boolean,
    showLargeCircles: boolean,
    showVerticallyCentered: boolean,
    showAccentPitch: boolean,
    showSyllableText: boolean,
    rawPitchValues?: Array<RawPitchValue>
}

interface State {
    activePlayIndex: number
}

/**
 * NOTE: There are a number of places throughout this component that
 * have not fully been converted over to TypeScript, these areas
 * are marked with "// @ts-ignore". These are functional parts of
 * the code, they just don't have explicit types yet.
 */
class PitchArtDrawingWindow extends React.Component<Props, State> {
    private readonly innerWidth: number;
    private readonly innerHeight: number;
    private readonly pointDx0: number;
    private readonly pointDy0: number;
    private readonly innerBorderX0: number;
    private readonly innerBorderY0: number;
    private readonly graphWidth: number;
    private readonly borderWidth: number;
    private readonly smallCircleRadius: number;
    private readonly largeCircleRadius: number;
    private readonly circleStrokeWidth: number;
    private readonly accentedCircleRadius: number;
    private readonly pitchArtSoundLengthSeconds: number;
    private readonly fontSize: number;
    private downloadRef = createRef<HTMLAnchorElement>();
    private stageRef = createRef<Stage>();

    constructor(props: Props) {
        super(props);
        this.state = {
            activePlayIndex: -1
        };
        this.accentedPoint = this.accentedPoint.bind(this);
        this.saveImage = this.saveImage.bind(this);
        this.playPitchArt = this.playPitchArt.bind(this);
        this.playSound = this.playSound.bind(this);
        this.imageBoundaryClicked = this.imageBoundaryClicked.bind(this);
        this.rectCoordsToVertValue = this.rectCoordsToVertValue.bind(this);
        this.setPointerEnabled = this.setPointerEnabled.bind(this);
        this.colorScheme = this.colorScheme.bind(this);

        this.innerWidth = this.props.width * 0.75;
        this.innerHeight = this.props.height * 0.90;
        this.pointDx0 = (this.props.width - this.innerWidth) / 2.0;
        this.pointDy0 = (this.props.height - this.innerHeight) / 2.0;

        this.innerBorderX0 = (this.props.width - this.props.width * 0.999) / 2.0;
        this.innerBorderY0 = (this.props.height - this.props.height * 0.999) / 2.0;

        this.graphWidth = 5;
        this.borderWidth = 15;
        this.smallCircleRadius = 4;
        this.largeCircleRadius = 10;
        this.circleStrokeWidth = 10;
        this.accentedCircleRadius = 30;
        this.pitchArtSoundLengthSeconds = 0.20;
        this.fontSize = 16;
    }

    saveImage() {
        // trip file extension from upload ID
        let fileName = this.props.fileName.split(".")[0] + ".png";

        // follows example from:
        // https://konvajs.github.io/docs/data_and_serialization/Stage_Data_URL.html
        // @ts-ignore (TypeScript doesn't like the toDataURL call below, but it works fine)
        let dataURL = this.stageRef.current!.getStage().toDataURL();
        this.downloadRef.current!.href = dataURL;
        this.downloadRef.current!.download = fileName;
        this.downloadRef.current!.click();
    }

    playPitchArt() {
        var env = new Tone.AmplitudeEnvelope({
            "attack": 0.001,
            "decay": 0.001,
            "sustain": 0.001,
            "release": 0.001
        }).toMaster();

        var filter = new Tone.Filter({type: "highpass", frequency: 50, rolloff: -48}).toMaster();

        //var synth = new window.Tone.Synth().toMaster().chain(filter, env);
        var synth = new Tone.Synth().toMaster().chain(filter, env);

        let tStart = this.props.letters.length > 0 ? this.props.letters[0].t0 : 0;
        let tEnd = this.props.letters.length > 0 ? this.props.letters[this.props.letters.length - 1].t1 : 0;
        interface PitchArtNote {
            time: number,
            index: number,
            duration: number,
            pitch: number
        }
        let notes = this.props.letters.map(function (item, index) {
                return {time: item.t0 - tStart, duration: item.t1 - item.t0, pitch: item.pitch, index: index} as PitchArtNote;
            }
        );
        notes.push({time: tEnd, duration: 1, pitch: 1, index: -1});
        let controller = this;

        // @ts-ignore
        let midiPart = new Tone.Part(function (time: Encoding.Time, note: PitchArtNote) {
            controller.setState({activePlayIndex: note.index});
            if (note.index !== -1) {
                synth.triggerAttackRelease(note.pitch, note.duration, time);
            }
        }, notes).start();

        Tone.Transport.start();
    }

    playSound(pitch: number) {
        let synth = new Tone.Synth().toMaster();
        synth.triggerAttackRelease(pitch, this.pitchArtSoundLengthSeconds);
    }

    imageBoundaryClicked() {
        let yPos = this.stageRef.current!.getStage().getPointerPosition().y;
        let pitch = this.rectCoordsToVertValue(yPos);
        this.playSound(pitch);
    }

    rectCoordsToVertValue(rectCoord: number) {
        let rectCoordPerc = (rectCoord - this.pointDy0) / (this.innerHeight - this.pointDy0);
        rectCoordPerc = Math.min(rectCoordPerc, 1.0);
        rectCoordPerc = Math.max(rectCoordPerc, 0.0);
        rectCoordPerc = 1.0 - rectCoordPerc; // invert so 0.0 is lowest frequency and 1.0 is highest frequency

        // Convert the rectangular coordinate to the appropriate "step" along the perceptual scale
        let pitchIntervalSteps = referenceExponent(this.props.maxPitch) - referenceExponent(this.props.minPitch);
        let rectCoordStepOffset = Math.round(pitchIntervalSteps * rectCoordPerc);
        let rectCoordPitch = exponentToNote(referenceExponent(this.props.minPitch) + rectCoordStepOffset);

        rectCoordPitch = Math.min(rectCoordPitch, this.props.maxPitch);
        rectCoordPitch = Math.max(rectCoordPitch, this.props.minPitch);
        return rectCoordPitch;
    }

    accentedPoint(x: number, y: number) {
        let accentedPoint =
            <Circle x={x}
                    y={y}
                    fill={"#fcb040"}
                    radius={this.accentedCircleRadius}
            />;

        let outlineCircles = [0, 1, 2].map(index =>
            <Circle key={index}
                    x={x}
                    y={y}
                    stroke={"#e38748"}
                    radius={this.accentedCircleRadius + index * 8}
            />
        );

        return (
            <Group>
                {accentedPoint}
                {outlineCircles}
            </Group>
        );
    }

    setPointerEnabled(isEnabled: boolean) {
        this.stageRef.current!.getStage().container().style.cursor
            = isEnabled ? 'pointer' : 'default';
    }

    colorScheme(isVisible: boolean) {
        if (isVisible) {
            return {
                lineStrokeColor: "#497dba",
                praatDotFillColor: "#497dba",
                activePlayColor: "#e8e82e",
                manualDotFillColor: "#af0008"
            };
        }

        let lineStrokeColor = null;
        let praatDotFillColor = null;

        // determine color scheme
        switch (this.props.letters.length) {
            case 2:
                switch (this.props.maxPitchIndex) {
                    case 0:
                        lineStrokeColor = "#272264";
                        praatDotFillColor = "#0ba14a";
                        break;
                    case 1:
                        lineStrokeColor = "#71002b";
                        praatDotFillColor = "#2e3192";
                        break;
                }
                break;
            case 3:
                switch (this.props.maxPitchIndex) {
                    case 0:
                        lineStrokeColor = "#92278f";
                        praatDotFillColor = "#000000";
                        break;
                    case 1:
                        lineStrokeColor = "#056839";
                        praatDotFillColor = "#be72b0";
                        break;
                    case 2:
                    default:
                        lineStrokeColor = "#5b4a42";
                        praatDotFillColor = "#166e92";
                }
                break;
            case 4:
                switch (this.props.maxPitchIndex) {
                    case 0:
                        lineStrokeColor = "#f1592a";
                        praatDotFillColor = "#12a89d";
                        break;
                    case 1:
                        lineStrokeColor = "#283890";
                        praatDotFillColor = "#8cc63e";
                        break;
                    case 2:
                    default:
                        lineStrokeColor = "#9e1f62";
                        praatDotFillColor = "#f7941d";
                }
                break;
            default:
                lineStrokeColor = "black";
                praatDotFillColor = "black";
        }

        return {lineStrokeColor: lineStrokeColor,
                praatDotFillColor: praatDotFillColor,
                activePlayColor: null,
                manualDotFillColor: null};
    }

    render() {
        let colorScheme = this.colorScheme(this.props.isVisible);

        let circleRadius = this.props.showLargeCircles ?
            this.largeCircleRadius : this.smallCircleRadius;

        let pitchValues: Array<RawPitchValue> = this.props.letters.filter(data => !data.isWordSep);

        let windowConfig = {
                innerHeight: this.innerHeight,
                innerWidth: this.innerWidth,
                y0: this.pointDy0,
                x0: this.pointDx0,
                dMin: this.props.minPitch,
                dMax: this.props.maxPitch
            };
        let coordConverter = new PitchArtCoordConverter(
            windowConfig,
            pitchValues,
            this.props.showVerticallyCentered
        );

        let points = [];
        let pointPairs = [];
        let lineCircles = [];
        let controller = this;
        let letterSyllables = [];
        let lines = [];
        let currLinePoints = [];
        for (let i = 0; i < this.props.letters.length; i++) {
            if (this.props.letters[i].isWordSep) {
                if (currLinePoints.length > 0) {
                    lines.push(
                        <Line key={i + "_pa_line"}
                              points={currLinePoints}
                              strokeWidth={this.graphWidth}
                              // @ts-ignore
                              stroke={colorScheme.lineStrokeColor}/>
                    );
                    currLinePoints = [];
                }
                continue;
            }

            let currPitch = this.props.letters[i].pitch;
            let x = coordConverter.horzIndexToRectCoords(this.props.letters[i].t0);
            let y = coordConverter.vertValueToRectCoords(this.props.letters[i].pitch);

            // The 'align' property is not working with the current version of
            // react-konva that's used. As a result, we're manually shifting
            // the text to be centered.
            let konvaFontSizeAsPixels = this.fontSize * 0.65;
            let text = this.props.letters[i].letter;

            letterSyllables.push(
                <Text key={i}
                      x={x - (konvaFontSizeAsPixels * text.length / 2.0)}
                      y={y + circleRadius * 1.9}  // position text below the pitch circle
                      fontSize={this.fontSize}
                      text={text}/>
            );

            let circleFill = colorScheme.praatDotFillColor;
            let circleStroke = colorScheme.lineStrokeColor;

            if (this.props.isVisible) {
                if (this.state.activePlayIndex === i) {
                    circleFill = colorScheme.activePlayColor;
                    circleStroke = colorScheme.activePlayColor;
                } else if (this.props.letters[i].isManualPitch)  {
                    circleFill = colorScheme.manualDotFillColor;
                    circleStroke = colorScheme.manualDotFillColor;
                } else {
                    circleFill = colorScheme.praatDotFillColor;
                    circleStroke = colorScheme.lineStrokeColor;
                }
            }

            points.push(x);
            points.push(y);
            currLinePoints.push(x);
            currLinePoints.push(y);
            pointPairs.push([x, y]);
            lineCircles.push(
                // @ts-ignore
                <Circle key={i + circleFill + circleStroke}
                        x={x}
                        y={y}
                        // @ts-ignore
                        fill={circleFill}
                        // @ts-ignore
                        stroke={circleStroke}
                        strokeWidth={this.circleStrokeWidth}
                        radius={circleRadius}
                        onClick={() => this.playSound(currPitch)}
                        onMouseEnter={() => this.setPointerEnabled(true)}
                        onMouseLeave={() => this.setPointerEnabled(false)}
                        draggable={this.props.letters[i].isManualPitch}
                        dragDistance={5}
                        dragBoundFunc={function (pos) {
                            // @ts-ignore
                            if (!this.isDragging()) {
                                return pos;
                            }

                            let newPitch = controller.rectCoordsToVertValue(pos.y);
                            return {
                                // @ts-ignore
                                x: this.getAbsolutePosition().x,
                                y: coordConverter.vertValueToRectCoords(newPitch)
                            };
                        }
                        }
                        onDragEnd={function () {
                            // @ts-ignore
                            let newPitch = controller.rectCoordsToVertValue(this.getPosition().y);
                            controller.props.manualPitchChange(i, newPitch);
                        }
                        }/>);
        }

        if (currLinePoints.length > 0) {
            lines.push(
                <Line key={"last_pa_line"}
                      points={currLinePoints}
                      strokeWidth={this.graphWidth}
                      // @ts-ignore
                      stroke={colorScheme.lineStrokeColor}/>
            );
        }

        var accentedPoint;

        if (this.props.showAccentPitch
            && this.props.maxPitchIndex !== null
            && pointPairs.length >= 1) {
            accentedPoint = this.accentedPoint(
                pointPairs[this.props.maxPitchIndex][0],
                pointPairs[this.props.maxPitchIndex][1]);
        }

        return (
            <div>
                <Stage ref={this.stageRef} width={this.props.width} height={this.props.height}>
                    <Layer>
                        <Rect width={this.props.width}
                              height={this.props.height}
                              fill="white"/>
                        <Line points={[this.innerBorderX0, this.innerBorderY0,
                            this.props.width - this.innerBorderX0, this.innerBorderY0,
                            this.props.width - this.innerBorderX0, this.props.height - this.innerBorderY0,
                            this.innerBorderX0, this.props.height - this.innerBorderY0,
                            this.innerBorderX0, this.innerBorderY0]}
                              strokeWidth={this.borderWidth}
                              // @ts-ignore
                              stroke={colorScheme.lineStrokeColor}
                              onClick={this.imageBoundaryClicked}
                              onMouseEnter={() => this.setPointerEnabled(true)}
                              onMouseLeave={() => this.setPointerEnabled(false)}/>
                        {accentedPoint}
                    </Layer>
                    <Layer>
                        {
                            this.props.showPitchArtLines ? lines : []
                        }
                        {lineCircles}
                    </Layer>
                    <Layer>
                        {this.props.showSyllableText ? letterSyllables : []}
                    </Layer>
                    {
                        this.props.rawPitchValues &&
                            <UserPitchView pitchValues={this.props.rawPitchValues}
                                           windowConfig={windowConfig}
                                           showVerticallyCentered={this.props.showVerticallyCentered}/>
                    }
                </Stage>
                <a className="hide" ref={this.downloadRef}>
                    Hidden Download Link
                </a>
            </div>
        )
    }
}

export default PitchArtDrawingWindow;