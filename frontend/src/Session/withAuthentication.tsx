import React from "react";

import AuthUserContext from "./context";
import { withFirebase } from "../Firebase";
import { ensureRegistered, forgetRegistrationCheck } from "./ensureRegistered";

interface Props {
  firebase: any;
}

interface State {
  authUser: any;
}

const withAuthentication = (Component: React.ComponentType<any>) => {
  class WithAuthentication extends React.Component<Props, State> {
    private listener: any;
    constructor(props: any) {
      super(props);

      this.state = {
        authUser: null,
      };
    }

    componentDidMount() {
      this.listener = this.props.firebase.auth.onAuthStateChanged(
        (authUser: any) => {
          if (authUser) {
            this.setState({ authUser });
            // A login without a MeTILDA account row cannot upload or save; this adds the row.
            ensureRegistered(this.props.firebase, authUser);
          } else {
            this.setState({ authUser: null });
            forgetRegistrationCheck();
          }
        }
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return withFirebase(WithAuthentication as any);
};

export default withAuthentication;
