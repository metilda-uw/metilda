import {shallow} from "enzyme";
import * as downloadLib from "js-file-download";
import * as React from "react";
import sinon, {SinonSandbox, SinonStub} from "sinon";
import {expect} from "../setupTests";
import {arbitraryLetter, arbitrarySpeaker} from "../testSupport/arbitraryObjects";
import {Speaker} from "../types/types";
import {ExportMetildaTranscribe, ExportMetildaTranscribeProps} from "./ExportMetildaTranscribe";

describe("ExportMetildaTranscribe", () => {
    let sinonSandbox: SinonSandbox;

    beforeEach(() => {
        sinonSandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sinonSandbox.restore();
    });

    it("renders an ExportMetildaTranscribe", () => {
        const subject = shallowRender({speakers: [arbitrarySpeaker()]});
        expect(subject.find(".ExportMetildaTranscribe")).to.be.present();
    });

    describe("disable state", () => {
        it("renders as enabled when the letters for the speaker do not have default values", () => {
            const subject = shallowRender({
                speakers: [
                    arbitrarySpeaker({letters: [arbitraryLetter({syllable: "ABC"})]})
                ]
            });
            expect(subject.find(".ExportMetildaTranscribe-save")).to.not.be.disabled();
        });

        it("renders as disabled when no letters have been set for the speaker", () => {
            const subject = shallowRender({
                speakers: [
                    arbitrarySpeaker({letters: []})
                ]
            });
            expect(subject.find(".ExportMetildaTranscribe-save")).to.be.disabled();
        });

        it("renders as enabled when the letters for the speaker have default values", () => {
            const subject = shallowRender({
                speakers: [
                    arbitrarySpeaker({letters: [arbitraryLetter({syllable: "X"})]})
                ]
            });
            expect(subject.find(".ExportMetildaTranscribe-save")).to.be.disabled();
        });
    });
});

interface OptionalProps {
    speakers?: Speaker[];
    speakerIndex?: number;
}

function shallowRender(props: OptionalProps) {
    return shallow(<ExportMetildaTranscribe {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): ExportMetildaTranscribeProps {
    return {
        speakers: props.speakers || [],
        speakerIndex: props.speakerIndex || 0
    };
}
