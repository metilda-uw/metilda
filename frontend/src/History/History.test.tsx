import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import sinon from "sinon";
import {History, HistoryProps} from "./History";
import Header from "../Layout/Header";
import Firebase from "../Firebase/firebase";
import AnalysesForImage from "./AnalysesForImage";

const mockedFetch = sinon.stub(window, "fetch");
const firebase = new Firebase();
describe("History", () => {

  it("renders the History page", () => {
    const allImages = [{
      id: 1,
      name: "test_image",
      createdAt: "",
      imageUrl: "/images/test_image",
      checked: false
    }];
    const subject = shallowRender({});
    subject.setState({allUploadedImages: allImages});
    expect(subject.find("#imageTitle")).to.be.present();
    expect(subject.find(AnalysesForImage)).to.be.present();
    expect(subject.find(Header)).to.be.present();
    expect(subject.find(".imageContainer")).to.be.present();
    expect(subject.find(".ExportToExcel")).to.be.present();
    expect(subject.find(".metilda-loading-spinner-image")).to.be.not.present();
    });

  it("render spinner when page is loading", () => {
      const subject = shallowRender({});
      subject.setState({isLoading: true});
      expect(subject.find(".metilda-loading-spinner-image")).to.be.present();
      });

  it("renders Image data", () => {
        const allImages = [{
          id: 1,
          name: "test_image",
          createdAt: "",
          imageUrl: "/images/test_image",
          checked: false
        }];
        const subject = shallowRender({});
        subject.setState({allUploadedImages: allImages});
        expect(subject.find(".image")).to.be.present();
        expect(subject.find(".imageCheckBox")).to.be.present();
        expect(subject.find("input").length).to.be.equal(2);

        // get analyses for selected image
        subject.find("input").at(1).simulate("click");
        expect(subject.state("isImageClicked")).to.be.equal(true);
        expect(subject.state("selectedImageName")).to.be.equal("test_image");
        expect(subject.state("selectedImageId")).to.be.equal(1);

      // handle checkbox change
        subject.find("input").at(0).simulate("change", { target: {value: 0, checked: true } });
        expect(subject.state("allUploadedImages")).to.be.deep.equal([{
          id: 1,
          name: "test_image",
          createdAt: "",
          imageUrl: "/images/test_image",
          checked: true }]);
        });

  it("clicking 'Export to Excel' button should export selected data to excel", () => {
          const subject = shallowRender({firebase});
          const allImages = [{
            id: 1,
            name: "test_image",
            createdAt: "",
            imageUrl: "/images/test_image",
            checked: false
          }];
          subject.setState({allUploadedImages: allImages});
          mockedFetch.returns((jsonOk({result: [[1, "file_1", "255 KB", "/test_files/file_1", false], [2, "file_2", "255 KB", "/test_files/file_2", true]]})));
          function jsonOk(body: any) {
            const mockResponse = new Response(JSON.stringify(body));
            return Promise.resolve(mockResponse); }
          subject.find("button").at(0).simulate("click");
      });
});

interface OptionalProps {
  firebase?: any;
}

function shallowRender(props: OptionalProps) {
    return shallow((<History {...makeProps(props)}/>), {disableLifecycleMethods: true});
}

function makeProps(props: OptionalProps): HistoryProps {
    return {
      firebase: props.firebase || undefined
    };
}
