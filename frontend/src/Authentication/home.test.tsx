import {render, shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import Home, { HomeWrapper } from "./home";


const withAuthorizationMock = (condition) => (Component) => {
    return (props) => condition ? <Component {...props} /> : null ;
}
  


describe("Home", () => {

  it("renders the Home Page, if authenticated", () => {
        const MyComponent = withAuthorizationMock(true)(HomeWrapper);
        const wrapper = shallow(<MyComponent />);
        console.log(wrapper.dive())
        expect(wrapper.contains(<HomeWrapper />)).to.be.true;
    });

    it("doesnt renders the Home Page, if not authenticated", () => {
        const MyComponent = withAuthorizationMock(false)(HomeWrapper);
        const wrapper = shallow(<MyComponent />);
        expect(wrapper.contains(<HomeWrapper />)).to.be.false;
    });

});
