import {mount, shallow, ShallowWrapper} from "enzyme";
import {SyntheticEvent} from "react";
import * as React from "react";
import * as sinon from "sinon";
import { expect } from "../../setupTests";
import PitchArtToggle, {PitchArtToggleProps} from "./PitchArtToggle";

describe("PitchArtToggle", () => {
    it("renders the PitchArtToggle", () => {
        const expectedLabel = "MyInput";
        const subject = shallowRender({label: expectedLabel});

        expect(subject.find(".PitchArtToggle")).to.be.present();

        const title = subject.find(".PitchArtToggle-label");
        expect(title).to.be.present();
        expect(title).to.have.text(expectedLabel);

        expect(subject.find(".PitchArtToggle-toggle")).to.be.present();
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
    inputName?: string;
    isSelected?: boolean;
    onChange?: (inputName: string, isSelected: boolean) => void;
}

function shallowRender(props: OptionalProps) {
    return shallow(<PitchArtToggle {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): PitchArtToggleProps {
    return {
        label: props.label || "",
        inputName: props.inputName || "",
        isSelected: props.isSelected || false,
        onChange: props.onChange || (() => undefined)
    };
}
