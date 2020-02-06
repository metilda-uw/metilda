import React, {createRef} from "react";
import {Layer, Line, Rect, Stage} from "react-konva";
import * as Tone from "tone";
import {Encoding} from "tone";
import moment from "moment";
import {connect} from "react-redux";
import {Letter, Speaker} from "../../types/types";
import "./PitchArt.css";
import PitchArtCoordConverter from "./PitchArtCoordConverter";
import PitchArtCoordinateSystem from "./PitchArtCoordinateSystem";
import PitchArtGeometry from "./PitchArtGeometry";
import PitchArtLegend from "./PitchArtLegend";
import {PitchArtWindowConfig, RawPitchValue} from "./types";
import UserPitchView from "./UserPitchView";
import {uploadAnalysis, uploadImage, uploadImageAnalysisIds} from "../../Create/ImportUtils";
import {ThunkDispatch} from "redux-thunk";
import {AppState} from "../../store/index";
import {AudioAction} from "../../store/audio/types";
import {setLatestAnalysisId} from "../../store/audio/actions";
import ReactGA from "react-ga";

export interface PitchArtDrawingWindowProps {
    speakers: Speaker[];
    width: number;
    height: number;
    minPitch: number;
    maxPitch: number;
    fileName: string;
    setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) => void;
    showDynamicContent: boolean;
    showArtDesign: boolean;
    showPitchArtLines: boolean;
    showLargeCircles: boolean;
    showVerticallyCentered: boolean;
    showAccentPitch: boolean;
    showSyllableText: boolean;
    showTimeNormalization: boolean;
    showPitchScale: boolean;
    showPerceptualScale: boolean;
    showPitchArtImageColor: boolean;
    showPrevPitchValueLists: boolean;
    rawPitchValueLists?: RawPitchValue[][];
    firebase: any;
    setLatestAnalysisId: (speakerIndex: number, latestAnalysisId: number, latestAnalysisName: string,
                          lastUploadedLetters: Letter[]) => void;
    ref: any;
}

interface State {
    activePlayIndex: number;
}

export interface ColorScheme {
    windowLineStrokeColor: string;
    lineStrokeColor: string;
    praatDotFillColor: string;
    activePlayColor: string;
    manualDotFillColor: string;
}

/**
 * NOTE: There are a number of places throughout this component that
 * have not fully been converted over to TypeScript, these areas
 * are marked with "// @ts-ignore". These are functional parts of
 * the code, they just don't have explicit types yet.
 */
class PitchArtDrawingWindow extends React.Component<PitchArtDrawingWindowProps, State> {
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

    constructor(props: PitchArtDrawingWindowProps) {
        super(props);
        this.state = {
            activePlayIndex: -1
        };
        this.saveImage = this.saveImage.bind(this);
        this.playPitchArt = this.playPitchArt.bind(this);
        this.playSound = this.playSound.bind(this);
        this.imageBoundaryClicked = this.imageBoundaryClicked.bind(this);
        this.setPointerEnabled = this.setPointerEnabled.bind(this);

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

    downloadImage = () => {
        // @ts-ignore
        const dataURL = this.stageRef.current!.getStage().toDataURL();
        this.downloadRef.current!.href = dataURL;
        this.downloadRef.current!.download = this.props.fileName;
        this.downloadRef.current!.click();
    }

    saveImage = async () => {
        // follows example from:
        // https://konvajs.github.io/docs/data_and_serialization/Stage_Data_URL.html
        // @ts-ignore (TypeScript doesn't like the toDataURL call below, but it works fine)
        const dataURL = this.stageRef.current!.getStage().toDataURL();
        // this.downloadRef.current!.href = dataURL;
        // const imageTimeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
        // this.downloadRef.current!.download = `${this.props.fileName}_${imageTimeStamp}.png`;
        ReactGA.event({
            category: "Save Image",
            action: "User pressed Save Image button"
          });
        const speakerIndicesForUnsavedAnalysis: number[] = [];
        const allAnalysisIds: number[] = [];
        this.props.speakers.forEach((item, index) => {
            if (item.latestAnalysisId == null || JSON.stringify(item.letters) !==
            JSON.stringify(item.lastUploadedLetters)) {
                speakerIndicesForUnsavedAnalysis.push(index);
            } else {
                allAnalysisIds.push(item.latestAnalysisId);
            }
        });
        if (speakerIndicesForUnsavedAnalysis.length !== 0) {
                for (const index of speakerIndicesForUnsavedAnalysis) {
                    const speaker = this.props.speakers[index];
                    const metildaWord = {
                    uploadId: speaker.uploadId,
                    letters: speaker.letters
                    } as Speaker;
                    let isValidAnalysisInput = false;
                    let updatedAnalysisName = "";
                    let analysisName;
                    while (!isValidAnalysisInput) {
                        analysisName = prompt("Analysis should be saved before saving the image. Enter analysis name", "Ex: Analysis1.json");
                        if (analysisName == null) {
                            // user canceled input
                             break;
                        }
                        updatedAnalysisName = analysisName.trim();
                        if (updatedAnalysisName.length === 0) {
                            alert("Analysis name should contain at least one character");
                        } else {
                            isValidAnalysisInput = true;
                        }
                    }
                    if (isValidAnalysisInput && analysisName !== null && analysisName !== undefined) {
                        const analysisId = await uploadAnalysis(metildaWord, speaker.fileIndex,
                            analysisName, this.props.firebase);
                        if (typeof(analysisId) === "number") {
                           this.props.setLatestAnalysisId(index, analysisId, analysisName, speaker.letters);
                           allAnalysisIds.push(analysisId);
                       }
                    } else {
                        alert("Analysis not uploaded. Analysis name is missing");
                        }

            }
        }
        let isValidImageInput = false;
        let updatedImageName = "";
        let imageName;
        while (!isValidImageInput) {
            imageName = prompt(" Enter image name", "Ex: Image1.png");
            if (imageName == null) {
                // user canceled input
                break;
            }
            updatedImageName = imageName.trim();
            if (updatedImageName.length === 0) {
                alert("Image name should contain at least one character");
            } else {
                isValidImageInput = true;
            }
        }
        if (isValidImageInput && imageName !== null && imageName !== undefined) {
        const imageId = await uploadImage(`${imageName}`, dataURL, this.props.firebase);
        if (typeof(imageId) === "number") {
        for (const id of allAnalysisIds) {
                const imageAnalysisId = await uploadImageAnalysisIds(imageId, id);
            }
        }
        // this.downloadRef.current!.click();
        } else {
            alert("Image not uploaded. Image name is missing");
            }
    }

playPitchArt() {
        if (this.props.speakers.length !== 1) {
            return;
        }

        const letters: Letter[] = this.props.speakers[0].letters;
        const env = new Tone.AmplitudeEnvelope({
            attack: 0.001,
            decay: 0.001,
            sustain: 0.001,
            release: 0.001
        }).toMaster();

        const filter = new Tone.Filter({type: "highpass", frequency: 50, rolloff: -48}).toMaster();

        // var synth = new window.Tone.Synth().toMaster().chain(filter, env);
        const synth = new Tone.Synth().toMaster().chain(filter, env);

        const tStart = letters.length > 0 ? letters[0].t0 : 0;
        const tEnd = letters.length > 0 ? letters[letters.length - 1].t1 : 0;

        interface PitchArtNote {
            time: number;
            index: number;
            duration: number;
            pitch: number;
        }

        const notes = letters.map(function(item, index) {
                return {
                    time: item.t0 - tStart,
                    duration: item.t1 - item.t0,
                    pitch: item.pitch,
                    index
                } as PitchArtNote;
            }
        );
        notes.push({time: tEnd, duration: 1, pitch: 1, index: -1});
        const controller = this;

        // @ts-ignore
        const midiPart = new Tone.Part(function(time: Encoding.Time, note: PitchArtNote) {
            controller.setState({activePlayIndex: note.index});
            if (note.index !== -1) {
                synth.triggerAttackRelease(note.pitch, note.duration, time);
            }
        }, notes).start();

        Tone.Transport.start();
    }

playSound(pitch: number) {
        const synth = new Tone.Synth().toMaster();
        synth.triggerAttackRelease(pitch, this.pitchArtSoundLengthSeconds);
    }

imageBoundaryClicked(coordConverter: PitchArtCoordConverter) {
        const yPos = this.stageRef.current!.getStage().getPointerPosition().y;
        const pitch = coordConverter.rectCoordsToVertValue(yPos);
        this.playSound(pitch);
    }

setPointerEnabled(isEnabled: boolean) {
        this.stageRef.current!.getStage().container().style.cursor
            = isEnabled ? "pointer" : "default";
    }

maybeUserPitchView(windowConfig: PitchArtWindowConfig) {
        if (!this.props.rawPitchValueLists || this.props.rawPitchValueLists.length === 0) {
            return;
        }

        const lastIndex = this.props.rawPitchValueLists.length - 1;

        if (!this.props.showPrevPitchValueLists) {
            return (
                <UserPitchView pitchValues={this.props.rawPitchValueLists[lastIndex]}
                               windowConfig={windowConfig}
                               showTimeNormalized={this.props.showTimeNormalization}
                               showVerticallyCentered={this.props.showVerticallyCentered}
                               showPerceptualScale={this.props.showPerceptualScale}
                />);
        }

        const colors: { [key: number]: string } = {
            0: "green",
            1: "orange",
            2: "blue",
            3: "brown",
            4: "red"
        };

        return (
            this.props.rawPitchValueLists.map((item: RawPitchValue[], index) =>
                <UserPitchView pitchValues={item}
                               key={"user-pitch-view-" + index}
                               windowConfig={windowConfig}
                               showTimeNormalized={this.props.showTimeNormalization}
                               showVerticallyCentered={this.props.showVerticallyCentered}
                               showPerceptualScale={this.props.showPerceptualScale}
                               fillColor={index < lastIndex ? colors[index % Object.keys(colors).length] : undefined}
                               opacity={index < lastIndex ? 0.35 : undefined}/>
            )
        );
    }

colorScheme = (showArtDesign: boolean, speaker: Speaker, speakerIndex: number): ColorScheme => {
        if (!showArtDesign) {
            const color = PitchArtLegend.SPEAKER_COLOR(speakerIndex);
            return {
                windowLineStrokeColor: "#497dba",
                lineStrokeColor: color,
                praatDotFillColor: color,
                activePlayColor: "#e8e82e",
                manualDotFillColor: "#af0008"
            };
        }

        let lineStrokeColor = "black";
        let praatDotFillColor = "black";

        const numLetters = speaker.letters.length;
        const pitches = speaker.letters.map((item) => item.pitch);
        const maxPitchIndex = pitches.indexOf(Math.max(...pitches));

        // determine color scheme
        switch (numLetters) {
            case 2:
                switch (maxPitchIndex) {
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
                switch (maxPitchIndex) {
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
                switch (maxPitchIndex) {
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
        }

        return {
            windowLineStrokeColor: lineStrokeColor,
            lineStrokeColor,
            praatDotFillColor,
            activePlayColor: "#e8e82e",
            manualDotFillColor: "#af0008"
        };
    }

maybeShowPitchScale = (windowConfig: PitchArtWindowConfig) => {
        if (!this.props.showPitchScale) {
            return;
        }

        return (
            <PitchArtCoordinateSystem
                fontSize={this.fontSize * 0.75}
                windowConfig={windowConfig}
                xOrigin={windowConfig.x0 * 0.77}
                xMax={windowConfig.x0 + windowConfig.innerWidth + (windowConfig.x0 / 2)}
                showPerceptualScale={this.props.showPerceptualScale}
                axisTickMarkClicked={this.imageBoundaryClicked}
                setPointerEnabled={this.setPointerEnabled}
            />
        );
    }

render() {
        const windowConfig = {
            innerHeight: this.innerHeight,
            innerWidth: this.innerWidth,
            y0: this.pointDy0,
            x0: this.pointDx0,
            dMin: this.props.minPitch,
            dMax: this.props.maxPitch
        };

        const colorSchemes = this.props.speakers.map((item, index) =>
            this.colorScheme(this.props.showArtDesign, item, index)
        );
        const coordConverter = new PitchArtCoordConverter(windowConfig,
            [],
            false,
            false,
            this.props.showPerceptualScale);

        return (
            <div className="PitchArtDrawingWindow">
                <Stage className="PitchArtDrawingWindow-pitchart"
                       ref={this.stageRef}
                       width={this.props.width}
                       height={this.props.height}>
                    <Layer>
                        <Rect width={this.props.width}
                              height={this.props.height}
                              fill="white"/>
                        <Line points={[this.innerBorderX0, this.innerBorderY0,
                            this.props.width - this.innerBorderX0, this.innerBorderY0,
                            this.props.width - this.innerBorderX0, this.props.height - this.innerBorderY0,
                            this.innerBorderX0, this.props.height - this.innerBorderY0,
                            this.innerBorderX0, this.innerBorderY0]}
                              strokeWidth={this.props.showPitchArtImageColor ? this.borderWidth : 0}
                              stroke={this.props.showArtDesign && colorSchemes.length === 1
                                  ? colorSchemes[0].windowLineStrokeColor : "#497dba"}
                              onClick={() => this.imageBoundaryClicked(coordConverter)}
                              onMouseEnter={() => this.setPointerEnabled(true)}
                              onMouseLeave={() => this.setPointerEnabled(false)}/>
                    </Layer>
                    {this.maybeShowPitchScale(windowConfig)}
                    <PitchArtGeometry speakers={this.props.speakers}
                                      windowConfig={windowConfig}
                                      setLetterPitch={this.props.setLetterPitch}
                                      colorSchemes={colorSchemes}
                                      playSound={this.playSound}
                                      activePlayIndex={
                                          this.props.speakers.length === 1 ? this.state.activePlayIndex : -1}
                                      showDynamicContent={this.props.showDynamicContent}
                                      showArtDesign={this.props.showArtDesign}
                                      showPitchArtLines={this.props.showPitchArtLines}
                                      showLargeCircles={this.props.showLargeCircles}
                                      showVerticallyCentered={this.props.showVerticallyCentered}
                                      showAccentPitch={this.props.showAccentPitch}
                                      showSyllableText={this.props.showSyllableText}
                                      showTimeNormalization={this.props.showTimeNormalization}
                                      showPerceptualScale={this.props.showPerceptualScale}
                                      showPrevPitchValueLists={this.props.showPrevPitchValueLists}
                                      largeCircleRadius={this.largeCircleRadius}
                                      smallCircleRadius={this.smallCircleRadius}
                                      graphWidth={this.graphWidth}
                                      fontSize={this.fontSize}
                                      circleStrokeWidth={this.circleStrokeWidth}
                                      pitchArtSoundLengthSeconds={this.pitchArtSoundLengthSeconds}
                                      accentedCircleRadius={this.accentedCircleRadius}
                                      setPointerEnabled={this.setPointerEnabled}/>
                    {this.maybeUserPitchView(windowConfig)}
                </Stage>
                <a className="hide" ref={this.downloadRef}>
                    Hidden Download Link
                </a>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, void, AudioAction>) => ({
    setLatestAnalysisId: (speakerIndex: number, latestAnalysisId: number, latestAnalysisName: string,
                          lastUploadedLetters: Letter[]) => dispatch(setLatestAnalysisId(speakerIndex, latestAnalysisId,
                            latestAnalysisName, lastUploadedLetters))
});
export default connect(null, mapDispatchToProps, null, {forwardRef: true})(PitchArtDrawingWindow);
