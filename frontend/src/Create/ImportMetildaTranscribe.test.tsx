import {mount, shallow} from "enzyme";
import * as React from "react";
import {SyntheticEvent} from "react";
import FileReaderInput, {Result} from "react-file-reader-input";
import sinon from "sinon";
import {expect} from "../setupTests";
import {arbitrarySpeaker} from "../testSupport/arbitraryObjects";
import {Speaker} from "../types/types";
import {ImportMetildaTranscribe, ImportMetildaTranscribeProps} from "./ImportMetildaTranscribe";
import * as importUtils from "./ImportUtils";

describe("ImportMetildaTranscribe", () => {
    it("renders import input", () => {
        const subject = shallowRender({});
        expect(subject.find(".ImportMetildaTranscribe")).to.be.present();
        expect(subject.find(".ImportMetildaTranscribe-open")).to.be.present();
    });

    it("importSpeakerFile imports the speaker correctly", () => {
        const mockSetSpeaker = sinon.stub();
        const fileString = JSON.stringify(arbitrarySpeaker());
        const fileBlob: Blob = new Blob([fileString], {type: "text/plain"});
        const file: File = {lastModified: 0, name: "", ...fileBlob};
        const readAsText = sinon.stub();
        const addEventListener = sinon.stub().callsFake((_, evtHandler) => {
            evtHandler();
        });
        const dummyFileReader = {addEventListener, readAsText, result: fileString};
        // @ts-ignore
        window.FileReader = sinon.stub().returns(dummyFileReader);

        const fakeProgressEvent: any = {};
        importUtils.importSpeakerFile([[fakeProgressEvent, file]], 0, mockSetSpeaker);
        sinon.assert.calledOnce(mockSetSpeaker);
    });

    it("loads a file on click", () => {
        const sinonSandbox = sinon.createSandbox();
        const mockImportSpeakerFile = sinonSandbox.stub(importUtils, "importSpeakerFile");
        const subject = shallowRender({});

        subject.find(FileReaderInput).simulate("change");
        sinon.assert.calledOnce(mockImportSpeakerFile);

        sinonSandbox.restore();
    });
});

interface OptionalProps {
    speakerIndex?: number;
    setSpeaker?: (speakerIndex: number, speaker: Speaker) => void;
    onImport?: (event: SyntheticEvent) => boolean;
}

function shallowRender(props: OptionalProps) {
    return shallow(<ImportMetildaTranscribe {...makeProps(props)}/>);
}

function makeProps(props: OptionalProps): ImportMetildaTranscribeProps {
    return {
        speakerIndex: props.speakerIndex || 0,
        setSpeaker: props.setSpeaker || fakeSetSpeaker,
        onImport: props.onImport || fakeOnImport
    };
}

function fakeSetSpeaker(speakerIndex: number, speaker: Speaker) {
    // do nothing
}

function fakeOnImport(event: SyntheticEvent): boolean {
    return false;
}
