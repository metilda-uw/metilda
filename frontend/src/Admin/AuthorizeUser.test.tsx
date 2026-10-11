import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import sinon from "sinon";
import {AuthorizeUser, AuthorizeUserProps} from "./AuthorizeUser";

const mockedFetch = sinon.stub(window, "fetch");
const fakeFirebase = { auth: { currentUser: { getIdToken: () => Promise.resolve("test-token") } } };
describe("AuthorizeUser", () => {
  it("renders the Authorize User", () => {
        const subject = shallowRender({authorizeUserClicked: true});
        subject.setState({isLoading: true});
        expect(subject.find(".transition")).to.be.present();
        expect(subject.find(".metilda-loading-spinner-image")).to.be.present();
        expect(subject.find("#newUserTitle")).to.be.present();
        expect(subject.find(".CreateUserForm")).to.be.present();
        expect(subject.find(".signup_Submit")).to.be.present();
    });

  it("triggers onchange event on input value change ", () => {
      const subject = shallowRender({});
      subject.find(".roles_Options").simulate("change", [{ value: "Blackfoot", label: "Blackfoot" },
      { value: "Other", label: "Other" }]);
      subject.find(".email").simulate("change", {target: {name: "email", value: "test_user_1@gmail.com"}});
      expect(subject.state("email")).to.be.equal("test_user_1@gmail.com");
      expect(subject.state("role")).to.be.deep.equal([{ value: "Blackfoot", label: "Blackfoot" },
    { value: "Other", label: "Other" }]);
    });

  it("triggers onSubmit on click of update button", (done) => {
      const confirmStub = sinon.stub(window, "confirm").returns(true);
      const subject = shallowRender({});
      subject.setState({role: ["test_role"], email: "test_user_1@gmail.com"});
      mockedFetch.returns((jsonOk({result: "Success"})));
      function jsonOk(body: any) {
          const mockResponse = new Response(JSON.stringify(body));
          return Promise.resolve(mockResponse);
      }
      subject.find(".CreateUserForm").simulate("submit", { preventDefault() { return "true"; } });
      setTimeout(function() {expect(subject.state()).to.be.deep.equal({email: "", role: null, isLoading: false});
                             expect(confirmStub.calledOnce).to.equal(false);
                             confirmStub.restore();
                             done(); }, 10);
      });
});

describe("AuthorizeUser login", () => {
  it("sends the signed-in user's login token with the request", (done) => {
    const subject = shallowRender({});
    subject.setState({ role: { value: "Blackfoot", label: "Blackfoot" }, email: "test_user_1@gmail.com" });
    mockedFetch.resetHistory();
    mockedFetch.returns(Promise.resolve(new Response(JSON.stringify({ result: 1 }))));
    subject.find(".CreateUserForm").simulate("submit", { preventDefault() { return "true"; } });
    setTimeout(() => {
      expect(mockedFetch.firstCall.args[0]).to.equal("/api/authorize-user");
      expect((mockedFetch.firstCall.args[1] as any).headers.Authorization).to.equal("Bearer test-token");
      done();
    }, 10);
  });
});

interface OptionalProps {
  authorizeUserClicked?: any;
  authorizeUserBackButtonClicked?: any;
  firebase?: any;
}

function shallowRender(props: OptionalProps) {
    return shallow(<AuthorizeUser {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): AuthorizeUserProps {
    return {
      authorizeUserClicked: props.authorizeUserClicked || false,
      authorizeUserBackButtonClicked: props.authorizeUserBackButtonClicked || (() => undefined),
      firebase: props.firebase || fakeFirebase
    };
}
