import "materialize-css/dist/css/materialize.min.css";
import "./App.scss";

import * as React from "react";
import { Router, Route } from "react-router-dom";
import "firebase/auth";
import "firebase/firestore";
import ReactGA from "react-ga";

import { withAuthentication } from "./Session";
import { createBrowserHistory } from "history";
import { NotificationContainer } from "react-notifications";

import * as ROUTES from "./constants/routes";
import CreatePitchArt from "./Create/CreatePitchArt";
import PeldaView from "./Pelda/PeldaView";
import WordSyllableCategories from "./Learn/WordSyllableCategories";
import WordSyllableReview from "./Learn/WordSyllableReview";
import Home from "./Authentication/home";
import Landing from "./Authentication/landing";
import signUp from "./Authentication/signup";
import signIn from "./Authentication/login";
import signOut from "./Authentication/signout";
import passwordForget from "./Authentication/password_forget";
import accountPage from "./Authentication/account";
import MyFiles from "./MyFiles/MyFiles";
import History from "./History/History";
import ManageUsers from "./Admin/ManageUsers";
import Collections from "./Pages/Collections";
import Converter from "./Converter/Converter";
import LearnNew from "./Pages/LearnNew";
import Feedback from "./Feedback/Feedback";
import Thankyou from "./Feedback/ThankYou";
import NotificationsComponent from "./Notifications/Notifications";

const LazyTermsOfUseContent = React.lazy(() => import('./Authentication/terms_of_use_content'));
import TermsOfUseContent from "./Authentication/terms_of_use_content";
import DocumentationContent from "./Authentication/Documentation";
// import Word from "./Components/collections/Word";
import { ThunkDispatch } from "redux-thunk";
import { AppActions } from "./store/appActions";
import { setCurrentUserRole } from "./store/userDetails/actions";
import { connect } from "react-redux";
import { AppState } from "./store";
import * as constants from "./constants";

interface Props {
  firebase: any;
  currentUserRole:string;
  setCurrentUserRole:(role:string) =>void;
}

interface State {
  authUser: any;
}

const history = createBrowserHistory();

// ReactGA.initialize("UA-157894331-1");
// history.listen((location) => {
//   ReactGA.set({ page: location.pathname }); // Update the user's current page
//   ReactGA.pageview(location.pathname); // Record a pageview for the given page
// });

// const latencyPerformanceCallback = (list: any) => {
//   list.getEntries().forEach((entry: any) => {
//     ReactGA.timing({
//       category: "Load Performace",
//       variable: "Server Latency",
//       value: entry.responseStart - entry.requestStart,
//     });
//   });
// };
// const renderingPerformanceCallback = (list: any) => {
//   list.getEntries().forEach((entry: any) => {
//     if (entry.name.includes("App")) {
//       ReactGA.timing({
//         category: "App Render Performace",
//         variable: entry.name,
//         value: entry.duration,
//       });
//     }
//   });
// };

// const latencyPerformanceObserver = new PerformanceObserver(
//   latencyPerformanceCallback
// );
// latencyPerformanceObserver.observe({ entryTypes: ["navigation"] });

// const renderingPerformanceObserver = new PerformanceObserver(
//   renderingPerformanceCallback
// );
// renderingPerformanceObserver.observe({ entryTypes: ["mark", "measure"] });

const App = () => (
  <Router history={history}>
    <div className="App">
      <NotificationContainer />
      <Route exact={true} path={ROUTES.LANDING} component={Landing} />
      <Route exact={true} path={ROUTES.SIGN_UP} component={signUp} />
      <Route exact={true} path={ROUTES.SIGN_IN} component={signIn} />
      <Route
        exact={true}
        path={ROUTES.PASSWORD_FORGET}
        component={passwordForget}
      />
      <Route path={ROUTES.TERMS_OF_USE} component={TermsOfUseContent}/>
      <Route exact={true} path={ROUTES.ACCOUNT} component={accountPage} />
      <Route exact={true} path={ROUTES.MY_FILES} component={MyFiles} />
      <Route exact={true} path={ROUTES.HISTORY} component={History} />
      <Route exact={true} path={ROUTES.SIGN_OUT} component={signOut} />
      <Route exact={true} path={ROUTES.COLLECTIONS} component={Collections} />
      <Route exact={true} path={ROUTES.CONVERTER} component={Converter} />
      <Route exact={true} path={ROUTES.FEEDBACK} component={Feedback} />
      <Route exact={true} path={ROUTES.THANKYOU} component={Thankyou}/>
      
      <Route exact={true} path={ROUTES.DOCUMENTATION} component={DocumentationContent} />
      {/* <Route exact path="/collections/:id" component={LearnNew} /> */}
      <Route exact path="/learnnew/:collection/:id" component={LearnNew} />
      <Route path="/home" component={Home} />
      <Route path="/manage-users" component={ManageUsers} />
      <Route path="/pitchartwizard/:type?/:id?" component={CreatePitchArt} />
      <Route path="/peldaview" component={PeldaView} />
      <Route path="/learn/words/syllables" component={WordSyllableCategories} />
      <Route
        path="/learn/words/syllables/:numSyllables"
        component={WordSyllableReview}
      />
      <Route path={ROUTES.NOTIFICATIONS} component={NotificationsComponent}/>
    </div>
  </Router>
);

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
)(withAuthentication(App as any));