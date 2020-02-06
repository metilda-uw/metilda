import React from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import "./login.scss";
import { PasswordForgetLink } from "./password_forget";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../constants/routes";
import { SignUpPage } from "./signup";
import ReactGA from "react-ga";

interface Props {
  firebase: any;
  history: any;
}

interface State {
  email: string;
  password: string;
  error: any;
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
  password: "",
  error: null,
};

class SignInFormBase extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event: any) => {
    const { email, password } = this.state;

    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then((authUser: any) => {
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
      })
      .catch((error: any) => {
        this.setState({ error });
      });

    event.preventDefault();
  }

  onChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    const { email, password, error } = this.state;

    const isInvalid = password === "" || email === "";

    return (
      <form onSubmit={this.onSubmit}>
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
        <button disabled={isInvalid} type="submit" className="signin_Submit">
          Sign In
        </button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const SignInForm = compose(
  withRouter,
  withFirebase
)(SignInFormBase);

export default SignInPage;

export { SignInForm };
