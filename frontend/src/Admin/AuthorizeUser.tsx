import React from "react";
import { withAuthorization } from "../Session";
import {spinner} from "../Utils/LoadingSpinner";
import "./ManageUsers.scss";
import Select from "react-select";
import "./AuthorizeUser.scss";
import ReactGA from "react-ga";

export interface AuthorizeUserProps {
  authorizeUserClicked: any;
  authorizeUserBackButtonClicked: any;
}

interface State {
  email: string;
  role: any;
  isLoading: boolean;
  [key: string]: string | boolean| any;
}

const INITIAL_STATE = {
  email: "",
  role: null,
  isLoading: false
};

export class AuthorizeUser extends React.Component<AuthorizeUserProps, State> {

  constructor(props: AuthorizeUserProps) {
      super(props);

      this.state = { ...INITIAL_STATE };
  }

  onSubmit = async (event: any) => {
    event.preventDefault();
    ReactGA.event({
      category: "Admin Action",
      action: "Authorize User Form Submit",
      transport: "beacon"
    });
    const { email, role } = this.state;
    this.setState({
      isLoading: true
    });
    if (role != null) {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("user_role", role.value);
    const response = await fetch(`/api/authorize-user`, {
          method: "POST",
          headers: {
              Accept: "application/json"
          },
          body: formData
        });
    const body = await response.json();
    if (body.result === 1) {
    window.confirm("Authorized user successfully!");
    } else {
      window.confirm("User email or role is incorrect. Please update the user before authorizing");
    }
    } else {
    window.confirm("Please select role");
    }
    this.setState({ ...INITIAL_STATE });
}

onChange = (event: any) => {
  this.setState({ [event.target.name]: event.target.value });
}

backButtonClicked = () => {
  this.setState({ ...INITIAL_STATE });
  this.props.authorizeUserBackButtonClicked();
}

handleRoleChange = (option: any) => {
  this.setState({
    role: option
  });
}

render() {
  const {
    email,
    role
  } = this.state;
  const roleOptions = [
    { value: "Linguistic Researcher", label: "Linguistic Researcher" },
    { value: "Teacher", label: "Teacher" },
    { value: "Student", label: "Student" },
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
  const {authorizeUserClicked} = this.props;
  const className = `${authorizeUserClicked
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
    <h1 id="newUserTitle">Enter user details</h1>
    <form  className="CreateUserForm" onSubmit={this.onSubmit}>
      <input
        className="email"
        name="email"
        value={email}
        onChange={this.onChange}
        type="text"
        placeholder="Email Address *"
        required
      />
      <Select
        className="roles_Options"
        placeholder="Role *"
        value={role}
        options={roleOptions}
        styles={colourStyles}
        onChange={this.handleRoleChange}
      />
      <button type="submit" className="signup_Submit globalbtn" >
        Authorize
      </button>
    </form>
    </div>
    </div>
    </div>
        );
  }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(AuthorizeUser as any) as any;
