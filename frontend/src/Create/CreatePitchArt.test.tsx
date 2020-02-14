import {shallow} from "enzyme";
import * as React from "react";
import PitchArtContainer from "../PitchArtWizard/PitchArtViewer/PitchArtContainer";
import {expect} from "../setupTests";
import {arbitrarySpeaker} from "../testSupport/arbitraryObjects";
import {Speaker} from "../types/types";
import AudioAnalysis from "./AudioAnalysis";
import {CreatePitchArt, CreatePitchArtProps} from "./CreatePitchArt";
import Firebase from "../Firebase/firebase";

const firebase = new Firebase();
describe("CreatePitchArt", () => {
    beforeEach(function() {
        firebase.auth = {currentUser: {email: "test_user@gmail.com"}};
      });
    it("renders on the page", () => {
        const subject = shallowRender({firebase});
        expect(subject.find(".CreatePitchArt")).to.be.present();
    });

    it("renders speakers", () => {
        const subject = shallowRender({speakers: [arbitrarySpeaker(), arbitrarySpeaker()],
            firebase});
        expect(subject.find(AudioAnalysis)).to.have.lengthOf(2);
    });

    it("renders pitch art", () => {
        const subject = shallowRender({setLetterPitch: fakeSetLetterPitch, firebase});
        const pitchArtContainer = subject.find(PitchArtContainer);
        expect(pitchArtContainer).to.be.present();
        expect(pitchArtContainer).to.have.prop("setLetterPitch", fakeSetLetterPitch);
    });

    it("renders firebase", () => {
        const subject = shallowRender({firebase});
        const pitchArtContainer = subject.find(PitchArtContainer);
        expect(pitchArtContainer).to.be.present();
        expect(pitchArtContainer).to.have.prop("setLetterPitch", fakeSetLetterPitch);
    });
});

interface OptionalProps {
    speakers?: Speaker[];
    setLetterPitch?: (speakerIndex: number, letterIndex: number, newPitch: number) => void;
    firebase: any;
}

function shallowRender(props: OptionalProps) {
    return shallow(<CreatePitchArt {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): CreatePitchArtProps {
    return {
        speakers: props.speakers || [],
        setLetterPitch: props.setLetterPitch || fakeSetLetterPitch,
        firebase: props.firebase
    };
}

function fakeSetLetterPitch(speakerIndex: number, letterIndex: number, newPitch: number) {
    // do nothing
}
