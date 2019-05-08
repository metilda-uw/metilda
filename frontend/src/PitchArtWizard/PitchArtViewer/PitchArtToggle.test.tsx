import {mount, shallow, ShallowWrapper} from "enzyme";
import {SyntheticEvent} from "react";
import * as React from "react";
import * as sinon from "sinon";
import {expect} from "../../setupTests";
import PitchArtToggle, {PitchArtToggleProps} from "./PitchArtToggle";

describe("PitchArtToggle", () => {
    it("renders the PitchArtToggle", () => {
        const expectedLabel = "MyInput";
        const expectedOffText = "Hide";
        const expectedOnText = "Show";
        const subject = shallowRender({label: expectedLabel, offText: expectedOffText, onText: expectedOnText});

        expect(subject.find(".PitchArtToggle")).to.be.present();

        expect(subject.find(".PitchArtToggle-label")).to.be.present();
        expect(subject.find(".PitchArtToggle-label")).to.have.text(expectedLabel);

        expect(subject.find(".PitchArtToggle-toggle")).to.be.present();
        expect(subject.find(".PitchArtToggle-toggle-off-label")).to.be.present();
        expect(subject.find(".PitchArtToggle-toggle-off-label")).to.have.text(expectedOffText);
        expect(subject.find(".PitchArtToggle-toggle-on-label")).to.be.present();
        expect(subject.find(".PitchArtToggle-toggle-on-label")).to.have.text(expectedOnText);
    });

    describe("behavior for disabled prop", () => {
        it("renders as disabled when disabled is true", () => {
            const subject = shallowRender({disabled: true});
            expect(subject.find(".PitchArtToggle-toggle-input")).to.be.disabled();
        });

        it("renders as not disabled when disabled is false", () => {
            const subject = shallowRender({disabled: false});
            expect(subject.find(".PitchArtToggle-toggle-input")).to.not.be.disabled();
        });
    });

    describe("toggle behavior", () => {
        it("renders selected when isSelected is true", () => {
            const subject = shallowRender({isSelected: true});
            expect(subject.find(".PitchArtToggle-toggle-input")).to.be.checked();
        });

        it("renders as not selected when isSelected is false", () => {
            const subject = shallowRender({isSelected: false});
            expect(subject.find(".PitchArtToggle-toggle-input")).to.not.be.checked();
        });

        it("invokes callback when toggled", () => {
            const mockOnChange = sinon.stub();
            const inputName = "InputName";
            const subject = shallowRender({onChange: mockOnChange, isSelected: false, inputName});

            subject.find(".PitchArtToggle-toggle-input").simulate("change");
            sinon.assert.calledOnce(mockOnChange);
            sinon.assert.calledWith(mockOnChange, inputName, true);
        });
    });
});

interface OptionalProps {
    label?: string;
    offText?: string;
    onText?: string;
    inputName?: string;
    isSelected?: boolean;
    onChange?: (inputName: string, isSelected: boolean) => void;
    disabled?: boolean;
}

function shallowRender(props: OptionalProps) {
    return shallow(<PitchArtToggle {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): PitchArtToggleProps {
    return {
        label: props.label || "",
        offText: props.offText || "",
        onText: props.onText || "",
        inputName: props.inputName || "",
        isSelected: props.isSelected || false,
        onChange: props.onChange || (() => undefined),
        disabled: props.disabled || false
    };
}
