import {shallow} from "enzyme";
import * as React from "react";
import * as sinon from "sinon";
import {expect} from "../setupTests";
import {arbitraryLetter, arbitrarySpeaker} from "../testSupport/arbitraryObjects";
import {Speaker} from "../types/types";
import AudioLetter from "./AudioLetter";
import { UpdateSyllable, UpdateSyllableProps } from "./UpdateSyllable";
import {SinonSandbox} from "sinon";

describe("UpdateSyllable", () => {
    it("renders an UpdateSyllable", () => {
        const subject = shallowRender({ });
        expect(subject.find(".syllableLetter")).to.be.present();
        expect(subject.find(".syllableStartTime")).to.be.present();
        expect(subject.find(".syllableEndTime")).to.be.present();
        expect(subject.find(".SaveSyllable")).to.be.present();
    });
});

interface OptionalProps {
    showEditSyllableModal?: boolean;
    currentSyllable?: string;
    currentT0?: number;
    currentT1?: number;
    saveSyllable?: (syllable: string, t0: number, t1: number) => void;
    handleClose?: () => void;
}

function makeProps(props: OptionalProps): UpdateSyllableProps {
    return {
        showEditSyllableModal: props.showEditSyllableModal || true,
        currentSyllable: props.currentSyllable || "ABC",
        currentT0: props.currentT0 || 0,
        currentT1: props.currentT1 || 1,
        saveSyllable: props.saveSyllable || (() => undefined),
        handleClose: props.handleClose || (() => undefined)
    };
}

function shallowRender(props: OptionalProps) {
    return shallow(<UpdateSyllable {...makeProps(props)} />);
}
