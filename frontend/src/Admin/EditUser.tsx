import React from "react";
import { Link } from "react-router-dom";
import { withAuthorization } from "../Session";
import {spinner} from "../Utils/LoadingSpinner";
import "./ManageUsers.scss";
import Select from "react-select";
import "./EditUser.scss";

export interface EditUserProps {
  editUserClicked: any;
  editUserBackButtonClicked: any;
  editedUser: any;
}

interface State {
  username: string;
  email: string;
  passwordOne: string;
  institution: string;
  role: any[];
  languageOfResearch: any[];
  isLoading: boolean;
  [key: string]: string | boolean| any;
}

const INITIAL_STATE = {
  username: "",
  email: "",
  passwordOne: "",
  institution: "",
  role: [],
  languageOfResearch: [],
  isLoading: false
};

export class EditUser extends React.Component<EditUserProps, State> {

  constructor(props: EditUserProps) {
      super(props);

      this.state = { ...INITIAL_STATE };
  }

  componentWillReceiveProps(nextProps: EditUserProps) {
    const {editedUser} = this.props;
    if (nextProps.editedUser !== editedUser) {
      this.setState({
        username: nextProps.editedUser.username,
        email: nextProps.editedUser.email,
        passwordOne: "",
        institution: nextProps.editedUser.institution,
        role: nextProps.editedUser.role,
        languageOfResearch: nextProps.editedUser.languageOfResearch
      });
     }
  }

  onSubmit = async (event: any) => {
    event.preventDefault();
    const { username, email, passwordOne, institution, role } = this.state;
    this.setState({
      isLoading: true
    });
    const formData = new FormData();
    formData.append("email", email);
    formData.append("user_name", username);
    formData.append("university", institution);
    formData.append("role", role.toString());
    formData.append("password", passwordOne);

    const response = await fetch(`/api/add-new-user-from-admin`, {
          method: "POST",
          headers: {
              Accept: "application/json"
          },
          body: formData
        });
    const body = await response.json();
    if (body.result !== "exception") {
      const recordings = await Promise.all(this.state.languageOfResearch.map(async (researchLanguage: any) => {
        const recordingData = new FormData();
        const userId = body.result;
        recordingData.append("user_id", userId);
        recordingData.append("language", researchLanguage.value);
        const result =  await fetch(`/api/create-user-research-language`, {
          method: "POST",
          headers: {
          Accept: "application/json"
          },
          body: recordingData
          });
        return researchLanguage.value;
      }));
      const roles = await Promise.all(this.state.role.map(async (userRole: any) => {
        const roleData = new FormData();
        const userId = body.result;
        roleData.append("user_id", userId);
        roleData.append("user_role", userRole.value);
        const result =  await fetch(`/api/create-user-role`, {
          method: "POST",
          headers: {
          Accept: "application/json"
          },
          body: roleData
          });
        return userRole.value;
      }));
      window.confirm("Added user successfully!");
    } else {
      window.confirm("User already exists!");
    }
    this.setState({ ...INITIAL_STATE });
}
onChange = (event: any) => {
  this.setState({ [event.target.name]: event.target.value });
}

backButtonClicked = () => {
  this.setState({ ...INITIAL_STATE });
  this.props.editUserBackButtonClicked();
}

handleRoleChange = (option: any) => {
  this.setState({
    role: option
  });
}
handleLanguageChange = (option: any) => {
  this.setState({
    languageOfResearch: option
  });
}

render() {
  console.log(this.props.editedUser);
  const {
    username,
    email,
    passwordOne,
    institution,
    role,
    languageOfResearch
  } = this.state;
  const roleOptions = [
    { value: "linguistic_researcher", label: "Linguistic Researcher" },
    { value: "teacher", label: "Teacher" },
    { value: "student", label: "Student" },
    { value: "other", label: "Other" },
  ];
  const languageOptions = [
    { value: "blackfoot", label: "Blackfoot" },
    { value: "english", label: "English" },
    { value: "french", label: "French" },
    { value: "other", label: "Other" },
  ];

  const colourStyles = {
    control: (styles: any) => ({ ...styles, backgroundColor: "white" }),
    option: (styles: any) => ({
      ...styles,
      ":hover": {
        ...styles[":hover"],
        backgroundColor: "red",
      },
    }),
    input: (styles: any) => ({ ...styles, padding: "0px", margin: "0px" }),
  };

  const { isLoading } = this.state;
  const {editUserClicked} = this.props;
  const className = `${editUserClicked
    ? "transition"
    : ""} CreateUser`;
  return (
    <div className={className}>
    <div className="CreateUserContainer">
    <button className="BackButton waves-effect waves-light btn" onClick={this.backButtonClicked}>
          <i className="material-icons right">arrow_back</i>
          Back
    </button>
    <div className="CreateUserSpinner">
    {isLoading && spinner()}
    <h1 id="newUserTitle">Enter new user details</h1>
      <form  className="CreateUserForm" onSubmit={this.onSubmit}>
      <input
        name="username"
        value={username}
        onChange={this.onChange}
        type="text"
        placeholder="Full Name *"
        required
      />
      <input
        name="email"
        value={email}
        onChange={this.onChange}
        type="text"
        placeholder="Email Address *"
        required
      />
      <input
        name="passwordOne"
        value={passwordOne}
        onChange={this.onChange}
        type="password"
        placeholder="Password *"
        required
      />
      <input
        name="institution"
        value={institution}
        onChange={this.onChange}
        type="text"
        placeholder="University/Institution"
      />
      <Select isMulti
        className="language_Options"
        placeholder="Research Language"
        value={languageOfResearch}
        options={languageOptions}
        styles={colourStyles}
        onChange={this.handleLanguageChange}
      />

      <Select isMulti
        className="roles_Options"
        placeholder="Role"
        value={role}
        options={roleOptions}
        styles={colourStyles}
        onChange={this.handleRoleChange}
      />
      <button type="submit" className="signup_Submit" >
        Update
      </button>
    </form>
    </div>
    </div>
    </div>
        );
  }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(EditUser as any) as any;
