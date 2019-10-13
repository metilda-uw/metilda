import React from 'react'

const FirebaseContext = React.createContext<any>(null)

export const withFirebase = (Component: React.FC) => (props: any) => (
  <FirebaseContext.Consumer>
    {firebase => <Component {...props} firebase={firebase} />}
  </FirebaseContext.Consumer>
)

export default FirebaseContext
