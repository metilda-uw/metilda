import {shallow} from "enzyme";
import * as React from "react";
// @ts-ignore
import {Slice} from "react-pie-menu";
import * as sinon from "sinon";
import {expect} from "../setupTests";
import AudioAnalysisImageMenu, {AudioAnalysisImageMenuProps} from "./AudioAnalysisImageMenu";

describe("AudioAnalysisImageMenu", () => {
    it("renders an AudioAnalysisImageMenu", () => {
        const subject = shallowRender({});
        expect(subject.find(".AudioAnalysisImageMenu")).to.be.present();
    });

    it("triggers onClick when clicked", () => {
        const onClick = sinon.stub();
        const subject = shallowRender({onClick});
        subject.simulate("click");
        sinon.assert.calledOnce(onClick);
    });

    describe("listed menu options", () => {
        it("renders all options", () => {
            const subject = shallowRender({});
            expect(subject.find(Slice)).to.have.lengthOf(6);
        });

        it("renders the split option", () => {
            const subject = shallowRender({});
            const menuOption = subject.find(".AudioAnalysisImageMenu-option-split");

            expect(menuOption).to.be.present();
            expect(menuOption.find(".AudioAnalysisImageMenu-label")).to.have.text("Split");
        });

        it("renders the zoom option", () => {
            const subject = shallowRender({});
            const menuOption = subject.find(".AudioAnalysisImageMenu-option-zoom");

            expect(menuOption).to.be.present();
            expect(menuOption.find(".AudioAnalysisImageMenu-label")).to.have.text("Zoom");
        });

        it("renders the manual option", () => {
            const subject = shallowRender({});
            const menuOption = subject.find(".AudioAnalysisImageMenu-option-manual");

            expect(menuOption).to.be.present();
            expect(menuOption.find(".AudioAnalysisImageMenu-label")).to.have.text("Manual");
        });

        it("renders the average option", () => {
            const subject = shallowRender({});
            const menuOption = subject.find(".AudioAnalysisImageMenu-option-average");

            expect(menuOption).to.be.present();
            expect(menuOption.find(".AudioAnalysisImageMenu-label")).to.have.text("Average");
        });

        it("renders the range option", () => {
            const subject = shallowRender({});
            const menuOption = subject.find(".AudioAnalysisImageMenu-option-range");

            expect(menuOption).to.be.present();
            expect(menuOption.find(".AudioAnalysisImageMenu-label")).to.have.text("Range");
        });

        it("renders the show-all option", () => {
            const subject = shallowRender({});
            const menuOption = subject.find(".AudioAnalysisImageMenu-option-showall");

            expect(menuOption).to.be.present();
            expect(menuOption.find(".AudioAnalysisImageMenu-label")).to.have.text("All");
        });
    });

    describe("isSelectionActive changes option availability", () => {
        it("disables options based on isSelectionActive", () => {
            const subject = shallowRender({isSelectionActive: false});
            expect(subject.find(".AudioAnalysisImageMenu-option-split")).to.have.prop("disabled", true);
            expect(subject.find(".AudioAnalysisImageMenu-option-zoom")).to.have.prop("disabled", true);
            expect(subject.find(".AudioAnalysisImageMenu-option-manual")).to.have.prop("disabled", true);
            expect(subject.find(".AudioAnalysisImageMenu-option-average")).to.have.prop("disabled", true);
            expect(subject.find(".AudioAnalysisImageMenu-option-range")).to.have.prop("disabled", true);
        });

        it("enables options based on isSelectionActive", () => {
            const subject = shallowRender({isSelectionActive: true});
            expect(subject.find(".AudioAnalysisImageMenu-option-split")).to.have.prop("disabled", false);
            expect(subject.find(".AudioAnalysisImageMenu-option-zoom")).to.have.prop("disabled", false);
            expect(subject.find(".AudioAnalysisImageMenu-option-manual")).to.have.prop("disabled", false);
            expect(subject.find(".AudioAnalysisImageMenu-option-average")).to.have.prop("disabled", false);
            expect(subject.find(".AudioAnalysisImageMenu-option-range")).to.have.prop("disabled", false);
        });
    });

    describe("isSelectionActive changes option actions", () => {
        it("prevents actions based on isSelectionActive", () => {
            const splitWord = sinon.stub();
            const intervalSelected = sinon.stub();
            const newManualPitch = sinon.stub();
            const newAvgPitch = sinon.stub();
            const newRangePitch = sinon.stub();

            const subject = shallowRender({
                isSelectionActive: false,
                splitWord,
                intervalSelected,
                newManualPitch,
                newAvgPitch,
                newRangePitch
            });

            subject.find(".AudioAnalysisImageMenu-option-split").simulate("select");
            sinon.assert.notCalled(splitWord);

            subject.find(".AudioAnalysisImageMenu-option-zoom").simulate("select");
            sinon.assert.notCalled(intervalSelected);

            subject.find(".AudioAnalysisImageMenu-option-manual").simulate("select");
            sinon.assert.notCalled(newManualPitch);

            subject.find(".AudioAnalysisImageMenu-option-average").simulate("select");
            sinon.assert.notCalled(newAvgPitch);

            subject.find(".AudioAnalysisImageMenu-option-range").simulate("select");
            sinon.assert.notCalled(newRangePitch);
        });

        it("allows actions based on isSelectionActive", () => {
            const splitWord = sinon.stub();
            const intervalSelected = sinon.stub();
            const newManualPitch = sinon.stub();
            const newAvgPitch = sinon.stub();
            const newRangePitch = sinon.stub();

            const subject = shallowRender({
                isSelectionActive: true,
                splitWord,
                intervalSelected,
                newManualPitch,
                newAvgPitch,
                newRangePitch
            });

            subject.find(".AudioAnalysisImageMenu-option-split").simulate("select");
            sinon.assert.calledOnce(splitWord);

            subject.find(".AudioAnalysisImageMenu-option-zoom").simulate("select");
            sinon.assert.calledOnce(intervalSelected);

            subject.find(".AudioAnalysisImageMenu-option-manual").simulate("select");
            sinon.assert.calledOnce(newManualPitch);

            subject.find(".AudioAnalysisImageMenu-option-average").simulate("select");
            sinon.assert.calledOnce(newAvgPitch);

            subject.find(".AudioAnalysisImageMenu-option-range").simulate("select");
            sinon.assert.calledOnce(newRangePitch);
        });
    });

    describe("isAllShown changes option actions", () => {
        it("prevents actions based on isAllShown", () => {
            const showAllAudio = sinon.stub();

            const subject = shallowRender({
                isAllShown: true,
                showAllAudio
            });

            subject.find(".AudioAnalysisImageMenu-option-showall").simulate("select");
            sinon.assert.notCalled(showAllAudio);
        });

        it("allows actions based on isAllShown", () => {
            const showAllAudio = sinon.stub();

            const subject = shallowRender({
                isAllShown: false,
                showAllAudio
            });

            subject.find(".AudioAnalysisImageMenu-option-showall").simulate("select");
            sinon.assert.calledOnce(showAllAudio);
        });
    });

    describe("isAllShown changes option availability", () => {
        it("disables options based on isAllShown", () => {
            const subject = shallowRender({isAllShown: false});
            expect(subject.find(".AudioAnalysisImageMenu-option-showall")).to.have.prop("disabled", false);
        });

        it("enables options based on isAllShown", () => {
            const subject = shallowRender({isAllShown: true});
            expect(subject.find(".AudioAnalysisImageMenu-option-showall")).to.have.prop("disabled", true);
        });
    });
});

interface OptionalProps {
    onClick?: () => void;
    imgMenuX?: number;
    imgMenuY?: number;
    isSelectionActive?: boolean;
    isAllShown?: boolean;
    splitWord?: () => void;
    intervalSelected?: () => void;
    newManualPitch?: () => void;
    newAvgPitch?: () => void;
    newRangePitch?: () => void;
    showAllAudio?: () => void;
}

function shallowRender(props: OptionalProps) {
    return shallow(<AudioAnalysisImageMenu {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): AudioAnalysisImageMenuProps {
    return {
        onClick: props.onClick || (() => undefined),
        imgMenuX: props.imgMenuX || 0,
        imgMenuY: props.imgMenuY || 0,
        isSelectionActive: props.isSelectionActive || false,
        isAllShown: props.isAllShown || false,
        splitWord: props.splitWord || (() => undefined),
        intervalSelected: props.intervalSelected || (() => undefined),
        newManualPitch: props.newManualPitch || (() => undefined),
        newAvgPitch: props.newAvgPitch || (() => undefined),
        newRangePitch: props.newRangePitch || (() => undefined),
        showAllAudio: props.showAllAudio || (() => undefined),
    };
}
