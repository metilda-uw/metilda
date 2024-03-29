import {shallow} from "enzyme";
import React, {createRef} from "react";
import Konva from "konva";
import {expect} from "../../setupTests";
import {Letter, Speaker} from "../../types/types";
import {PitchArtDrawingWindow, PitchArtDrawingWindowProps} from "./PitchArtDrawingWindow";
import PitchArtGeometry from "./PitchArtGeometry";
import {RawPitchValue} from "./types";
import PitchArtCoordinateSystem from "./PitchArtCoordinateSystem";
import UserPitchView from "./UserPitchView";
import {arbitraryRawPitchValue} from "../../testSupport/arbitraryObjects";

const stageRef = createRef<Konva.Stage>();
describe("PitchArtDrawingWindow", () => {
    it("renders a PitchArtDrawingWindow", () => {
        const subject = shallowRender({ref: stageRef});
        expect(subject.find(".PitchArtDrawingWindow")).to.be.present();
        expect(subject.find(".PitchArtDrawingWindow-pitchart")).to.be.present();
        expect(subject.find(PitchArtGeometry)).to.be.present();
    });

    describe("pitch scale", () => {
        it("does not render pitch scale when showPitchScale is false", () => {
            const subject = shallowRender({showPitchScale: false, ref: stageRef});
            expect(subject.find(PitchArtCoordinateSystem)).to.not.be.present();
        });

        it("renders pitch scale when showPitchScale is true", () => {
            const subject = shallowRender({showPitchScale: true, ref: stageRef});
            expect(subject.find(PitchArtCoordinateSystem)).to.be.present();
        });
    });

    describe("user pitch view", () => {
        it("does not render user pitch view when rawPitchValueLists is undefined", () => {
            const subject = shallowRender({rawPitchValueLists: undefined, ref: stageRef});
            expect(subject.find(UserPitchView)).to.not.be.present();
        });

        it("renders user pitch view when rawPitchValueLists is a non-empty list", () => {
            const subject = shallowRender({
                rawPitchValueLists: [[arbitraryRawPitchValue()]],
                ref: stageRef
            });
            expect(subject.find(UserPitchView)).to.be.present();
        });
    });
});

interface OptionalProps {
    speakers?: Speaker[];
    width?: number;
    height?: number;
    minPitch?: number;
    maxPitch?: number;
    minTime?: number;
    maxTime?: number;
    fileName?: string;
    setLetterPitch?: (speakerIndex: number, letterIndex: number, newPitch: number) => void;
    showDynamicContent?: boolean;
    showArtDesign?: boolean;
    showPitchArtLines?: boolean;
    showLargeCircles?: boolean;
    showVerticallyCentered?: boolean;
    showAccentPitch?: boolean;
    showSyllableText?: boolean;
    showTimeNormalization?: boolean;
    showPitchScale?: boolean;
    showPerceptualScale?: boolean;
    showPitchArtImageColor?: boolean;
    showPrevPitchValueLists?: boolean;
    showMetildaWatermark?: boolean;
    rawPitchValueLists?: RawPitchValue[][];
    firebase?: any;
    setLatestAnalysisId?: (speakerIndex: number, latestAnalysisId: number, latestAnalysisName: string,
                           lastUploadedLetters: Letter[]) => void;
    ref: any;
}

function shallowRender(props: OptionalProps) {
    return shallow(<PitchArtDrawingWindow {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): PitchArtDrawingWindowProps {
    return {
        speakers: props.speakers || [],
        width: props.width || 0,
        height: props.height || 0,
        minPitch: props.minPitch || 0,
        maxPitch: props.maxPitch || 0,
        minTime: props.minTime || 0,
        maxTime: props.maxTime || 0,
        fileName: props.fileName || "",
        setLetterPitch: props.setLetterPitch || (() => undefined),
        showDynamicContent: props.showDynamicContent || false,
        showArtDesign: props.showArtDesign || false,
        showPitchArtLines: props.showPitchArtLines || false,
        showLargeCircles: props.showLargeCircles || false,
        showVerticallyCentered: props.showVerticallyCentered || false,
        showAccentPitch: props.showAccentPitch || false,
        showSyllableText: props.showSyllableText || false,
        showTimeNormalization: props.showTimeNormalization || false,
        showPitchScale: props.showPitchScale || false,
        showPerceptualScale: props.showPerceptualScale || false,
        showPitchArtImageColor: props.showPitchArtImageColor || false,
        showPrevPitchValueLists: props.showPrevPitchValueLists || false,
        showMetildaWatermark: props.showMetildaWatermark || false,
        rawPitchValueLists: props.rawPitchValueLists || undefined,
        firebase: props.firebase || undefined,
        setLatestAnalysisId: props.setLatestAnalysisId || (() => undefined),
        ref: props.ref
    };
}
