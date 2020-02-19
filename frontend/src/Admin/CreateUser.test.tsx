import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import sinon from "sinon";
import {CreateUser, CreateUserProps} from "./CreateUser";

const mockedFetch = sinon.stub(window, "fetch");
describe("CreateUser", () => {
  it("renders the Create User", () => {
        const subject = shallowRender({});
        expect(subject.find(".BackButton")).to.be.present();
        expect(subject.find(".CreateUserSpinner")).to.be.present();
        expect(subject.find("#newUserTitle")).to.be.present();
        expect(subject.find(".CreateUserForm")).to.be.present();
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
    const initialUser = { };
    const subject = shallowRender({});
    const username = subject.find("input").get(0).props.value;
    const email = subject.find("input").get(1).props.value;
    const passwordOne = subject.find("input").get(2).props.value;
    const institution = subject.find("input").get(3).props.value;
    const researchLanguage = subject.find(".language_Options").props();
    const role = subject.find(".roles_Options").props();
    expect(username).to.equal("");
    expect(email).to.equal("");
    expect(passwordOne).to.equal("");
    expect(institution).to.equal("");
    expect(researchLanguage.options).to.deep.equal(languageOptions);
    expect(role.options).to.deep.equal(roleOptions);
  });

  it("renders spinner when page is loading", () => {
    const initialState = {
      username: "",
      email: "",
      passwordOne: "",
      institution: "",
      role: [],
      languageOfResearch: [],
      isLoading: true };
    const subject = shallowRender({});
    subject.setState(initialState);
    expect(subject.find(".metilda-loading-spinner-image")).to.be.present();
});

  it("renders page with initial state when back button is clicked", () => {
    const initialState = {
      username: "",
      email: "",
      passwordOne: "",
      institution: "",
      role: [],
      languageOfResearch: [],
      isLoading: false };
    const updatedState = {
      username: "test_user",
      email: "test_user@gmail.com",
      passwordOne: "123456",
      institution: "test_institution",
      role: ["test_role"],
      languageOfResearch: ["test_language"],
      isLoading: true };
    const subject = shallowRender({});
    subject.setState(updatedState);
    subject.find(".BackButton").simulate("click");
    expect(subject.state()).to.be.deep.equal(initialState);
});

  it("triggers onchange event on input value change ", (done) => {
  const subject = shallowRender({});
  subject.find(".username").simulate("change", {target: {name: "username", value: "test_user_1"}});
  subject.find(".email").simulate("change", {target: {name: "email", value: "test_user_1@gmail.com"}});
  subject.find(".passwordOne").simulate("change", {target: {name: "passwordOne", value: "123456"}});
  subject.find(".institution").simulate("change", {target: {name: "institution", value: "test_institution_1"}});
  subject.find(".language_Options").simulate("change",
  [{value: "Linguistic Researcher", label: "Linguistic Researcher"}]);
  subject.find(".roles_Options").simulate("change",
  [{ value: "Blackfoot", label: "Blackfoot" },
  { value: "Other", label: "Other" }]);
  setTimeout(function() {
    expect(subject.state("username")).to.be.equal("test_user_1");
    expect(subject.state("email")).to.be.equal("test_user_1@gmail.com");
    expect(subject.state("passwordOne")).to.be.equal("123456");
    expect(subject.state("institution")).to.be.equal("test_institution_1");
    expect(subject.state("languageOfResearch")).to.be.deep.equal([{ value: "Linguistic Researcher", label: "Linguistic Researcher" }]);
    expect(subject.state("role")).to.be.deep.equal([{ value: "Blackfoot", label: "Blackfoot" },
    { value: "Other", label: "Other" }]);
    done(); }, 10);

});

  describe("triggers onSubmit on click of update button", () => {

  it("renders initial state after success ", (done) => {
  const confirmStub = sinon.stub(window, "confirm").returns(true);
  const subject = shallowRender({});
  const updatedState = {
      username: "test_user_1",
      email: "test_user_1@gmail.com",
      passwordOne: "123456",
      institution: "test_institution_1",
      role: ["test_role"],
      languageOfResearch: ["test_language"] };
  const initialState = {
        username: "",
        email: "",
        passwordOne: "",
        institution: "",
        role: [],
        languageOfResearch: [],
        isLoading: false };
  subject.setState(updatedState);
  // fetch returns success
  mockedFetch.returns((jsonOk({result: "Success"})));
  function jsonOk(body: any) {
      const mockResponse = new Response(JSON.stringify(body));
      return Promise.resolve(mockResponse);
  }
  subject.find(".CreateUserForm").simulate("submit", { preventDefault() { return "true"; } });
  setTimeout(function() {expect(subject.state()).to.be.deep.equal(initialState);
                         expect(confirmStub.calledOnce).to.equal(true);
                         confirmStub.restore();
                         done(); }, 10);
  });
  it("renders initial state after failure", (done) => {
    const confirmStub = sinon.stub(window, "confirm").returns(true);
    const subject = shallowRender({});
    const updatedState = {
        username: "test_user_1",
        email: "test_user_1@gmail.com",
        passwordOne: "123456",
        institution: "test_institution_1",
        role: ["test_role"],
        languageOfResearch: ["test_language"] };
    const initialState = {
          username: "",
          email: "",
          passwordOne: "",
          institution: "",
          role: [],
          languageOfResearch: [],
          isLoading: false };
    subject.setState(updatedState);
    // fetch returns success
    mockedFetch.returns((jsonOk({result: "Error"})));
    function jsonOk(body: any) {
        const mockResponse = new Response(JSON.stringify(body));
        return Promise.resolve(mockResponse);
    }
    subject.find(".CreateUserForm").simulate("submit", { preventDefault() { return "true"; } });
    setTimeout(function() {expect(subject.state()).to.be.deep.equal(initialState);
                           expect(confirmStub.calledOnce).to.equal(true);
                           confirmStub.restore();
                           done(); }, 10);
    });
 });
});

interface OptionalProps {
  addUserClicked?: any;
  addUserBackButtonClicked?: any;
}

function shallowRender(props: OptionalProps) {
    return shallow(<CreateUser {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): CreateUserProps {
    return {
      addUserClicked: props.addUserClicked || true,
      addUserBackButtonClicked: props.addUserBackButtonClicked || (() => undefined)
    };
}
