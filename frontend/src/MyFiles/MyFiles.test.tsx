import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import sinon from "sinon";
import {MyFiles, MyFilesProps} from "./MyFiles";
import ImagesForMyFiles from "./ImagesForMyFiles";
import Header from "../Layout/Header";
import Firebase from "../Firebase/firebase";

const mockedFetch = sinon.stub(window, "fetch");
const firebase = new Firebase();
describe("MyFiles", () => {
  beforeEach(() => {
    firebase.auth = {currentUser: {email: "test_user@gmail.com"}};
    mockedFetch.returns((jsonOk({result: [[1, "file_1", "255 KB", "/test_files/file_1", false], [2, "file_2", "255 KB", "/test_files/file_2", true]]})));
    function jsonOk(body: any) {
    const mockResponse = new Response(JSON.stringify(body));
    return Promise.resolve(mockResponse);
  }});

  it("renders table data", () => {
    const files = [
      {
        id: 1,
        name: "file_1",
        size: "255 KB ",
        createdAt: " ",
        path: "/test_files/file_1",
        checked: false},
      {
        id: 2,
        name: "file_2",
        size: "255 KB ",
        createdAt: " ",
        path: "/test_files/file_2",
        checked: true}
    ];
    const subject = shallowRender({firebase});
    subject.setState({files});
    // expect(subject.find("input").length).to.be.equal(3); 2 from files and 1 from header
    expect(subject.find(".GetImages").length).to.be.equal(0);
  });

  it("checkboxes for all files should be checked when checkbox in header is checked ", () => {
    const files = [
      {
        id: 1,
        name: "file_1",
        size: "255 KB ",
        createdAt: " ",
        path: "/test_files/file_1",
        checked: false},
      {
          id: 2,
          name: "file_1",
          size: "255 KB ",
          createdAt: " ",
          path: "/test_files/file_1",
          checked: false}
    ];
    const subject = shallowRender({firebase});
    subject.setState({files, checkAll: false});
    subject.find(".checkBoxForAllFiles").simulate("change");
    expect(subject.state("files")).to.be.deep.equal([
      {
        id: 1,
        name: "file_1",
        size: "255 KB ",
        createdAt: " ",
        path: "/test_files/file_1",
        checked: true},
      {
          id: 2,
          name: "file_1",
          size: "255 KB ",
          createdAt: " ",
          path: "/test_files/file_1",
          checked: true}
    ]);
    expect(subject.state("checkAll")).to.be.equal(true);
  });

  it("checkboxes for all files should be unchecked when checkbox in header is unchecked ", () => {
    const files = [
      {
        id: 1,
        name: "file_1",
        size: "255 KB ",
        createdAt: " ",
        path: "/test_files/file_1",
        checked: true},
      {
          id: 2,
          name: "file_1",
          size: "255 KB ",
          createdAt: " ",
          path: "/test_files/file_1",
          checked: true}
    ];
    const subject = shallowRender({firebase});
    subject.setState({files, checkAll: true});
    subject.find(".checkBoxForAllFiles").simulate("change");
    expect(subject.state("files")).to.be.deep.equal([
      {
        id: 1,
        name: "file_1",
        size: "255 KB ",
        createdAt: " ",
        path: "/test_files/file_1",
        checked: false},
      {
          id: 2,
          name: "file_1",
          size: "255 KB ",
          createdAt: " ",
          path: "/test_files/file_1",
          checked: false}
    ]);
    expect(subject.state("checkAll")).to.be.equal(false);
  });

  it("files should be deleted when delete files button is clicked", () => {
    const files = [
      {
        id: 1,
        name: "file_1",
        size: "255 KB ",
        createdAt: " ",
        path: "/test_files/file_1",
        checked: true},
      {
        id: 2,
        name: "file_2",
        size: "255 KB ",
        createdAt: " ",
        path: "/test_files/file_2",
        checked: false}
    ];
    const subject = shallowRender({firebase});
    subject.setState({files});
    subject.find(".DeleteFile").simulate("click");
    expect(subject.state("files")).to.be.equal(files);
  });

  it("download files should be called when download button is clicked", () => {
    const files = [
      {
        id: 1,
        name: "file_1",
        size: "255 KB ",
        createdAt: " ",
        path: "/test_files/file_1",
        checked: false},
      {
        id: 2,
        name: "file_2",
        size: "255 KB ",
        createdAt: " ",
        path: "/test_files/file_2",
        checked: true}
    ];
    const subject = shallowRender({firebase});
    subject.setState({files});
    subject.find(".DownloadFile").simulate("click");
  });
});

interface OptionalProps {
  firebase?: any;
}

function shallowRender(props: OptionalProps) {
    return shallow((<MyFiles {...makeProps(props)}/>), {disableLifecycleMethods: true});
}

function makeProps(props: OptionalProps): MyFilesProps {
    return {
      firebase: props.firebase || undefined
    };
}
