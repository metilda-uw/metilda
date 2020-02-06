import "materialize-css/dist/css/materialize.min.css";
import * as React from "react";
import { Router, Route } from "react-router-dom";
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
import MyFiles from "./MyFiles/MyFiles";
import History from "./History/History";
import adminPage from "./Authentication/admin";
import ManageUsers from "./Admin/ManageUsers";
import { withAuthentication } from "./Session";
import { createBrowserHistory } from "history";
import ReactGA from "react-ga";

interface Props {
  firebase: any;
}

interface State {
  authUser: any;
}

const history = createBrowserHistory();
ReactGA.initialize("UA-157894331-1");
history.listen((location) => {
  ReactGA.set({ page: location.pathname }); // Update the user's current page
  ReactGA.pageview(location.pathname); // Record a pageview for the given page
});

const latencyPerformanceCallback = (list: any) => {
  list.getEntries().forEach((entry: any) => {
    ReactGA.timing({
      category: "Load Performace",
      variable: "Server Latency",
      value: entry.responseStart - entry.requestStart
    });
});
};
const renderingPerformanceCallback = (list: any) => {
  list.getEntries().forEach((entry: any) => {
    if (entry.name.includes("App") ) {
      ReactGA.timing({
        category: "App Render Performace",
        variable: entry.name,
        value: entry.duration
      });
    }
});
};

const latencyPerformanceObserver = new PerformanceObserver(latencyPerformanceCallback);
latencyPerformanceObserver.observe({entryTypes: ["navigation"] });

const renderingPerformanceObserver = new PerformanceObserver(renderingPerformanceCallback);
renderingPerformanceObserver.observe({entryTypes: ["mark", "measure"] });

const App = () => (
<Router history={history}>
  <div className="App">
    <Route exact={true} path={ROUTES.LANDING} component={Landing} />
    <Route exact={true} path={ROUTES.SIGN_UP} component={signUp} />
    <Route exact={true} path={ROUTES.SIGN_IN} component={signIn} />
    <Route exact={true} path={ROUTES.PASSWORD_FORGET} component={passwordForget} />
    <Route exact={true} path={ROUTES.ACCOUNT} component={accountPage} />
    <Route exact={true} path={ROUTES.MY_FILES} component={MyFiles} />
    <Route exact={true} path={ROUTES.HISTORY} component={History} />
    <Route exact={true} path={ROUTES.ADMIN} component={adminPage} />
    <Route exact={true} path={ROUTES.SIGN_OUT} component={signOut} />
    <Route path="/home" component={Home} />
    <Route path="/manage-users" component={ManageUsers} />
    <Route path="/pitchartwizard/:uploadId?" component={CreatePitchArt} />
    <Route exact={true} path="/learn/words/syllables" component={WordSyllableCategories} />
    <Route path="/learn/words/syllables/:numSyllables" component={WordSyllableReview} />
  </div>
</Router>);

export default withAuthentication(App as any);
