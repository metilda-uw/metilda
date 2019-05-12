import {shallow} from "enzyme";
import * as React from "react";
import * as sinon from "sinon";
import {expect} from "../setupTests";
import {arbitraryLetter, arbitrarySpeaker} from "../testSupport/arbitraryObjects";
import {Speaker} from "../types/types";
import AudioLetter from "./AudioLetter";
import {TargetPitchBar, TargetPitchBarProps} from "./TargetPitchBar";
import {SinonSandbox} from "sinon";

describe("TargetPitchBar", () => {
    it("renders a TargetPitchBar", () => {
        const subject = shallowRender({});
        expect(subject.find(".TargetPitchBar")).to.be.present();
    });

    describe("audio letters", () => {
        it("renders letters", () => {
            const subject = shallowRender(
                {speakers: [arbitrarySpeaker({letters: [arbitraryLetter()]})]}
            );

            expect(subject.find(AudioLetter)).to.have.lengthOf(1);
        });

        it("triggers click handler", () => {
            const mockTargetPitchSelected = sinon.spy();
            const subject = shallowRender(
                {
                    speakers: [arbitrarySpeaker({letters: [arbitraryLetter()]})],
                    targetPitchSelected: mockTargetPitchSelected
                }
            );

            subject.find(AudioLetter).at(0).simulate("click");

            sinon.assert.calledOnce(mockTargetPitchSelected);
            sinon.assert.calledWith(mockTargetPitchSelected, 0);
        });
    });

    describe("Set Syllable button", () => {
        let sinonSandbox: SinonSandbox;

        beforeEach(() => {
            sinonSandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sinonSandbox.restore();
        });

        it("disabled when no letters are selected", () => {
            const subject = shallowRender(
                {
                    speakerIndex: 0,
                    speakers: [arbitrarySpeaker({letters: [arbitraryLetter()]})]
                }
            );

            expect(subject.find(".TargetPitchBar-set-syllable")).to.be.disabled();
        });

        it("triggers callbacks when Set Syllable is clicked", () => {
            const mockSetLetterSyllable = sinonSandbox.spy();
            const mockTargetPitchSelected = sinonSandbox.spy();
            const mockSyllableText = "ABC";

            const subject = shallowRender(
                {
                    speakerIndex: 0,
                    speakers: [arbitrarySpeaker({letters: [arbitraryLetter()]})],
                    setLetterSyllable: mockSetLetterSyllable,
                    targetPitchSelected: mockTargetPitchSelected
                }
            );

            subject.find(AudioLetter).at(0).simulate("click");
            sinonSandbox.assert.calledWith(mockTargetPitchSelected.firstCall, 0);

            sinonSandbox.stub(window, "prompt").returns(mockSyllableText);

            subject.find(".TargetPitchBar-set-syllable").simulate("click");
            sinonSandbox.assert.calledOnce(mockSetLetterSyllable);
            sinonSandbox.assert.calledWith(mockSetLetterSyllable, 0, 0, mockSyllableText);
            sinonSandbox.assert.calledWith(mockTargetPitchSelected.secondCall, -1);
        });
    });

    describe("Remove button", () => {
        it("disabled when no letters are selected", () => {
            const subject = shallowRender(
                {
                    speakerIndex: 0,
                    speakers: [arbitrarySpeaker({letters: [arbitraryLetter()]})]
                }
            );

            expect(subject.find(".TargetPitchBar-remove-letter")).to.be.disabled();
        });

        it("triggers callbacks when Remove is clicked", () => {
            const mockRemoveLetter = sinon.spy();
            const mockTargetPitchSelected = sinon.spy();
            const subject = shallowRender(
                {
                    speakerIndex: 0,
                    speakers: [arbitrarySpeaker({letters: [arbitraryLetter()]})],
                    removeLetter: mockRemoveLetter,
                    targetPitchSelected: mockTargetPitchSelected
                }
            );

            subject.find(AudioLetter).at(0).simulate("click");
            sinon.assert.calledWith(mockTargetPitchSelected.firstCall, 0);

            subject.find(".TargetPitchBar-remove-letter").simulate("click");
            sinon.assert.calledOnce(mockRemoveLetter);
            sinon.assert.calledWith(mockRemoveLetter, 0, 0);
            sinon.assert.calledWith(mockTargetPitchSelected.secondCall, -1);
        });
    });

    describe("Clean button", () => {
        it("disabled when no letters are selected", () => {
            const subject = shallowRender(
                {
                    speakerIndex: 0,
                    speakers: [arbitrarySpeaker({letters: []})]
                }
            );

            expect(subject.find(".TargetPitchBar-clear-letter")).to.be.disabled();
        });

        it("triggers callbacks when Clear is clicked", () => {
            const mockResetLetters = sinon.spy();
            const subject = shallowRender(
                {
                    speakerIndex: 0,
                    speakers: [arbitrarySpeaker({letters: [arbitraryLetter()]})],
                    resetLetters: mockResetLetters
                }
            );

            subject.find(".TargetPitchBar-clear-letter").simulate("click");

            sinon.assert.calledOnce(mockResetLetters);
            sinon.assert.calledWith(mockResetLetters, 0);
        });
    });
});

interface OptionalProps {
    speakers?: Speaker[];
    speakerIndex?: number;
    minAudioTime?: number;
    maxAudioTime?: number;
    minAudioX?: number;
    maxAudioX?: number;
    targetPitchSelected?: (letterIndex: number) => void;
    removeLetter?: (speakerIndex: number, index: number) => void;
    resetLetters?: (speakerIndex: number) => void;
    setLetterSyllable?: (speakerIndex: number, index: number, syllable: string) => void;
}

function shallowRender(props: OptionalProps) {
    return shallow(<TargetPitchBar {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): TargetPitchBarProps {
    return {
        speakers: props.speakers || [arbitrarySpeaker({letters: [arbitraryLetter()]})],
        speakerIndex: props.speakerIndex || 0,
        minAudioTime: props.minAudioTime || 0,
        maxAudioTime: props.maxAudioTime || 0,
        minAudioX: props.minAudioX || 0,
        maxAudioX: props.maxAudioX || 0,
        targetPitchSelected: props.targetPitchSelected || (() => undefined),
        removeLetter: props.removeLetter || (() => undefined),
        resetLetters: props.resetLetters || (() => undefined),
        setLetterSyllable: props.setLetterSyllable || (() => undefined),
    };
}
