import { expect } from 'chai';
import {mount, shallow, ShallowWrapper} from 'enzyme';
import sinon from 'sinon';
import AccentPitchToggle from "./AccentPitchToggle";
import {SyntheticEvent} from "react";
import * as React from "react";

describe("AccentPitchToggle", () => {
    describe("checkbox", () => {
        let subject: ShallowWrapper<AccentPitchToggle>;

        beforeEach(() => {
            subject = makeShallow();
        });

        it("GIVEN value true THEN checkbox is checked", () => {
            expect(subject.find("input[type='checkbox']").prop("checked")).to.be.true;
        });

        it("GIVEN value false THEN checkbox is checked", () => {
            let subject = makeShallow({showAccentPitch: false});
            expect(subject.find("input[type='checkbox']").prop("checked")).to.be.false;
        });

        it("GIVEN input is clicked THEN event handler is called", () => {
            const onButtonClick = sinon.spy();
            const wrapper = mount(<AccentPitchToggle {...makeProps({handleInputChange: onButtonClick})} />);
            wrapper.find("input[type='checkbox']").simulate('change');
            expect(onButtonClick.calledOnce).to.be.true;
        });
    });
});

function makeShallow(props: Props = {}) {
    return shallow(<AccentPitchToggle {...makeProps(props)} />);
}

interface Props {
    showAccentPitch?: boolean,
    handleInputChange?: (event: SyntheticEvent) => void
}

function makeProps(props: Props) {
    return {
        showAccentPitch: (props.showAccentPitch === undefined) ? true : props.showAccentPitch,
        handleInputChange: (props.handleInputChange === undefined) ? fakeEventHandler : props.handleInputChange,
    };
}

function fakeEventHandler(event: SyntheticEvent) {}