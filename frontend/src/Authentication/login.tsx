import React from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import "./login.scss";
import { PasswordForgetLink } from "./password_forget";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../constants/routes";
import { SignUpPage } from "./signup";
import ReactGA from "react-ga";
import {NotificationManager} from "react-notifications";

export interface Props {
  firebase: any;
  history: any;
}

interface State {
  email: string;
  password: string;
  [key: string]: any;
}

const SignInPage = () => (
  <div className="login_Page">
    <h3> Welcome to MeTILDA!!</h3>
    <div className="signin__Form">
      <h3>Sign In</h3>
      <SignInForm />
      <PasswordForgetLink />
    </div>
    <div className="signup__Form">
      <SignUpPage />
    </div>
  </div>
);

const INITIAL_STATE = {
  email: "",
  password: ""
};

class SignInFormBase extends React.Component<Props, State> {

constructor(props: any) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  setUserType = async (userId: string) => {
    const response = await fetch(
      "/api/get-user-with-verified-role/" + userId +
      "?user-role=Admin",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const body = await response.json();
    if (body.result != null && body.result.length > 0) {
      localStorage.setItem('admin', 'true');
    } else {
      localStorage.setItem('admin', 'false');
    }
    const response_moderator = await fetch(
      "/api/get-user-with-verified-role/" + userId +
      "?user-role=Teacher",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const body_moderator = await response_moderator.json();
    if (body_moderator.result != null && body_moderator.result.length > 0) {
      localStorage.setItem('moderator', 'true');
    } else {
      localStorage.setItem('moderator', 'false');
    }

    const response_user = await fetch(
      "/api/get-user-roles/" + userId +
      "?user-role=Student",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const body_user = await response_user.json();
    if (body_user.result != null && body_user.result[0][0] === 'Student') {
      localStorage.setItem('user', 'true');
    } else {
      localStorage.setItem('user', 'false');
    }
  }

  onSubmit = async (event: any) => {
    event.preventDefault();
    const { email, password } = this.state;
    ReactGA.event({
      category: "Login",
      action: "User pressed login button",
      transport: "beacon"
    });

    interface LoginError {
        code: string;
        message: string;
    }

    let userIsAuthorized: boolean = true;
    const authUser =  await this.props.firebase.doSignInWithEmailAndPassword(email, password)
        .catch((error: LoginError) => {
            userIsAuthorized = false;
            this.setState({...INITIAL_STATE });
            NotificationManager.error(error.message);
        });

    if (userIsAuthorized) {
      this.setUserType(authUser.user.email)
        ReactGA.set({
          userId: authUser.user.uid
        });
        this.setState({ ...INITIAL_STATE });
        const formData = new FormData();
        formData.append("user_id", authUser.user.email);
        fetch(`/api/update-user`, {
            method: "POST",
            headers: {
              Accept: "application/json"
            },
          body: formData
        })
        .then((response) => response.json());
        this.props.history.push(ROUTES.HOME);
    }
  }

onChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  }

render() {
    const { email, password } = this.state;

    const isInvalid = password === "" || email === "";

    return (
      <form className="SignInForm" onSubmit={this.onSubmit}>
        <input
          name="email"
          value={email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
          className="signin_Email"
        />
        <input
          name="password"
          value={password}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
          className="signin_Password"
        />
        <button disabled={isInvalid} type="submit" className="signin_Submit globalbtn">
          Sign In
        </button>
      </form>
    );
  }
}

const SignInForm = compose(
  withRouter,
  withFirebase
)(SignInFormBase);

export default SignInPage;

export { SignInForm, SignInFormBase };
