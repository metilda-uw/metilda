import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import sinon from "sinon";
import {WordSyllableReview, Props} from "./WordSyllableReview";
import Firebase from "../Firebase/firebase";
import Header from "../Layout/Header";
import PitchArtPrevPitchValueToggle from "./PitchArtPrevPitchValueToggle";
import PlayerBar from "../PitchArtWizard/AudioViewer/PlayerBar";
import PitchArtDrawingWindow from "../PitchArtWizard/PitchArtViewer/PitchArtDrawingWindow";

const mockedFetch = sinon.stub(window, "fetch");
const firebase = new Firebase();
let location: any;
let testMatch: any;
describe("WordSyllableReview", () => {
  beforeEach(() => {
    mockedFetch.returns((jsonOk({result: [[1, "file_1", "255 KB", "/test_files/file_1", false], [2, "file_2", "255 KB", "/test_files/file_2", true]]})));
    function jsonOk(body: any) {
    const mockResponse = new Response(JSON.stringify(body));
    return Promise.resolve(mockResponse);
  }
    location = {
    search: ["accentIndex: 1"]
  };
    testMatch = {
    params: {
      numSyllables: 2
    }
  };
});
  it("renders the WordSyllableReview page", () => {
    const subject = shallowRender({location, match: testMatch});
    expect(subject.find(".metilda-page-header")).to.be.present();
    expect(subject.find(".metilda-page-content")).to.be.present();
    expect(subject.find(Header)).to.be.present();
    expect(subject.find(PitchArtPrevPitchValueToggle)).to.be.present();
    expect(subject.find(PitchArtDrawingWindow)).to.be.present();
    expect(subject.find(PlayerBar)).to.be.present();
    expect(subject.find(".pitch-art-controls-container")).to.be.present();
    expect(subject.find(".metilda-pitch-art-image-loading")).to.be.not.present();
    });

  it("renders spinner when results are loading", () => {
      const subject = shallowRender({location, match: testMatch});
      subject.setState({isLoadingPitchResults: true});
      expect(subject.find(".metilda-pitch-art-image-loading")).to.be.present();
      });

  it("renders previous recordings if any", () => {
    const previousTestRecordings = [{
      itemRef: {
        location: {
          path: "Recordings/test_recording"
        }
      },
    recordingUrl: "Recordings/test_recording"
    }];
    const subject = shallowRender({location, match: testMatch});
    subject.setState({previousRecordings: previousTestRecordings});
    expect(subject.find(".media")).to.be.present();
    expect(subject.find(".metilda-previous-recordings-image-col-1")).to.be.present();
    expect(subject.find(".metilda-previous-recordings-image-col-2")).to.be.present();
    expect(subject.find(".metilda-previous-recordings-image-col-3")).to.be.present();
    });

  it("captures user recording when start/stop record is clicked", () => {
    const mockRawPitchValueLists = [
      [{
        t0: 0.123,
        t1: 0.234,
        pitch: 23
      }]
    ];
    const subject = shallowRender({location, match: testMatch});
    subject.setState({userPitchValueLists: mockRawPitchValueLists});
    subject.find("button").at(1).simulate("click");
    expect(subject.state("isRecording")).to.be.equal(false);
    expect(subject.state("userPitchValueLists")).to.be.deep.equal(mockRawPitchValueLists);
    expect(subject.state("isLoadingPitchResults")).to.be.equal(false);
  });

  it("minimum pitch art time function should return minimum pitch value of active word", () => {
    const subject = shallowRender({location, match: testMatch});
    const instance = subject.instance();
    expect(subject.state("words").length).to.be.equal(2);
    expect(instance.minPitchArtTime()).to.be.equal(0.3703882232235339);
  });

  it("maximum pitch art time function should return maximum pitch value of active word", () => {
    const subject = shallowRender({location, match: testMatch});
    const instance = subject.instance();
    expect(subject.state("words").length).to.be.equal(2);
    expect(instance.maxPitchArtTime()).to.be.equal(1.191505993026407);
  });

  it("page title should display the correct number of syllables", () => {
    const subject = shallowRender({location, match: testMatch});
    const instance = subject.instance();
    expect(instance.pageTitle()).to.be.equal("2 Syllables, Accent NaN syllable");
  });

  it("clicking 'Clear Previous' should clear all pitch values list", () => {
    const mockRawPitchValueLists = [
      [{
        t0: 0.123,
        t1: 0.234,
        pitch: 23
      }]
    ];
    const subject = shallowRender({location, match: testMatch});
    subject.setState({userPitchValueLists: mockRawPitchValueLists});
    subject.find("button").at(0).simulate("click");
    expect(subject.state("userPitchValueLists")).to.be.deep.equal([]);
  });

  it("clicking delete previous recording should not delete a recording if user cancels delete action", () => {
    const confirmStub = sinon.stub(window, "confirm").returns(false);
    const previousTestRecordings = [{
      itemRef: {
        location: {
          path: "Recordings/test_recording"
        }
      },
    recordingUrl: "Recordings/test_recording"
    }];
    const subject = shallowRender({location, match: testMatch});
    subject.setState({previousRecordings: previousTestRecordings});
    subject.find("button").at(0).simulate("click");
    expect(subject.state("previousRecordings")).to.deep.equal(previousTestRecordings);
    expect(confirmStub.calledOnce).to.equal(true);
    confirmStub.restore();
    });

});

interface OptionalProps {
  firebase?: any;
  history?: any;
  location?: any;
  match?: any;
}

function shallowRender(props: OptionalProps) {
    return shallow<WordSyllableReview>((<WordSyllableReview {...makeProps(props)}/>), {disableLifecycleMethods: true});
}

function makeProps(props: OptionalProps): Props {
    return {
      firebase: props.firebase || undefined,
      history: props.history || undefined,
      location: props.location || undefined,
      match: props.match || undefined
    };
}
