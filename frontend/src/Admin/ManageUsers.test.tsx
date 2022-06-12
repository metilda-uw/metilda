import { shallow } from "enzyme";
import * as React from "react";
import { expect } from "../setupTests";
import sinon from "sinon";
import { ManageUsers, ManageUsersProps } from "./ManageUsers";
import Header from "../components/header/Header";
import Firebase from "../Firebase/firebase";
import CreateUser from "./CreateUser";
import EditUser from "./EditUser";
import AuthorizeUser from "./AuthorizeUser";

const mockedFetch = sinon.stub(window, "fetch");
const firebase = new Firebase();
describe("MyFiles", () => {
  beforeEach(() => {
    firebase.auth = { currentUser: { email: "test_user@gmail.com" } };
    mockedFetch.returns(
      jsonOk({
        result: [
          [1, "file_1", "255 KB", "/test_files/file_1", false],
          [2, "file_2", "255 KB", "/test_files/file_2", true],
        ],
      })
    );
    function jsonOk(body: any) {
      const mockResponse = new Response(JSON.stringify(body));
      return Promise.resolve(mockResponse);
    }
  });

  it("renders the MyFiles page", () => {
    const subject = shallowRender({ firebase });
    expect(subject.find(".AddUser")).to.be.present();
    expect(subject.find(".AuthorizeUser")).to.be.present();
    expect(subject.find("#allUsers")).to.be.present();
    expect(subject.find("#usersTitle")).to.be.present();
    expect(subject.find(CreateUser)).to.be.present();
    expect(subject.find(EditUser)).to.be.present();
    expect(subject.find(AuthorizeUser)).to.be.present();
    expect(subject.find(Header)).to.be.present();
  });

  it("renders table data", () => {
    const initialUsers = [
      {
        id: "1",
        name: "user_1",
        createdAt: "",
        lastLogin: "",
        role: "test_role",
        university: "test_university",
        researchLanguage: "test_language",
      },
      {
        id: "2",
        name: "user_2",
        createdAt: "",
        lastLogin: "",
        role: "test_role",
        university: "test_university",
        researchLanguage: "test_language",
      },
    ];
    const subject = shallowRender({});
    subject.setState({ users: initialUsers });
    expect(subject.find(".DeleteUser").length).to.be.equal(2);
    expect(subject.find(".EditUser").length).to.be.equal(2);
  });

  it("should not delete user details when user cancels user deletion", () => {
    const confirmStub = sinon.stub(window, "confirm").returns(true);
    const initialUsers = [
      {
        id: "1",
        name: "user_1",
        createdAt: "",
        lastLogin: "",
        role: "test_role",
        university: "test_university",
        researchLanguage: "test_language",
      },
    ];
    const subject = shallowRender({ firebase });
    subject.setState({ users: initialUsers });
    expect(subject.find(".DeleteUser").length).to.be.equal(1);
    subject.find(".DeleteUser").simulate("click");
    expect(subject.state("users")).to.be.deep.equal([
      {
        id: "1",
        name: "user_1",
        createdAt: "",
        lastLogin: "",
        role: "test_role",
        university: "test_university",
        researchLanguage: "test_language",
      },
    ]);
    expect(confirmStub.calledOnce).to.equal(false);
    confirmStub.restore();
  });

  it("should delete user details when user confirms user deletion", () => {
    const confirmStub = sinon.stub(window, "confirm").returns(false);
    const initialUsers = [
      {
        id: "1",
        name: "user_1",
        createdAt: "",
        lastLogin: "",
        role: "test_role",
        university: "test_university",
        researchLanguage: "test_language",
      },
    ];
    const subject = shallowRender({ firebase });
    subject.setState({ users: initialUsers });
    expect(subject.find(".DeleteUser").length).to.be.equal(1);
    subject.find(".DeleteUser").simulate("click");
    expect(subject.state("users")).to.be.deep.equal(initialUsers);
    expect(confirmStub.calledOnce).to.equal(false);
    confirmStub.restore();
  });

  it("clicking authorize user button should authorize an user", () => {
    const subject = shallowRender({});
    subject.find(".AuthorizeUser").simulate("click");
    expect(subject.state("isauthorizeUserClicked")).to.be.equal(true);
  });

  it("clicking add user button should add an user", () => {
    const subject = shallowRender({});
    subject.find(".AddUser").simulate("click");
    expect(subject.state("isCreateUserClicked")).to.be.equal(true);
  });

  it("clicking edit user button should edit user details", () => {
    const initialUsers = [
      {
        id: "1",
        name: "user_1",
        createdAt: "",
        lastLogin: "",
        role: "test_role",
        university: "test_university",
        researchLanguage: "test_language",
      },
    ];
    const subject = shallowRender({});
    subject.setState({ users: initialUsers });
    expect(subject.find(".EditUser").length).to.be.equal(1);
    subject.find(".EditUser").simulate("click");
    expect(subject.state("editedUser")).to.be.deep.equal({
      username: "user_1",
      email: "1",
      institution: "test_university",
      role: [{ value: "test_role", label: "test_role" }],
      languageOfResearch: [{ value: "test_language", label: "test_language" }],
    });
    expect(subject.state("isEditUserClicked")).to.be.equal(true);
  });
});

interface OptionalProps {
  firebase?: any;
}

function shallowRender(props: OptionalProps) {
  return shallow(<ManageUsers {...makeProps(props)} />, {
    disableLifecycleMethods: true,
  });
}

function makeProps(props: OptionalProps): ManageUsersProps {
  return {
    firebase: props.firebase || undefined,
  };
}
