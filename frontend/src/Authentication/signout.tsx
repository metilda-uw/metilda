import React, { Component } from "react";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../constants/routes";
import { AppState } from "../store";
import { ThunkDispatch } from "redux-thunk";
import { AppActions } from "../store/appActions";
import { setCurrentUserRole } from "../store/userDetails/actions";
import { connect } from "react-redux";

interface Props {
  firebase: any;
  history: any;
  currentUserRole:string;
  setCurrentUserRole:(role:string) =>void;
}

class SignOut extends Component<Props> {

  displayLoginPage = () => {
    this.props.setCurrentUserRole(null);
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

const mapStateToProps = (state: AppState) => ({
  currentUserRole: state.userDetails.currentUserRole
  
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, void, AppActions>
) => ({
  setCurrentUserRole:(role:string) => dispatch(setCurrentUserRole(role)),
 
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withFirebase(SignOut as any));
