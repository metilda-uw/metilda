import React from "react";
import {Circle, Group, Layer, Line, Text} from "react-konva";
import {Letter, Speaker} from "../../types/types";
import PitchArtCoordConverter from "./PitchArtCoordConverter";
import {ColorScheme} from "./PitchArtDrawingWindow";
import {PitchArtWindowConfig, RawPitchValue} from "./types";

interface Props {
    speakers: Speaker[];
    windowConfig: PitchArtWindowConfig;
    setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) => void;
    playSound: (pitch: number) => void;
    activePlayIndex: number;
    colorSchemes: ColorScheme[];
    showDynamicContent: boolean;
    showArtDesign: boolean;
    showPitchArtLines: boolean;
    showLargeCircles: boolean;
    showVerticallyCentered: boolean;
    showAccentPitch: boolean;
    showSyllableText: boolean;
    showTimeNormalization: boolean;
    showPerceptualScale: boolean;
    showPrevPitchValueLists: boolean;
    largeCircleRadius: number;
    smallCircleRadius: number;
    graphWidth: number;
    fontSize: number;
    circleStrokeWidth: number;
    pitchArtSoundLengthSeconds: number;
    accentedCircleRadius: number;
    setPointerEnabled: (isEnabled: boolean) => (void);
    isLearn?: boolean;
    onOpenContextMenu: (
        x: number,
        y: number,
        speakerIndex: number,
        letterIndex: number
        ) => void;
    secondaryAccent?: { speakerIndex: number; letterIndex: number } | null;
    mergedIndexes: {
        [letterIndex: number]: {
            anchorSpeakerIndex: number;
        };
    };
}

export default class PitchArtGeometry extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.state = {
            contextMenuVisible: false,
            contextMenuX: 0,
            contextMenuY: 0,
            contextMenuSpeakerIndex: null,
            contextMenuLetterIndex: null,
            secondaryAccent: null
        };
    }

    getSharedCoordConverter = () => {
        const allPitchValues: RawPitchValue[] = this.props.speakers
            .flatMap((sp) => sp.letters || [])
            .filter((l) => l && !l.isWordSep);

        return new PitchArtCoordConverter(
            this.props.windowConfig,
            allPitchValues,
            this.props.showVerticallyCentered,
            this.props.showTimeNormalization,
            this.props.showPerceptualScale
        );
    };

    private buildSpeakerConverters() {
        return this.props.speakers.map((sp) => {
            const pitchValues: RawPitchValue[] = (sp.letters || []).filter((l) => l && !l.isWordSep);
            return new PitchArtCoordConverter(
            this.props.windowConfig,
            pitchValues,
            this.props.showVerticallyCentered,
            this.props.showTimeNormalization,
            this.props.showPerceptualScale
            );
        });
    }

    renderLayer = (speaker: Speaker, speakerIndex: number, converters: PitchArtCoordConverter[]) => {
        if (this.props.isLearn){
            const circleRadius = this.props.showLargeCircles
            ? this.props.largeCircleRadius
            : this.props.smallCircleRadius;
    
            const syllables = speaker.letters.map((letter) => letter.syllable);
            const points = [];
        
            // Determine coordinates based on specific syllable patterns
            if (JSON.stringify(syllables) === JSON.stringify(['ON', 'NI'])) {
                points.push({ x: 100, y: 100 }); // Accented
                points.push({ x: 600, y: 500 });
            } else if (JSON.stringify(syllables) === JSON.stringify(['ISS', 'KA'])) {
                points.push({ x: 100, y: 100 }); // Left
                points.push({ x: 600, y: 500 }); // Right
            } else if (JSON.stringify(syllables) === JSON.stringify(['AAK', 'IIWA'])) {
                points.push({ x: 100, y: 250 }); // Left
                points.push({ x: 600, y: 150 }); // Right
            } else if (JSON.stringify(syllables) === JSON.stringify(['A', 'WAK', 'AASIWA'])) {
                points.push({ x: 60, y: 200 });  // Left circle, closer to the top-left
                points.push({ x: 300, y: 350 }); // Middle circle, centered better
                points.push({ x: 500, y: 400 });
            } else if (JSON.stringify(syllables) === JSON.stringify(['MA', 'KO', 'YI'])) {
                points.push({ x: 100, y: 350 }); // Left
                points.push({ x: 400, y: 200 }); // Top-middle accented
                points.push({ x: 600, y: 450 }); // Bottom-right
            } else if (JSON.stringify(syllables) === JSON.stringify(['PO', 'NO', 'KAWA'])) {
                points.push({ x: 100, y: 450 }); // Left
                points.push({ x: 300, y: 420 }); // Middle (slightly lower)
                points.push({ x: 450, y: 350 });
            } else if (JSON.stringify(syllables) === JSON.stringify(['NIK', 'SO', 'KO', 'WAKSI'])) {
                points.push({ x: 50, y: 100 });  // Point 1 (Accented)
                points.push({ x: 230, y: 212 }); // Point 2
                points.push({ x: 410, y: 324 }); // Point 3
                points.push({ x: 590, y: 364 }); // Point 4
            } else if (JSON.stringify(syllables) === JSON.stringify(['SAAH', 'KO', 'MAA', 'PIWA'])) {
                points.push({ x: 50, y: 200 });  // Point 1
                points.push({ x: 180, y: 100 }); // Point 2 (Accented)
                points.push({ x: 350, y: 300 }); // Point 3
                points.push({ x: 530, y: 370 }); // Point 4
            } else if (JSON.stringify(syllables) === JSON.stringify(['NOT', 'TO', 'AN', 'A'])) {
                points.push({ x: 50, y: 230 });  // Point 1
                points.push({ x: 200, y: 150 }); // Point 2
                points.push({ x: 350, y: 100 }); // Point 3 (Accented)
                points.push({ x: 550, y: 350 }); // Point 4
            }
            const linePoints = points.reduce((acc, point) => [...acc, point.x, point.y], []);

            const lineCircles = points.map((point, i) => (
                <React.Fragment key={`point-${i}`}>
                    <Circle
                        x={point.x}
                        y={point.y}
                        fill={this.props.colorSchemes[speakerIndex].praatDotFillColor}
                        stroke={this.props.colorSchemes[speakerIndex].lineStrokeColor}
                        strokeWidth={this.props.circleStrokeWidth}
                        radius={circleRadius}
                        onClick={() => this.props.playSound(speaker.letters[i]?.pitch || 0)}
                        draggable={speaker.letters[i]?.isManualPitch}
                    />
                    <Text
                        x={point.x - this.props.fontSize / 2} // Center the text horizontally
                        y={point.y + circleRadius * 1.5} // Position below the circle
                        fontSize={this.props.fontSize}
                        text={speaker.letters[i]?.syllable || ''}
                        fill="#000" // Syllable text color set to black
                    />
                </React.Fragment>
            ));
            const line = (
                <Line
                    key={`line-${speakerIndex}`}
                    points={linePoints}
                    stroke={this.props.colorSchemes[speakerIndex].lineStrokeColor}
                    strokeWidth={this.props.graphWidth}
                    lineJoin="round"
                />
            );
            return (
                <Layer key={speakerIndex}>
                    {line}
                    {lineCircles}
                </Layer>
            );
        }
        else{
            const pitches = speaker.letters.map((item) => item.pitch);
            const maxPitchIndex = pitches.indexOf(Math.max(...pitches));
            const circleRadius = this.props.showLargeCircles ?
                this.props.largeCircleRadius : this.props.smallCircleRadius;
            const coordConverter = converters[speakerIndex];

            const getAnchorXY = (letterIndex: number) => {
            const mergeInfo = this.props.mergedIndexes?.[letterIndex];
            if (!mergeInfo) return null;

            const anchorIdx = mergeInfo.anchorSpeakerIndex;
            const anchorSpeaker = this.props.speakers?.[anchorIdx];
            const anchorLetter = anchorSpeaker?.letters?.[letterIndex];

            // if anchor doesn't have that index, skip merge
            if (!anchorLetter || anchorLetter.isWordSep) return null;

            const anchorConv = converters[anchorIdx];
            return {
                x: anchorConv.horzIndexToRectCoords(anchorLetter.t0),
                y: anchorConv.vertValueToRectCoords(anchorLetter.pitch),
                anchorIdx,
            };
        };
            const points = [];
            const pointPairs = [];
            const lineCircles = [];
            const controller = this;
            const letterSyllables = [];
            const lines = [];
            let currLinePoints = [];
            for (let i = 0; i < speaker.letters.length; i++) {
                if (speaker.letters[i].isWordSep) {
                    if (currLinePoints.length > 0) {
                        lines.push(
                            <Line key={i + "_pa_line"}
                                  points={currLinePoints}
                                  strokeWidth={this.props.graphWidth}
                                  stroke={this.props.colorSchemes[speakerIndex].lineStrokeColor}/>
                        );
                        currLinePoints = [];
                    }
                    continue;
                }
    
                const currPitch = speaker.letters[i].pitch;
                let x = coordConverter.horzIndexToRectCoords(speaker.letters[i].t0);
                let y = coordConverter.vertValueToRectCoords(speaker.letters[i].pitch);

                const anchor = getAnchorXY(i);
                if (anchor && speakerIndex !== anchor.anchorIdx) {
                    x = anchor.x;
                    y = anchor.y;
                }
                // const lineX = coordConverter.horzIndexToRectCoords(speaker.letters[i].t0);
                // const lineY = coordConverter.vertValueToRectCoords(speaker.letters[i].pitch);   

                // currLinePoints.push(lineX, lineY);
                // pointPairs.push([lineX, lineY]);

                // The 'align' property is not working with the current version of
                // react-konva that's used. As a result, we're manually shifting
                // the text to be centered.
                const konvaFontSizeAsPixels = this.props.fontSize * 0.65;
                const text = speaker.letters[i].syllable;
    
                letterSyllables.push(
                    <Text key={i}
                          x={x - (konvaFontSizeAsPixels * text.length / 2.0)}
                          y={y + circleRadius * 1.9}  // position text below the pitch circle
                          fontSize={this.props.fontSize}
                          text={text}/>
                );
    
                let circleFill = this.props.colorSchemes[speakerIndex].praatDotFillColor;
                let circleStroke = this.props.colorSchemes[speakerIndex].lineStrokeColor;
    
                if (this.props.showDynamicContent) {
                    if (this.props.activePlayIndex === i) {
                        circleFill = this.props.colorSchemes[speakerIndex].activePlayColor;
                        circleStroke = this.props.colorSchemes[speakerIndex].activePlayColor;
                    } else if (speaker.letters[i].isManualPitch) {
                        circleFill = this.props.colorSchemes[speakerIndex].manualDotFillColor;
                        circleStroke = this.props.colorSchemes[speakerIndex].manualDotFillColor;
                    } else {
                        circleFill = this.props.colorSchemes[speakerIndex].praatDotFillColor;
                        circleStroke = this.props.colorSchemes[speakerIndex].lineStrokeColor;
                    }
                }
    
                // points.push(x);
                // points.push(y);
                // currLinePoints.push(x);
                // currLinePoints.push(y);
                currLinePoints.push(x, y);
                pointPairs.push([x, y]);
                const isSecondaryAccent =
                        this.props.secondaryAccent?.speakerIndex === speakerIndex &&
                        this.props.secondaryAccent?.letterIndex === i;
                lineCircles.push(
                    <React.Fragment key={`${speakerIndex}-${i}`}>
                        <Circle key={i + circleFill + circleStroke}
                                x={x}
                                y={y}
                                fill={circleFill}
                                stroke={circleStroke}
                                strokeWidth={this.props.circleStrokeWidth}
                                radius={circleRadius}
                                onClick={(e) => {
                                    if (e.evt.button === 2) return;
                                    this.props.playSound(currPitch);
                                }}
                                onMouseEnter={() => this.props.setPointerEnabled(true)}
                                onMouseLeave={() => this.props.setPointerEnabled(false)}
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
                                        controller.props.setLetterPitch(speakerIndex, i, newPitch);
                                    }
                                }
                                onContextMenu={(e) => {
                                    e.evt.preventDefault();
                                    e.evt.stopPropagation();

                                    const stage = e.target.getStage();
                                    if (!stage) return;
                                        // Get the absolute stage position in the page
                                        const stageRect = stage.container().getBoundingClientRect();
                                        // Calculate coordinates relative to the stage
                                        const pos = {
                                            x: e.evt.clientX + window.scrollX ,
                                            y: e.evt.clientY + window.scrollY ,
                                        };
                                        this.props.onOpenContextMenu(
                                            pos.x,
                                            pos.y,
                                            speakerIndex,
                                            i
                                        );
                                }}
                        />
                        {isSecondaryAccent && this.secondaryAccentPoint(x, y)}
                    </React.Fragment>
                );
            }
    
            if (currLinePoints.length > 0) {
                lines.push(
                    <Line key={"last_pa_line"}
                          points={currLinePoints}
                          strokeWidth={this.props.graphWidth}
                          stroke={this.props.colorSchemes[speakerIndex].lineStrokeColor}/>
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
                <Layer key={speakerIndex}>
                    {accentedPoint}
                    {
                        this.props.showPitchArtLines ? lines : []
                    }
                    {lineCircles}
                    {this.props.showSyllableText ? letterSyllables : []}
                </Layer>
            );
        }
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

    secondaryAccentPoint = (x: number, y: number) =>{
        const outlineCircles = [0, 1].map((index) =>
            <Circle key={index}
                x={x}
                y={y}
                stroke={"#e38748"}
                radius={this.props.accentedCircleRadius + index * 8}
            />);
        return (
                <Group>
                    {outlineCircles}
                </Group>
            );
    }

    render() {
        const converter = this.buildSpeakerConverters();
        return (
            <React.Fragment>
                {
                    this.props.speakers.map((item, index) => this.renderLayer(item, index,converter))
                }
            </React.Fragment>
        );
    }
}