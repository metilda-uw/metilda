import "materialize-css/dist/css/materialize.min.css";
import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import CreatePitchArt from "./Create/CreatePitchArt";
import WordSyllableCategories from "./Learn/WordSyllableCategories";
import WordSyllableReview from "./Learn/WordSyllableReview";
import Home from "./Authentication/home";
import "firebase/auth";
import "firebase/firestore";
import * as ROUTES from "./constants/routes";
import Landing from "./Authentication/landing";
import signUp from "./Authentication/signup";
import signIn from "./Authentication/login";
import signOut from "./Authentication/signout";
import passwordForget from "./Authentication/password_forget";
import accountPage from "./Authentication/account";
import adminPage from "./Authentication/admin";
import { withAuthentication } from "./Session";

interface Props {
  firebase: any;
}

interface State {
  authUser: any;
}
const App = () => (<Router>
  <div className="App">
    <Route exact={true} path={ROUTES.LANDING} component={Landing} />
    <Route exact={true} path={ROUTES.SIGN_UP} component={signUp} />
    <Route exact={true} path={ROUTES.SIGN_IN} component={signIn} />
    <Route exact={true} path={ROUTES.PASSWORD_FORGET} component={passwordForget} />
    <Route exact={true} path={ROUTES.ACCOUNT} component={accountPage} />
    <Route exact={true} path={ROUTES.ADMIN} component={adminPage} />
    <Route exact={true} path={ROUTES.SIGN_OUT} component={signOut} />
    <Route path="/home" component={Home} />
    <Route path="/pitchartwizard/:uploadId?" component={CreatePitchArt} />
    <Route exact={true} path="/learn/words/syllables" component={WordSyllableCategories} />
    <Route path="/learn/words/syllables/:numSyllables" component={WordSyllableReview} />
  </div>
</Router>);

export default withAuthentication(App as any);
