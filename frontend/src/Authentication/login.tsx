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
