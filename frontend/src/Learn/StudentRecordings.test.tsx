import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import sinon from "sinon";
import {StudentRecordings, StudentRecordingsProps} from "./StudentRecordings";
import Firebase from "../Firebase/firebase";

// const mockedFetch = sinon.stub(window, "fetch");
// const firebase = new Firebase();

describe("Signup", () => {
  it("renders the Signup Form", () => {
        const subject = shallowRender({showStudentRecordings: true});
        subject.setState({isLoading: true});
        expect(subject.find(".transition")).to.be.present();
        expect(subject.find(".metilda-loading-spinner-image")).to.be.present();
        expect(subject.find("#myFilesTitle")).to.be.present();
        expect(subject.find("#studentRecordings")).to.be.present();
        expect(subject.find(".BackButton")).to.be.present();
    });

  it("renders table data", () => {
    const mockStudentRecordings = [
      {
        recordingWordName: "test_recording.wav",
      recordings: ["recording1.wav", "recording2.wav"]
      }
    ];
    const subject = shallowRender({showStudentRecordings: true});
    subject.setState({studentRecordings: mockStudentRecordings});
    expect(subject.find(".media").length).to.be.equal(2);
  });
});

interface OptionalProps {
  showStudentRecordings?: boolean;
  studentRecordingsBackButtonClicked?: any;
  studentName?: string;
  studentUid?: string;
  firebase?: any;
}

function shallowRender(props: OptionalProps) {
    return shallow(<StudentRecordings {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): StudentRecordingsProps {
    return {
      showStudentRecordings: props.showStudentRecordings || false,
  studentRecordingsBackButtonClicked: props.studentRecordingsBackButtonClicked || (() => undefined),
  studentName: props.studentName || "",
  studentUid: props.studentUid || "",
  firebase: props.firebase || undefined
    };
}
