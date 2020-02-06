import React from "react";
import { Link } from "react-router-dom";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../constants/routes";
import "./password_forget.scss";
import ReactGA from "react-ga";

interface Props {
  firebase: any;
}

interface State {
  email: string;
  error: any;
  [key: string]: any;
}

const PasswordForgetPage = () => (
  <div className="password_Forget_Page">
    <h3>Enter your Email Address</h3>
    <PasswordForgetForm />
  </div>
);

const INITIAL_STATE = {
  email: "",
  error: null,
};

class PasswordForgetFormBase extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event: any) => {
    const { email } = this.state;

    this.props.firebase
      .doPasswordReset(email)
      .then(() => {
        ReactGA.event({
          category: "Password Forget",
          action: "User pressed Forgot Password",
          transport: "beacon"
        });
        this.setState({ ...INITIAL_STATE });
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
    const { email, error } = this.state;

    const isInvalid = email === "";

    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="email"
          value={this.state.email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
        />
        <button
          disabled={isInvalid}
          type="submit"
          className="reset_Password_Button"
        >
          Reset My Password
        </button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const PasswordForgetLink = () => (
  <p>
    <Link to={ROUTES.PASSWORD_FORGET} className="password_Forget_Link">
      Forgot Password?
    </Link>
  </p>
);

export default PasswordForgetPage;

const PasswordForgetForm = withFirebase(PasswordForgetFormBase as any);

export { PasswordForgetForm, PasswordForgetLink };
