import {shallow} from "enzyme";
import * as React from "react";
// @ts-ignore
import {Slice} from "react-pie-menu";
import * as sinon from "sinon";
import {expect} from "../setupTests";
import PeldaAudioAnalysisImageMenu, {PeldaAudioAnalysisImageMenuProps} from "./PeldaAudioAnalysisImageMenu";

describe("PeldaAudioAnalysisImageMenu", () => {
    it("renders an PeldaAudioAnalysisImageMenu", () => {
        const subject = shallowRender({});
        expect(subject.find(".PeldaAudioAnalysisImageMenu")).to.be.present();
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
            expect(subject.find(Slice)).to.have.lengthOf(4);
        });

        it("renders the zoom option", () => {
            const subject = shallowRender({});
            const menuOption = subject.find(".AudioAnalysisImageMenu-option-zoom");

            expect(menuOption).to.be.present();
            expect(menuOption.find(".AudioAnalysisImageMenu-label")).to.have.text("Zoom In");
        });

        it("renders the show-all option", () => {
            const subject = shallowRender({});
            const menuOption = subject.find(".AudioAnalysisImageMenu-option-showall");

            expect(menuOption).to.be.present();
            expect(menuOption.find(".AudioAnalysisImageMenu-label")).to.have.text("Zoom Out");
        });
    });

    describe("isSelectionActive changes option availability", () => {
        it("disables options based on isSelectionActive", () => {
            const subject = shallowRender({isSelectionActive: false});
            expect(subject.find(".AudioAnalysisImageMenu-option-zoom")).to.have.prop("disabled", true);
        });

        it("enables options based on isSelectionActive", () => {
            const subject = shallowRender({isSelectionActive: true});
            expect(subject.find(".AudioAnalysisImageMenu-option-zoom")).to.have.prop("disabled", false);
        });
    });

    describe("isSelectionActive changes option actions", () => {
        it("prevents actions based on isSelectionActive", () => {
            const intervalSelected = sinon.stub();

            const subject = shallowRender({
                isSelectionActive: false,
                intervalSelected,
            });

            subject.find(".AudioAnalysisImageMenu-option-zoom").simulate("select");
            sinon.assert.notCalled(intervalSelected);
        });

        it("allows actions based on isSelectionActive", () => {
            const intervalSelected = sinon.stub();

            const subject = shallowRender({
                isSelectionActive: true,
                intervalSelected,
            });

            subject.find(".AudioAnalysisImageMenu-option-zoom").simulate("select");
            sinon.assert.calledOnce(intervalSelected);
        });
    });

    describe("isAllShown changes option actions", () => {
        it("prevents actions based on isAllShown", () => {
            const showAllAudio = sinon.stub();

            const subject = shallowRender({
                isAllShown: true,
            });

            subject.find(".AudioAnalysisImageMenu-option-showall").simulate("select");
            sinon.assert.notCalled(showAllAudio);
        });

        it("allows actions based on isAllShown", () => {
            const showAllAudio = sinon.stub();

            const subject = shallowRender({
                isAllShown: false,
            });

            subject.find(".AudioAnalysisImageMenu-option-showall").simulate("select");
            sinon.assert.notCalled(showAllAudio);
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
    intervalSelected?: () => void;
    showZoomOutAudio?: () => void;
}

function shallowRender(props: OptionalProps) {
    return shallow(<PeldaAudioAnalysisImageMenu {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): PeldaAudioAnalysisImageMenuProps {
    return {
        onClick: props.onClick || (() => undefined),
        imgMenuX: props.imgMenuX || 0,
        imgMenuY: props.imgMenuY || 0,
        isSelectionActive: props.isSelectionActive || false,
        isAllShown: props.isAllShown || false,
        intervalSelected: props.intervalSelected || (() => undefined),
        showZoomOutAudio: props.showZoomOutAudio || (() => undefined),
    };
}
