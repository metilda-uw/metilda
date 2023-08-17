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
import LearnNew from "./Pages/LearnNew";
import ContentManagement from "./CMS/ContentManagement";
import Course from "./CMS/Course/Course";
import Lessons from "./CMS/Course/Lessons";
import Quiz from "./CMS/Course/Quiz";
import Students from "./CMS/Course/Students";
import Grades from "./CMS/Course/Grades";
import Syllabus from "./CMS/Course/Syllabus";
import Assignment from "./CMS/Course/Assignment";
import StudentCourses from "./Student/StudentCourses";
import StudentSyllabus from "./Student/StudentCourse/StudentSyllabus";
import StudentLessons from "./Student/StudentCourse/StudentLessons";
import StudentAssignment from "./Student/StudentCourse/StudentAssignment";
import StudentQuiz from "./Student/StudentCourse/StudentQuiz";
import StudentGrades from "./Student/StudentCourse/StudentGrades";
import StudentCourse from "./Student/StudentCourse/StudentCourse";
import Discussion from "./CMS/Course/Discussion";
// import Word from "./Components/collections/Word";
import { Topic } from "./CMS/Course/Discussion/Topic";
import { CreatePost } from "./CMS/Course/Discussion/CreatePost";
import { Post } from "./CMS/Course/Discussion/Post";
import StudentDiscussion from "./Student/StudentCourse/StudentDiscussion";
import { StudentTopic } from "./Student/StudentCourse/Discussion/StudentTopic";
import { StudentCreatePost } from "./Student/StudentCourse/Discussion/StudentCreatePost";
import { StudentPost } from "./Student/StudentCourse/Discussion/StudentPost";

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
      value: entry.responseStart - entry.requestStart,
    });
  });
};
const renderingPerformanceCallback = (list: any) => {
  list.getEntries().forEach((entry: any) => {
    if (entry.name.includes("App")) {
      ReactGA.timing({
        category: "App Render Performace",
        variable: entry.name,
        value: entry.duration,
      });
    }
  });
};

const latencyPerformanceObserver = new PerformanceObserver(
  latencyPerformanceCallback
);
latencyPerformanceObserver.observe({ entryTypes: ["navigation"] });

const renderingPerformanceObserver = new PerformanceObserver(
  renderingPerformanceCallback
);
renderingPerformanceObserver.observe({ entryTypes: ["mark", "measure"] });

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
      <Route exact={true} path={ROUTES.ACCOUNT} component={accountPage} />
      <Route exact={true} path={ROUTES.MY_FILES} component={MyFiles} />
      <Route exact={true} path={ROUTES.HISTORY} component={History} />
      <Route exact={true} path={ROUTES.SIGN_OUT} component={signOut} />
      <Route exact={true} path={ROUTES.COLLECTIONS} component={Collections} />
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

      <Route exact path="/content-management" component={ContentManagement} />
      <Route exact path="/content-management/course/:id" component={Course} />
      <Route exact path="/content-management/course/:id/syllabus" component={Syllabus} />
      <Route exact path="/content-management/course/:id/lessons" component={Lessons} />
      <Route exact path="/content-management/course/:id/discussion" component={Discussion} />
      <Route exact path="/content-management/course/:id/discussion/topic/:topic_id" component={Topic} />
      <Route exact path="/content-management/course/:id/discussion/topic/:topic_id/create" component={CreatePost} />
      <Route exact path="/content-management/course/:id/discussion/topic/:topic_id/post/:post_id" component={Post} />
      <Route exact path="/content-management/course/:id/assignment" component={Assignment} />
      <Route exact path="/content-management/course/:id/quiz" component={Quiz} />
      <Route exact path="/content-management/course/:id/students" component={Students} />
      <Route exact path="/content-management/course/:id/grades" component={Grades} />

      <Route exact path="/student-view" component={StudentCourses} />
      <Route exact path="/student-view/course/:id" component={StudentCourse} />
      <Route exact path="/student-view/course/:id/syllabus" component={StudentSyllabus} />
      <Route exact path="/student-view/course/:id/lessons" component={StudentLessons} />
      <Route exact path="/student-view/course/:id/discussion" component={StudentDiscussion} />
      <Route exact path="/student-view/course/:id/discussion/topic/:topic_id" component={StudentTopic} />
      <Route exact path="/student-view/course/:id/discussion/topic/:topic_id/create" component={StudentCreatePost} />
      <Route exact path="/student-view/course/:id/discussion/topic/:topic_id/post/:post_id" component={StudentPost} />
      <Route exact path="/student-view/course/:id/assignment" component={StudentAssignment} />
      <Route exact path="/student-view/course/:id/quiz" component={StudentQuiz} />
      <Route exact path="/student-view/course/:id/grades" component={StudentGrades} />

    </div>
  </Router>
);

export default withAuthentication(App as any);