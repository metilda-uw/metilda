import {render, shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import { DocumentationContentWrapper } from "./Documentation";


const withAuthorizationMock = (condition) => (Component) => {

    return (props) => condition ? <Component {...props} /> : null ;
};


describe("DocumentationContent", () => {

  it("renders the DocumentationContent Page if authenticated", () => {
        const MyComponent = withAuthorizationMock(true)(DocumentationContentWrapper);
        const wrapper = shallow(<MyComponent />);
        console.log(wrapper.dive())
        expect(wrapper.contains(<DocumentationContentWrapper />)).to.be.true;
    });

     it("doesnt renders the DocumentationContent Page, if user is not authenticated ", () => {
        const MyComponent = withAuthorizationMock(false)(DocumentationContentWrapper);
        const wrapper = shallow(<MyComponent />);
        
        expect(wrapper.contains(<DocumentationContentWrapper />)).to.be.false;
       
    });

});
