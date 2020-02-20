import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import sinon from "sinon";
import {SignUpFormBase, Props} from "./signup";
import Firebase from "../Firebase/firebase";

const mockedFetch = sinon.stub(window, "fetch");
const firebase = new Firebase();

describe("Signup", () => {
  it("renders the Signup Form", () => {
        const subject = shallowRender({});
        expect(subject.find(".SignUpForm")).to.be.present();
        expect(subject.find(".terms_of_use")).to.be.present();
        expect(subject.find(".signup_Submit")).to.be.present();
        expect(subject.find(".mandatory_message")).to.be.present();
    });

  it("renders the Create User with form empty inputs", () => {
    const roleOptions = [
      { value: "Linguistic Researcher", label: "Linguistic Researcher" },
      { value: "Teacher", label: "Teacher" },
      { value: "Student", label: "Student" },
      { value: "Other", label: "Other" },
    ];
    const languageOptions = [
      { value: "Blackfoot", label: "Blackfoot" },
      { value: "English", label: "English" },
      { value: "French", label: "French" },
      { value: "Other", label: "Other" },
    ];
    const subject = shallowRender({});
    const username = subject.find("input").get(0).props.value;
    const email = subject.find("input").get(1).props.value;
    const passwordOne = subject.find("input").get(2).props.value;
    const passwordTwo = subject.find("input").get(2).props.value;
    const institution = subject.find("input").get(3).props.value;
    const researchLanguage = subject.find(".language_Options").props();
    const role = subject.find(".roles_Options").props();
    expect(username).to.equal("");
    expect(email).to.equal("");
    expect(passwordOne).to.equal("");
    expect(passwordTwo).to.equal("");
    expect(institution).to.equal("");
    expect(researchLanguage.value).to.deep.equal([]);
    expect(role.value).to.deep.equal([]);
    expect(researchLanguage.options).to.deep.equal(languageOptions);
    expect(role.options).to.deep.equal(roleOptions);
  });

  it("triggers onchange event on input value change", (done) => {
  const subject = shallowRender({});
  const setCustomValidity = sinon.stub();
  subject.find(".username").simulate("change", {target: {name: "username", value: "test_user_1"}});
  subject.find(".email").simulate("change", {target: {name: "email", value: "test_user_1@gmail.com"}});
  subject.find(".passwordOne").simulate("change", {target: {name: "passwordOne", value: "123456"}});
  subject.find(".passwordTwo").simulate("change", {target: {name: "passwordTwo", value: "123456",
  setCustomValidity}});
  subject.find(".institution").simulate("change", {target: {name: "institution", value: "test_institution_1"}});
  subject.find(".TermsOfUseCheckBox").simulate("change", {target: {checked: true}});
  subject.find(".language_Options").simulate("change",
  [{value: "Linguistic Researcher", label: "Linguistic Researcher"}]);
  subject.find(".roles_Options").simulate("change",
  [{ value: "Blackfoot", label: "Blackfoot" },
  { value: "Other", label: "Other" }]);
  setTimeout(function() {
    expect(subject.state("username")).to.be.equal("test_user_1");
    expect(subject.state("email")).to.be.equal("test_user_1@gmail.com");
    expect(subject.state("passwordOne")).to.be.equal("123456");
    expect(subject.state("passwordTwo")).to.be.equal("123456");
    expect(subject.state("institution")).to.be.equal("test_institution_1");
    expect(subject.state("checked")).to.be.equal(true);
    expect(subject.state("languageOfResearch")).to.be.deep.equal([{ value: "Linguistic Researcher", label: "Linguistic Researcher" }]);
    expect(subject.state("role")).to.be.deep.equal([{ value: "Blackfoot", label: "Blackfoot" },
    { value: "Other", label: "Other" }]);
    expect(setCustomValidity.calledOnce).to.equal(true);
    done(); }, 10);

});

  it("triggers custom validation when passwords are not equal", (done) => {
  const subject = shallowRender({});
  const setCustomValidity = sinon.stub();
  subject.find(".passwordOne").simulate("change", {target: {name: "passwordOne", value: "123456"}});
  subject.find(".passwordTwo").simulate("change", {target: {name: "passwordTwo", value: "123",
  setCustomValidity}});
  setTimeout(function() {
    expect(subject.state("passwordOne")).to.be.equal("123456");
    expect(subject.state("passwordTwo")).to.be.equal("123");
    expect(setCustomValidity.calledOnce).to.equal(true);
    done(); }, 10);

});

  it("triggers onSubmit on click of update button",  (done) => {
    const history = ["/"];
    const authUser = {user: {uid: "test_uid"}};
    const callBack = sinon.stub(firebase, "doCreateUserWithEmailAndPassword").returns(authUser);
    const subject = shallowRender({firebase, history});
    const initialState = {
      username: "",
      email: "",
      passwordOne: "",
      passwordTwo: "",
      institution: "",
      role: [],
      languageOfResearch: [],
      uid: "",
      checked: false };
    const updatedState = {
        username: "test_username",
        email: "test_email",
        passwordOne: "123456",
        passwordTwo: "123456",
        institution: "test_institution" };
    // updating state
    subject.setState(updatedState);
    mockedFetch.returns((jsonOk({result: "Error"})));
    function jsonOk(body: any) {
        const mockResponse = new Response(JSON.stringify(body));
        return Promise.resolve(mockResponse);
    }
    subject.find(".SignUpForm").simulate("submit", { preventDefault() { return "true"; } });
    // after submitting the form, state should be set to initial state and history props are changed
    setTimeout(function() {expect(subject.state()).to.be.deep.equal(initialState);
                           expect(history).to.be.deep.equal(["/", "/home"]);
                           expect(callBack.calledOnce).to.equal(true);
                           callBack.restore();
                           done(); }, 10);
    });
});

interface OptionalProps {
  firebase?: any;
  history?: any;
}

function shallowRender(props: OptionalProps) {
    return shallow(<SignUpFormBase {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): Props {
    return {
      firebase: props.firebase || undefined,
      history: props.history || undefined
    };
}
