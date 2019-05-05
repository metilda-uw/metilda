import {shallow} from "enzyme";
import * as React from "react";
import PitchArtContainer from "../PitchArtWizard/PitchArtViewer/PitchArtContainer";
import {expect} from "../setupTests";
import {arbitrarySpeaker} from "../testSupport/arbitraryObjects";
import {Speaker} from "../types/types";
import AudioAnalysis from "./AudioAnalysis";
import {CreatePitchArt, CreatePitchArtProps} from "./CreatePitchArt";

describe("CreatePitchArt", () => {
    it("renders on the page", () => {
        const subject = shallowRender({});
        expect(subject.find(".CreatePitchArt")).to.be.present();
    });

    it("renders speakers", () => {
        const subject = shallowRender({speakers: [arbitrarySpeaker(), arbitrarySpeaker()]});
        expect(subject.find(AudioAnalysis)).to.have.lengthOf(2);
    });

    it("renders pitch art", () => {
        const subject = shallowRender({setLetterPitch: fakeSetLetterPitch});
        const pitchArtContainer = subject.find(PitchArtContainer);
        expect(pitchArtContainer).to.be.present();
        expect(pitchArtContainer).to.have.prop("setLetterPitch", fakeSetLetterPitch);
    });
});

interface OptionalProps {
    speakers?: Speaker[];
    setLetterPitch?: (speakerIndex: number, letterIndex: number, newPitch: number) => void;
}

function shallowRender(props: OptionalProps) {
    return shallow(<CreatePitchArt {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): CreatePitchArtProps {
    return {
        speakers: props.speakers || [],
        setLetterPitch: props.setLetterPitch || fakeSetLetterPitch
    };
}

function fakeSetLetterPitch(speakerIndex: number, letterIndex: number, newPitch: number) {
    // do nothing
}
