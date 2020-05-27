import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import {arbitrarySpeaker} from "../testSupport/arbitraryObjects";
import {Speaker} from "../types/types";
import PeldaAudioAnalysis from "./PeldaAudioAnalysis";
import {PeldaView, PeldaViewProps} from "./PeldaView";
import Firebase from "../Firebase/firebase";
import ReactFileReader from "react-file-reader";

const firebase = new Firebase();
describe("PeldaView", () => {
    beforeEach(function() {
        firebase.auth = {currentUser: {email: "test_user@gmail.com"}};
      });

    it("renders pelda view on the page", () => {
        const subject = shallowRender({speakers: [arbitrarySpeaker()], firebase});
        expect(subject.find(".peldaview")).to.be.present();
    });

    it("renders pelda view with speakers", () => {
        const subject = shallowRender({speakers: [arbitrarySpeaker({uploadId: "fake-id"})],
            firebase});
        expect(subject.find(PeldaAudioAnalysis)).to.have.lengthOf(1);
    });

    it("renders pelda view with File uploader", () => {
        const subject = shallowRender({speakers: [arbitrarySpeaker({uploadId: "fake-id"})],
            firebase});
        const fileReader = subject.find(ReactFileReader);
        expect(fileReader).to.be.present();
    });

    it("renders pelda view with Praat Analusis Menu", () => {
        const subject = shallowRender({speakers: [arbitrarySpeaker()], firebase});
        expect(subject.find(".menu")).to.have.lengthOf(8);
    });

    it("renders elan annotation on the pelda view page", () => {
        const subject = shallowRender({speakers: [arbitrarySpeaker()], firebase});
        expect(subject.find("#elan-annotation")).to.be.present();
    });
});

interface OptionalProps {
    speakers?: Speaker[];
    setLetterPitch?: (speakerIndex: number, letterIndex: number, newPitch: number) => void;
    firebase: any;
}

function shallowRender(props: OptionalProps) {
    return shallow(<PeldaView {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): PeldaViewProps {
    return {
        speakers: props.speakers || [],
        setLetterPitch: props.setLetterPitch || fakeSetLetterPitch,
        firebase: props.firebase
    };
}

function fakeSetLetterPitch(speakerIndex: number, letterIndex: number, newPitch: number) {
    // do nothing
}
