import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import {Props, SignInFormBase} from "./login";
import Firebase from "../Firebase/firebase";
import sinon from "sinon";

const mockedFetch = sinon.stub(window, "fetch");
const firebase = new Firebase();
describe("Landing", () => {
  it("renders the Landing User", () => {
        const subject = shallowRender({});
        expect(subject.find("input").length).to.be.equal(2);
        expect(subject.find("button").length).to.be.equal(1);
    });

  it("triggers onSubmit on click of update button", (done) => {
    const history = ["/"];
    const authUser = {user: {uid: "test_uid"}};
    const callBack = sinon.stub(firebase, "doSignInWithEmailAndPassword").returns(authUser);
    const subject = shallowRender({firebase, history});
    subject.setState({email: "test_email", password: "test_password"});
    mockedFetch.returns((jsonOk({result: "Success"})));
    function jsonOk(body: any) {
        const mockResponse = new Response(JSON.stringify(body));
        return Promise.resolve(mockResponse);
    }
    subject.find(".SignInForm").simulate("submit", { preventDefault() { return "true"; } });
    setTimeout(function() {expect(history).to.be.deep.equal(["/", "/home"]);
                           expect(callBack.calledOnce).to.equal(true);
                           expect(subject.state()).to.deep.equal({email: "", password: ""});
                           callBack.restore();
                           done(); }, 10);
  });

  it("triggers onchange event on input value change", () => {
    const subject = shallowRender({});
    subject.find(".signin_Email").simulate("change", {target: {name: "email", value: "test_email"}});
    subject.find(".signin_Password").simulate("change", {target: {name: "password", value: "test_password"}});
    expect(subject.state("email")).to.be.equal("test_email");
    expect(subject.state("password")).to.be.equal("test_password");
  });
});

interface OptionalProps {
  firebase?: any;
  history?: any;
}

function shallowRender(props: OptionalProps) {
    return shallow(<SignInFormBase {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): Props {
    return {
      history: props.history || undefined,
      firebase: props.firebase || undefined
    };
}
