import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import {Props, Landing} from "./landing";

describe("Landing", () => {
  it("renders the Landing User", () => {
        const subject = shallowRender({});
        expect(subject.find(".landing_Page")).to.be.present();
        expect(subject.find(".login_Button")).to.be.present();
    });


    it("renders the Landing User with new para tags", () => {
      const subject = shallowRender({});
      expect(subject.find(".para")).to.be.present();
  });

  it("clicking the landing page should set hisotry to sign in page", () => {
    const history = ["/"];
    const subject = shallowRender({history});
    subject.find("button").simulate("click");
    expect(history).to.be.deep.equal(["/", "/login"]);
  });
});

interface OptionalProps {
  history?: any[];
}

function shallowRender(props: OptionalProps) {
    return shallow(<Landing {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): Props {
    return {
      history: props.history || undefined
    };
}
