import React from 'react'

import AuthUserContext from './context'
import { withFirebase } from '../Firebase'

interface Props {
  firebase: any
}

interface State {
  authUser: any
}

const withAuthentication = (Component: React.FC) => {
  class WithAuthentication extends React.Component<Props, State> {
    private listener: any
    constructor(props: any) {
      super(props)

      this.state = {
        authUser: null,
      }
    }

    componentDidMount() {
      this.listener = this.props.firebase.auth.onAuthStateChanged(
        (authUser: any) => {
          authUser
            ? this.setState({ authUser })
            : this.setState({ authUser: null })
        }
      )
    }

    componentWillUnmount() {
      this.listener()
    }

    render() {
      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      )
    }
  }

  return withFirebase(WithAuthentication as any)
}

export default withAuthentication
