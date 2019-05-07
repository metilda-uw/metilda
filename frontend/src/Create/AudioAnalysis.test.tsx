import {shallow} from "enzyme";
import * as React from "react";
import PlayerBar from "../PitchArtWizard/AudioViewer/PlayerBar";
import {expect} from "../setupTests";
import {arbitrarySpeaker} from "../testSupport/arbitraryObjects";
import {Letter, Speaker} from "../types/types";
import {AudioAnalysis, AudioAnalysisProps} from "./AudioAnalysis";
import AudioImg from "./AudioImg";
import AudioImgDefault from "./AudioImgDefault";

describe("AudioAnalysis", () => {
    it("renders an AudioAnalysis", () => {
        const subject = shallowRender({
            speakers: [arbitrarySpeaker()]
        });
        expect(subject.find(".AudioAnalysis")).to.be.present();
        expect(subject.find(".AudioAnalysis-speaker")).to.be.present();
        expect(subject.find(".AudioAnalysis-analysis")).to.be.present();
    });

    describe("no speaker has been selected yet", () => {
        it("renders default image message", () => {
            const subject = shallowRender({
                speakers: [arbitrarySpeaker()]
            });
            expect(subject.find(AudioImgDefault)).to.be.present();
        });

        it("does not render audio image", () => {
            const subject = shallowRender({
                speakers: [arbitrarySpeaker()]
            });
            expect(subject.find(AudioImg)).to.not.be.present();
        });

        it("does not render playback options", () => {
            const subject = shallowRender({
                speakers: [arbitrarySpeaker()]
            });
            expect(subject.find(PlayerBar)).to.not.be.present();
        });
    });

    describe("a speaker has been selected", () => {
        it("renders an audio image", () => {
            const subject = shallowRender({
                speakers: [arbitrarySpeaker({uploadId: "fake-id"})]
            });
            expect(subject.find(AudioImg)).to.be.present();
        });

        it("renders playback options", () => {
            const subject = shallowRender({
                speakers: [arbitrarySpeaker({uploadId: "fake-id"})]
            });
            expect(subject.find(PlayerBar)).to.be.present();
        });
    });
});

interface OptionalProps {
    speakerIndex?: number;
    speakers?: Speaker[];
    addSpeaker?: () => void;
    removeSpeaker?: (speakerIndex: number) => void;
    setUploadId?: (speakerIndex: number, uploadId: string) => void;
    addLetter?: (speakerIndex: number, letter: Letter) => void;
    setLetterPitch?: (speakerIndex: number, letterIndex: number, pitch: number) => void;
}

function shallowRender(props: OptionalProps) {
    return shallow(<AudioAnalysis {...makeProps(props)}/>);
}

function makeProps(props: OptionalProps): AudioAnalysisProps {
    return {
        speakerIndex: props.speakerIndex || 0,
        speakers: props.speakers || [],
        addSpeaker: props.addSpeaker || fakeAddSpeaker,
        removeSpeaker: props.removeSpeaker || fakeRemoveSpeaker,
        setUploadId: props.setUploadId || fakeSetUploadId,
        addLetter: props.addLetter || fakeAddLetter,
        setLetterPitch: props.setLetterPitch || fakeSetLetterPitch
    };
}

function fakeAddSpeaker() {
    // do nothing
}

function fakeRemoveSpeaker(speakerIndex: number) {
    // do nothing
}

function fakeSetUploadId(speakerIndex: number, uploadId: string) {
    // do nothing
}

function fakeAddLetter(speakerIndex: number, letter: Letter) {
    // do nothing
}

function fakeSetLetterPitch(speakerIndex: number, letterIndex: number, pitch: number) {
    // do nothing
}
