import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import sinon from "sinon";
import {EafsForMyFiles, EafsForMyFilesProps} from "./EafsForMyFiles";
import Firebase from "../Firebase/firebase";

const mockedFetch = sinon.stub(window, "fetch");
const firebase = new Firebase();
describe("EafsForMyFiles", () => {
  beforeEach(() => {
    mockedFetch.returns((jsonOk({result: [[1, "file_1", "255 KB", "/test_files/file_1", false], [2, "file_2", "255 KB", "/test_files/file_2", true]]})));
    function jsonOk(body: any) {
      const mockResponse = new Response(JSON.stringify(body));
      return Promise.resolve(mockResponse);
    }
  });

  it("renders the EafsForMyFiles page", () => {
        const subject = shallowRender({});
        const userEafs = [{name: "test_eaf",
          createdAt: "",
          path: "/test_eaf/test_eaf",
          key: "1",
          checked: false }];
        subject.setState({eafs: userEafs});
        expect(subject.find(".EafsForMyFiles")).to.be.present();
        expect(subject.find(".BackButton")).to.be.present();
        expect(subject.find(".eafContainer")).to.be.present();
        expect(subject.find("#eafData")).to.be.present();
  });

  it("render eaf data", () => {
      const subject = shallowRender({});
      const userEafs = [{name: "test_eaf",
        createdAt: "",
        path: "/test_eaf/test_eaf",
        key: "1",
        checked: false }];
      subject.setState({eafs: userEafs});
      expect(subject.find(".checkBoxForFile")).to.be.present();
      expect(subject.find("input").length).to.be.equal(2);
      expect(subject.find(".GetImages").length).to.be.equal(1);
      // handle checkbox change
      subject.find("input").at(1).simulate("change", { target: {value: 0, checked: true } });
      expect(subject.state("eafs")).to.be.eql(userEafs);
      // get eaf for selected audio
      subject.find(".GetImages").at(0).simulate("click");
  });

  it("clicking 'Export to Excel' button should export selected data to excel", () => {
    const subject = shallowRender({firebase});
    const userEafs = [{name: "test_eaf",
        createdAt: "",
        path: "/test_eaf/test_eaf",
        key: "1",
        checked: false }];
    subject.setState({eafs: userEafs});
    subject.find("button").at(1).simulate("click");
  });
});

interface OptionalProps {
  firebase?: any;
  showEafs?: boolean;
  eafsBackButtonClicked?: any;
  fileName?: string;
  fileId?: number;
}

function shallowRender(props: OptionalProps) {
    return shallow((<EafsForMyFiles {...makeProps(props)}/>), {disableLifecycleMethods: true});
}

function makeProps(props: OptionalProps): EafsForMyFilesProps {
    return {
      firebase: props.firebase || undefined,
      showEafs: props.showEafs || false,
      eafsBackButtonClicked : props.eafsBackButtonClicked || (() => undefined),
      fileName: props.fileName || "",
      fileId: props. fileId || 0
    };
}
