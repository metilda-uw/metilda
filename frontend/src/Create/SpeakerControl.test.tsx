import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import {arbitrarySpeaker} from "../testSupport/arbitraryObjects";
import {Speaker} from "../types/types";
import ExportMetildaTranscribe from "./ExportMetildaTranscribe";
import ImportMetildaTranscribe from "./ImportMetildaTranscribe";
import {SpeakerControl, SpeakerControlProps} from "./SpeakerControl";

describe("SpeakerControl", () => {
    it("renders the speaker control", () => {
        const subject = shallowRender({});
        expect(subject.find(".SpeakerControl")).to.be.present();
        expect(subject.find(".SpeakerControl-title")).to.have.text("Speaker");
    });

    it("renders import and export options", () => {
        const subject = shallowRender({});
        expect(subject.find(ImportMetildaTranscribe)).to.be.present();
        expect(subject.find(ExportMetildaTranscribe)).to.be.present();
    });

    describe("add speaker", () => {
        it("renders add-speaker when allowed", () => {
            const subject = shallowRender({canAddSpeaker: true});
            expect(subject.find(".SpeakerControl-add-speaker")).to.be.present();
        });

        it("does not render add-speaker when not allowed", () => {
            const subject = shallowRender({canAddSpeaker: false});
            expect(subject.find(".SpeakerControl-add-speaker")).to.not.be.present();
        });
    });

    describe("remove speaker", () => {
        it("renders remove-speaker when allowed", () => {
            const subject = shallowRender({canRemoveSpeaker: true});
            expect(subject.find(".SpeakerControl-remove-speaker")).to.be.present();
        });

        it("does not render remove-speaker when not allowed", () => {
            const subject = shallowRender({canRemoveSpeaker: false});
            expect(subject.find(".SpeakerControl-remove-speaker")).to.not.be.present();
        });
    });
});

interface OptionalProps {
    speakerIndex?: number;
    speakers?: Speaker[];
    addSpeaker?: () => void;
    removeSpeaker?: () => void;
    canAddSpeaker?: boolean;
    canRemoveSpeaker?: boolean;
}

function shallowRender(props: OptionalProps) {
    return shallow(<SpeakerControl {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): SpeakerControlProps {
    return {
        speakerIndex: props.speakerIndex || 0,
        speakers: props.speakers || [],
        addSpeaker: props.addSpeaker || noArgFunc,
        removeSpeaker: props.removeSpeaker || noArgFunc,
        canAddSpeaker: props.canAddSpeaker || false,
        canRemoveSpeaker: props.canRemoveSpeaker || false
    };
}

const noArgFunc = () => {
    // do nothing
};
