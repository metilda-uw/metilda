import {shallow} from "enzyme";
import * as React from "react";
import PlayerBar from "../PitchArtWizard/AudioViewer/PlayerBar";
import {expect} from "../setupTests";
import {arbitrarySpeaker} from "../testSupport/arbitraryObjects";
import {Letter, Speaker} from "../types/types";
import {AudioAnalysis, AudioAnalysisProps} from "./AudioAnalysis";
import AudioImg from "./AudioImg";
import AudioImgDefault from "./AudioImgDefault";
import Firebase from "../Firebase/firebase";
import SpeakerControl from "./SpeakerControl";
import AudioAnalysisImageMenu from "./AudioAnalysisImageMenu";
import sinon from "sinon";

const firebase = new Firebase();
describe("AudioAnalysis", () => {
    it("renders an AudioAnalysis", () => {
        const subject = shallowRender({
            speakers: [arbitrarySpeaker()]
        });
        expect(subject.find(".AudioAnalysis")).to.be.present();
        expect(subject.find(".AudioAnalysis-speaker")).to.be.present();
        expect(subject.find(".AudioAnalysis-analysis")).to.be.present();
        expect(subject.find(SpeakerControl)).to.be.present();
        expect(subject.find(AudioAnalysisImageMenu)).to.be.not.present();
    });

    describe("no speaker has been selected yet", () => {
        it("renders default image message", () => {
            const subject = shallowRender({
                speakers: [arbitrarySpeaker()]
            });
            expect(subject.find(AudioImgDefault)).to.be.present();
        });

        it("does not render audio image", () => {
            const subject = shallowRender({
                speakers: [arbitrarySpeaker()]
            });
            expect(subject.find(AudioImg)).to.not.be.present();
        });

        it("does not render playback options", () => {
            const subject = shallowRender({
                speakers: [arbitrarySpeaker()]
            });
            expect(subject.find(PlayerBar)).to.not.be.present();
        });
    });

    describe("a speaker has been selected", () => {
        it("renders an audio image", () => {
            const subject = shallowRender({
                speakers: [arbitrarySpeaker({uploadId: "fake-id"})]
            });
            expect(subject.find(AudioImg)).to.be.present();
        });

        it("renders playback options", () => {
            const subject = shallowRender({
                speakers: [arbitrarySpeaker({uploadId: "fake-id"})]
            });
            expect(subject.find(PlayerBar)).to.be.present();
        });
    });

    it("renders image menu", () => {
        const subject = shallowRender({
            speakers: [arbitrarySpeaker()]
        });
        subject.setState({imgMenuX: 1, imgMenuY: 1});
        expect(subject.find(AudioAnalysisImageMenu)).to.be.present();
    });

    it("should correctly convert image interval to time interval", () => {
        const subject = shallowRender({
            speakers: [arbitrarySpeaker()]
        });
        const instance = subject.instance();
        subject.setState({maxAudioTime: 10, minAudioTime: 5, maxAudioX: 10, minAudioX: 5});
        expect(instance.imageIntervalToTimeInterval(10, 20)).to.be.deep.equal([ 15, 25 ]);
      });

    it("should correctly apply pitch range of min pitch and max pitch", () => {
        const subject = shallowRender({
            speakers: [arbitrarySpeaker({ uploadId: "test",
                letters: []})]
        });
        const instance = subject.instance();
        subject.setState({maxAudioTime: 10, minAudioTime: 5});
        instance.applyPitchRange(10, 20);
        expect(subject.state("isAudioImageLoaded")).to.be.equal(false);
        expect(subject.state("audioEditVersion")).to.be.equal(1);
        expect(subject.state("minPitch")).to.be.equal(10);
        expect(subject.state("maxPitch")).to.be.equal(20);
        expect(subject.state("imageUrl")).to.be.equal("/api/audio/test.png/image?min-pitch=10&max-pitch=20&tmin=5&&tmax=10");
      });

    it("clicking word split should compute image interval", () => {
        const subject = shallowRender({
            speakers: [arbitrarySpeaker({ uploadId: "test",
                letters: []})]
        });
        const instance = subject.instance();
        const mockStub = sinon.stub(instance, "imageIntervalSelected");
        subject.setState({maxSelectX: 10, minSelectX: 5});
        instance.wordSplitClicked();
        expect(mockStub.calledOnce).to.equal(true);
        mockStub.restore();
      });

    it("clicking average pitch art should compute image interval", () => {
        const subject = shallowRender({
            speakers: [arbitrarySpeaker({ uploadId: "test",
                letters: []})]
        });
        const instance = subject.instance();
        const mockStub = sinon.stub(instance, "imageIntervalSelected");
        subject.setState({maxSelectX: 10, minSelectX: 5});
        instance.averagePitchArtClicked();
        expect(mockStub.calledOnce).to.equal(true);
        mockStub.restore();
      });

    it("clicking add pitch art should call add letter", () => {
        const addLetterStub = sinon.stub();
        const subject = shallowRender({
            speakers: [arbitrarySpeaker({ uploadId: "test",
                letters: []})],
            addLetter: addLetterStub
        });
        const instance = subject.instance();
        subject.setState({maxSelectX: 10, minSelectX: 5, soundLength: 10});
        instance.addPitch(10, "X", [5, 10], true, true);
        expect(addLetterStub.calledOnce).to.equal(true);
      });

    it("selecting audio interval should set min and max pitch", () => {
        const subject = shallowRender({
            speakers: [arbitrarySpeaker({ uploadId: "test",
                letters: []})]
        });
        const instance = subject.instance();
        const mockConfig = {
            audioUrl: "test_url"
        };
        const mockStub = sinon.stub(instance, "getAudioConfigForSelection").returns(mockConfig);
        subject.setState({maxSelectX: 10, minSelectX: 5});
        instance.audioIntervalSelected(15, 50);
        expect(subject.state("maxSelectX")).to.equal(50);
        expect(subject.state("minSelectX")).to.equal(15);
        expect(subject.state("audioUrl")).to.be.equal("test_url");
        expect(mockStub.calledOnce).to.equal(true);
      });

    it("cancelling audio interval should reset min and max pitch", () => {
        const subject = shallowRender({
            speakers: [arbitrarySpeaker({ uploadId: "test",
                letters: []})]
        });
        const instance = subject.instance();
        const mockConfig = {
            audioUrl: "test_url"
        };
        const mockStub = sinon.stub(instance, "getAudioConfigForSelection").returns(mockConfig);
        subject.setState({maxSelectX: 10, minSelectX: 5});
        instance.audioIntervalSelectionCanceled();
        expect(subject.state("maxSelectX")).to.equal(-1);
        expect(subject.state("minSelectX")).to.equal(-1);
        expect(subject.state("audioUrl")).to.be.equal("test_url");
        expect(mockStub.calledOnce).to.equal(true);
      });

    it("target pitch selected should successfully set audio url", () => {
        const subject = shallowRender({
            speakers: [arbitrarySpeaker({ uploadId: "test",
                letters: [{
                    t0: 10,
                    t1: 20,
                    pitch: 30,
                    syllable: "X",
                    isManualPitch: true,
                    isWordSep: true}]})],
        speakerIndex: 0
        });
        const instance = subject.instance();
        subject.setState({maxSelectX: 10, minSelectX: 5});
        instance.targetPitchSelected(0);
        expect(subject.state("audioUrl")).to.be.equal("/api/audio/test/file?tmin=10&tmax=20");
      });

    it("target pitch selected should successfully set audio url", () => {
        const subject = shallowRender({
            speakers: [arbitrarySpeaker({ uploadId: "test",
                letters: [{
                    t0: 10,
                    t1: 20,
                    pitch: 30,
                    syllable: "X",
                    isManualPitch: true,
                    isWordSep: true}]})],
        speakerIndex: 0
        });
        const instance = subject.instance();
        subject.setState({maxAudioTime: 10, minAudioTime: 5});
        instance.getAudioConfigForSelection();
        expect(instance.getAudioConfigForSelection().audioUrl).to.be.equal("/api/audio/test/file?tmin=5&tmax=10");
        expect(instance.getAudioConfigForSelection().minAudioTime).to.be.equal(5);
        expect(instance.getAudioConfigForSelection().maxAudioTime).to.be.equal(10);
      });

});

interface OptionalProps {
    files?: any[];
    speakerIndex?: number;
    speakers?: Speaker[];
    firebase?: any;
    addSpeaker?: () => void;
    removeSpeaker?: (speakerIndex: number) => void;
    resetLetters?: (speakerIndex: number) => void;
    setUploadId?: (speakerIndex: number, uploadId: string) => void;
    addLetter?: (speakerIndex: number, letter: Letter) => void;
    setLetterPitch?: (speakerIndex: number, letterIndex: number, pitch: number) => void;
}

function shallowRender(props: OptionalProps) {
    return shallow<AudioAnalysis>(<AudioAnalysis {...makeProps(props)}/>);
}

function makeProps(props: OptionalProps): AudioAnalysisProps {
    return {
        files: props.files || [],
        firebase: props.firebase || undefined,
        speakerIndex: props.speakerIndex || 0,
        speakers: props.speakers || [],
        addSpeaker: props.addSpeaker || fakeAddSpeaker,
        resetLetters: props.resetLetters || fakeResetLetter,
        removeSpeaker: props.removeSpeaker || fakeRemoveSpeaker,
        setUploadId: props.setUploadId || fakeSetUploadId,
        addLetter: props.addLetter || fakeAddLetter,
        setLetterPitch: props.setLetterPitch || fakeSetLetterPitch
    };
}

function fakeAddSpeaker() {
    // do nothing
}

function fakeResetLetter() {
    // do nothing
}

function fakeRemoveSpeaker(speakerIndex: number) {
    // do nothing
}

function fakeSetUploadId(speakerIndex: number, uploadId: string) {
    // do nothing
}

function fakeAddLetter(speakerIndex: number, letter: Letter) {
    // do nothing
}

function fakeSetLetterPitch(speakerIndex: number, letterIndex: number, pitch: number) {
    // do nothing
}
