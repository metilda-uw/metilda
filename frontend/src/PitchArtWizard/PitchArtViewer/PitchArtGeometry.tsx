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
}

export default class PitchArtGeometry extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    renderLayer = (speaker: Speaker, speakerIndex: number) => {
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
    
        // Generate circles and syllables
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
    
        // Generate line
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
    };
    

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
                    this.props.speakers.map((item, index) => this.renderLayer(item, index))
                }
            </React.Fragment>
        );
    }
}
