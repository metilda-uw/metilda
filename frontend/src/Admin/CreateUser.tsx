import React from "react";
import { Link } from "react-router-dom";
import { withAuthorization } from "../Session";
import {spinner} from "../Utils/LoadingSpinner";
import "./ManageUsers.scss";
import Select from "react-select";
import "./CreateUser.scss";
import ReactGA from "react-ga";
import {NotificationManager} from "react-notifications";

export interface CreateUserProps {
  addUserClicked: any;
  addUserBackButtonClicked: any;
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

export class CreateUser extends React.Component<CreateUserProps, State> {

  constructor(props: CreateUserProps) {
      super(props);

      this.state = { ...INITIAL_STATE };
  }

  onSubmit = async (event: any) => {
    event.preventDefault();
    ReactGA.event({
      category: "Admin Action",
      action: "Create User Form Submit",
      transport: "beacon"
    });
    const { username, email, passwordOne, institution } = this.state;
    this.setState({
      isLoading: true
    });
    const formData = new FormData();
    formData.append("email", email);
    formData.append("user_name", username);
    formData.append("university", institution);
    formData.append("password", passwordOne);
    const response = await fetch(`/api/add-new-user-from-admin`, {
          method: "POST",
          headers: {
              Accept: "application/json"
          },
          body: formData
        });
    const body = await response.json();
    if (!body.result.includes("Error")) {
      if (this.state.languageOfResearch !== null) {
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
    }
      if (this.state.role !== null) {
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
    }
      NotificationManager.success("Added user successfully!");
    } else {
      NotificationManager.error(body.result);
    }
    this.setState({ ...INITIAL_STATE });
}
onChange = (event: any) => {
  this.setState({ [event.target.name]: event.target.value });
}

backButtonClicked = () => {
  this.setState({ ...INITIAL_STATE });
  this.props.addUserBackButtonClicked();
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
  const {
    username,
    email,
    passwordOne,
    institution,
    role,
    languageOfResearch
  } = this.state;
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
  const {addUserClicked} = this.props;
  const className = `${addUserClicked
    ? "transition"
    : ""} CreateUser`;
  return (
    <div className={className}>
    <div className="CreateUserContainer">
    <button className="BackButton waves-effect waves-light btn globalbtn" onClick={this.backButtonClicked}>
          <i className="material-icons right">arrow_back</i>
          Back
    </button>
    <div className="CreateUserSpinner">
    {isLoading && spinner()}
    <h1 id="newUserTitle">Enter new user details</h1>
    <form  className="CreateUserForm" onSubmit={this.onSubmit}>
      <input
        className="username"
        name="username"
        value={username}
        onChange={this.onChange}
        type="text"
        placeholder="Full Name *"
        required
      />
      <input
        className="email"
        name="email"
        value={email}
        onChange={this.onChange}
        type="text"
        placeholder="Email Address *"
        required
      />
      <input
        className="passwordOne"
        name="passwordOne"
        value={passwordOne}
        onChange={this.onChange}
        type="password"
        placeholder="Password *"
        required
      />
      <input
        className="institution"
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
      <button type="submit" className="signup_Submit globalbtn" >
        Add
      </button>
    </form>
    </div>
    </div>
    </div>
        );
  }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(CreateUser as any) as any;
