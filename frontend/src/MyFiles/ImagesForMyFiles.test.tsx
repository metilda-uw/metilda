import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import sinon from "sinon";
import {ImagesForMyFiles, ImagesForMyFilesProps} from "./ImagesForMyFiles";
import AnalysesForImage from "../History/AnalysesForImage";
import Firebase from "../Firebase/firebase";

const mockedFetch = sinon.stub(window, "fetch");
const firebase = new Firebase();
describe("ImagesForMyFiles", () => {
  beforeEach(() => {
    mockedFetch.returns((jsonOk({result: [[1, "file_1", "255 KB", "/test_files/file_1", false], [2, "file_2", "255 KB", "/test_files/file_2", true]]})));
    function jsonOk(body: any) {
    const mockResponse = new Response(JSON.stringify(body));
    return Promise.resolve(mockResponse);
  }
});
  it("renders the ImagesForMyFiles page", () => {
        const subject = shallowRender({});
        const userImages = [{name: "test_image",
          createdAt: "",
          imageUrl: "/test_images/test_image",
          key: "1",
          checked: false }];
        subject.setState({images: userImages});
        expect(subject.find(".BackButton")).to.be.present();
        expect(subject.find(".imageContainer")).to.be.present();
        expect(subject.find(AnalysesForImage)).to.be.present();
        expect(subject.find("#imageTitle")).to.be.present();
        expect(subject.find(".ExportToExcel")).to.be.present();
    });

  it("render image data", () => {
      const subject = shallowRender({});
      const userImages = [{
        name: "test_image",
        createdAt: "",
        imageUrl: "/test_images/test_image",
        key: 1,
        checked: false }];
      subject.setState({images: userImages});
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
      expect(subject.state("images")).to.be.deep.equal([{
        name: "test_image",
        createdAt: "",
        imageUrl: "/test_images/test_image",
        key: 1,
        checked: true }]);
  });

  it("clicking 'Export to Excel' button should export selected data to excel", () => {
    const subject = shallowRender({firebase});
    const userImages = [{
      name: "test_image",
      createdAt: "",
      imageUrl: "/test_images/test_image",
      key: 1,
      checked: false }];
    subject.setState({images: userImages});
    subject.find("button").at(1).simulate("click");
});
});

interface OptionalProps {
  firebase?: any;
  showImages?: boolean;
  imagesBackButtonClicked?: any;
  fileName?: string;
  fileId?: number;
}

function shallowRender(props: OptionalProps) {
    return shallow((<ImagesForMyFiles {...makeProps(props)}/>), {disableLifecycleMethods: true});
}

function makeProps(props: OptionalProps): ImagesForMyFilesProps {
    return {
      firebase: props.firebase || undefined,
      showImages: props.showImages || false,
      imagesBackButtonClicked : props.imagesBackButtonClicked || (() => undefined),
      fileName: props.fileName || "",
      fileId: props. fileId || 0
    };
}
