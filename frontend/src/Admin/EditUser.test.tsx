import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../setupTests";
import sinon from "sinon";
import {EditUser, EditUserProps} from "./EditUser";

const mockedFetch = sinon.stub(window, "fetch");
describe("EditUser", () => {
  it("renders the Edit User", () => {
        const subject = shallowRender({editUserClicked: true});
        expect(subject.find(".BackButton")).to.be.present();
        expect(subject.find(".CreateUserSpinner")).to.be.present();
        expect(subject.find("#newUserTitle")).to.be.present();
        expect(subject.find(".CreateUserForm")).to.be.present();
        expect(subject.find(".signup_Submit")).to.be.present();
    });

  it("renders the Edit User with form inputs pre-populated with the selected user details", () => {
      const initialUser = { };
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
      const subject = shallowRender({editedUser: initialUser});
      const testUser = {
        username: "test_user",
        email: "test_user@gmail.com",
        passwordOne: "",
        institution: "test_institution",
        role: ["test_role"],
        languageOfResearch: ["test_language"] };
      subject.setProps({editedUser: testUser});
      const username = subject.find("input").get(0).props.value;
      const email = subject.find("input").get(1).props.value;
      const passwordOne = subject.find("input").get(2).props.value;
      const institution = subject.find("input").get(3).props.value;
      const researchLanguage = subject.find(".language_Options").props();
      const role = subject.find(".roles_Options").props();
      expect(username).to.equal("test_user");
      expect(email).to.equal("test_user@gmail.com");
      expect(passwordOne).to.equal("");
      expect(institution).to.equal("test_institution");
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

  describe("triggers onSubmit on click of update button", () => {

  it("renders updated values if update-user call returns success ", (done) => {
  window.confirm = jest.fn().mockImplementation(() => true);
  const subject = shallowRender({});
  const initialState = {
    username: "test_user",
    email: "test_user@gmail.com",
    passwordOne: "",
    institution: "test_institution",
    role: ["test_role"],
    languageOfResearch: ["test_language"] };
  const updatedState = {
      username: "test_user_1",
      email: "test_user_1@gmail.com",
      passwordOne: "123456",
      institution: "test_institution_1",
      role: ["test_role"],
      languageOfResearch: ["test_language"] };
  subject.setProps({editedUser: initialState});
  // state is updated by onChange events
  subject.find(".username").simulate("change", {target: {name: "username", value: "test_user_1"}});
  subject.find(".email").simulate("change", {target: {name: "email", value: "test_user_1@gmail.com"}});
  subject.find(".passwordOne").simulate("change", {target: {name: "passwordOne", value: "123456"}});
  subject.find(".institution").simulate("change", {target: {name: "institution", value: "test_institution_1"}});
  // fetch returns success
  mockedFetch.returns((jsonOk({result: "Success"})));
  function jsonOk(body: any) {
      const mockResponse = new Response(JSON.stringify(body));
      return Promise.resolve(mockResponse);
  }
  // state should be updated
  const state = { ...updatedState,
  isLoading: false };
  subject.find(".CreateUserForm").simulate("submit", { preventDefault() { return true; } });
  setTimeout(function() {expect(subject.state()).to.be.deep.equal(state);
                         done(); }, 10);
});

  it("renders previous values if update-user call returns error ", (done) => {
  window.confirm = jest.fn().mockImplementation(() => true);
  const subject = shallowRender({});
  const initialState = {
    username: "test_user",
    email: "test_user@gmail.com",
    passwordOne: "",
    institution: "test_institution",
    role: ["test_role"],
    languageOfResearch: ["test_language"] };
  subject.setProps({editedUser: initialState});
  // state is updated by onChange events
  subject.find(".username").simulate("change", {target: {name: "username", value: "test_user_1"}});
  subject.find(".email").simulate("change", {target: {name: "email", value: "test_user_1@gmail.com"}});
  subject.find(".passwordOne").simulate("change", {target: {name: "passwordOne", value: "123456"}});
  subject.find(".institution").simulate("change", {target: {name: "institution", value: "test_institution_1"}});
  // fetch returns error
  mockedFetch.returns((jsonOk({result: "Error"})));
  function jsonOk(body: any) {
      const mockResponse = new Response(JSON.stringify(body));
      return Promise.resolve(mockResponse);
  }
  // initial state should be retained
  const state = { ...initialState,
  isLoading: false };
  subject.find(".CreateUserForm").simulate("submit", { preventDefault() { return true; } });
  setTimeout(function() {expect(subject.state()).to.be.deep.equal(state);
                         done(); }, 10);
});
    });

  it("triggers onchange event on input value change ", (done) => {
  const subject = shallowRender({});
  const testUser = {
      username: "test_user",
      email: "test_user@gmail.com",
      passwordOne: "",
      institution: "test_institution",
      role: ["test_role"],
      languageOfResearch: ["test_language"] };
  subject.setProps({editedUser: testUser});
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
    expect(subject.state("role")).to.be.deep.equal([{ value: "Blackfoot", label: "Blackfoot" }, { value: "Other", label: "Other" }]);
    done(); }, 10);

});
});

interface OptionalProps {
  editUserClicked?: any;
  editUserBackButtonClicked?: any;
  editedUser?: any;
}

function shallowRender(props: OptionalProps) {
    return shallow(<EditUser {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): EditUserProps {
    return {
      editUserClicked: props.editUserClicked || true,
      editUserBackButtonClicked: props.editUserBackButtonClicked || (() => undefined),
      editedUser: props.editedUser || undefined
    };
}
