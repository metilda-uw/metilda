import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import TermsOfUseContent from "./terms_of_use_content";


describe("Terms-of-use-Content", () => {
  it("renders the ToC Page", () => {
        const wrapper = shallowRender();
        console.log(wrapper.debug())
        expect(wrapper.exists()).to.be.true
        expect(wrapper.find(".terms-of-use")).to.be.present();
    });
});


function shallowRender() {
    return shallow(<TermsOfUseContent />);
}
