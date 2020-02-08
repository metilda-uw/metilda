import React from "react";
import { withAuthorization } from "../Session";
import {spinner} from "../Utils/LoadingSpinner";
import "./ManageUsers.scss";
import Select from "react-select";
import "./EditUser.scss";
import ReactGA from "react-ga";

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
        role: nextProps.editedUser.role.length > 0 ? nextProps.editedUser.role : [],
        languageOfResearch: nextProps.editedUser.languageOfResearch.length > 0 ?
        nextProps.editedUser.languageOfResearch : []
      });
     }
  }

  onSubmit = async (event: any) => {
    event.preventDefault();
    ReactGA.event({
      category: "Admin Action",
      action: "Edit User Form Submit",
      transport: "beacon"
    });
    const { username, email, passwordOne, institution, role, languageOfResearch } = this.state;
    this.setState({
      isLoading: true
    });
    const formData = new FormData();
    formData.append("email", email);
    formData.append("previous_email", this.props.editedUser.email);
    formData.append("user_name", username);
    formData.append("university", institution);
    formData.append("password", passwordOne);
    const response = await fetch(`/api/update-user-from-admin`, {
          method: "POST",
          headers: {
              Accept: "application/json"
          },
          body: formData
        });
    const body = await response.json();
    const result = body.result;
    if (!body.result.includes("Error")) {
      if (languageOfResearch !== this.props.editedUser.languageOfResearch) {
        // Delete previous research languages from DB
       const previousRecordings = await Promise.all(
        this.props.editedUser.languageOfResearch.map(async (researchLanguage: any) => {
          const recordingData = new FormData();
          const userId = email;
          recordingData.append("user_id", userId);
          recordingData.append("language", researchLanguage.value);
          await fetch(`/api/delete-previous-user-research-language`, {
            method: "POST",
            headers: {
            Accept: "application/json"
            },
            body: recordingData
            });
        }));
        // Add newly selected languages to the DB
       if (languageOfResearch !== null) {
          const recordings =  languageOfResearch.map((researchLanguage: any) => {
            const recordingData = new FormData();
            const userId = email;
            recordingData.append("user_id", userId);
            recordingData.append("language", researchLanguage.value);
            fetch(`/api/create-user-research-language`, {
              method: "POST",
              headers: {
              Accept: "application/json"
              },
              body: recordingData
              });
            return researchLanguage.value;
          });
        }
    }
      if (role !== this.props.editedUser.role) {
      await Promise.all(
          this.props.editedUser.role.map(async (currentRole: any) => {
            const recordingData = new FormData();
            const userId = email;
            recordingData.append("user_id", userId);
            recordingData.append("user_role", currentRole.value);
            await fetch(`/api/delete-previous-user-roles`, {
              method: "POST",
              headers: {
              Accept: "application/json"
              },
              body: recordingData
              });
          }));
      if (role != null) {
            const roles =  role.map((userRole: any) => {
              const roleData = new FormData();
              const userId = email;
              roleData.append("user_id", userId);
              roleData.append("user_role", userRole.value);
              fetch(`/api/create-user-role`, {
                method: "POST",
                headers: {
                Accept: "application/json"
                },
                body: roleData
                });
              return userRole.value;
            });
          }
    }
      window.confirm("Updated user successfully!");
      this.setState({
        isLoading: false
      });
    } else {
      window.confirm(body.result);
      this.setState({
        username: this.props.editedUser.username,
        email: this.props.editedUser.email,
        passwordOne: "",
        institution: this.props.editedUser.institution,
        role: this.props.editedUser.role.length > 0 ? this.props.editedUser.role : [],
        languageOfResearch: this.props.editedUser.languageOfResearch.length > 0 ?
        this.props.editedUser.languageOfResearch : [],
        isLoading: false
      });
    }
}
  onChange = (event: any) => {
  this.setState({ [event.target.name]: event.target.value });
}

  backButtonClicked = () => {
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
    const {editUserClicked} = this.props;
    const className = `${editUserClicked
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
      <button type="submit" className="signup_Submit globalbtn" >
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
