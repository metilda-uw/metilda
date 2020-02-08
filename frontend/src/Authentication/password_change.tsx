import React, { Component } from "react";
import { withFirebase } from "../Firebase";
import ReactGA from "react-ga";

interface Props {
  firebase: any;
}

interface State {
  passwordOne: string;
  passwordTwo: string;
  error: any;
  [key: string]: any;
}

const INITIAL_STATE = {
  passwordOne: "",
  passwordTwo: "",
  error: null,
};

class PasswordChangeForm extends Component<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event: any) => {
    const { passwordOne } = this.state;

    this.props.firebase
      .doPasswordUpdate(passwordOne)
      .then(() => {
        ReactGA.event({
          category: "Password Change",
          action: "User pressed Change Password",
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
    const { passwordOne, passwordTwo, error } = this.state;

    const isInvalid = passwordOne !== passwordTwo || passwordOne === "";

    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="passwordOne"
          value={passwordOne}
          onChange={this.onChange}
          type="password"
          placeholder="New Password"
        />
        <input
          name="passwordTwo"
          value={passwordTwo}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm New Password"
        />
        <button disabled={isInvalid} type="submit" className="globalbtn">
          Reset My Password
        </button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

export default withFirebase(PasswordChangeForm as any);
