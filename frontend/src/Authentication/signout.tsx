import React, { Component } from "react";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../constants/routes";

interface Props {
  firebase: any;
  history: any;
}

class SignOut extends Component<Props> {
  constructor(props: any) {
    super(props);
  }

  displayLoginPage = () => {
    this.props.history.push(ROUTES.SIGN_IN);
  }

  render() {
    this.props.firebase.doSignOut();

    return(<div>
      <h3>You have been signed out successfully</h3>
      <button className="login_Button globalbtn" onClick={this.displayLoginPage}>
          {" "}
          Login/Sign Up
      </button>
    </div>);
  }
}

export default withFirebase(SignOut as any);
