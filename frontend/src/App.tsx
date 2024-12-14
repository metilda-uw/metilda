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

import TermsOfUseContent from "./Authentication/terms_of_use_content";
import DocumentationContent from "./Authentication/Documentation";
// import Word from "./Components/collections/Word";

import ContentManagement from "./CMS/ContentManagement";
import Course from "./CMS/Course/Course";
import Lessons from "./CMS/Course/Lessons";
import Quizzes from "./CMS/Course/Quizzes";
import Students from "./CMS/Course/Students";
import Grades from "./CMS/Course/Grades";
import Syllabus from "./CMS/Course/Syllabus";
import StudentCourses from "./Student/StudentCourses";
import StudentSyllabus from "./Student/StudentCourse/StudentSyllabus";
import StudentLessons from "./Student/StudentCourse/StudentLessons";
import StudentGrades from "./Student/StudentCourse/StudentGrades";
import StudentPlayLearn from "./Student/StudentCourse/StudentPlayLearn";
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
import { CreateAssignment } from "./CMS/Course/Assignment/CreateAssignment";
import { UpdateAssignment } from "./CMS/Course/Assignment/UpdateAssignment";
import StudentAssignmentSubmissionDetail from "./Student/StudentCourse/Assignment/StudentAssignmentSubmissionDetail";
import GradesAssignmentSubmissions from "./CMS/Course/Grade/GradesAssignmentSubmissions";
import GradesAssignmentSubmissionDetail from "./CMS/Course/Grade/GradesAssignmentSubmissionDetail";
import GradesGradable from "./CMS/Course/Grade/GradesGradable";
import GradesGradableDetail from "./CMS/Course/Grade/GradesGradableDetail";
import Assignments from "./CMS/Course/Assignments";
import { Assignment } from "./CMS/Course/Assignment/Assignment";
import StudentAssignments from "./Student/StudentCourse/StudentAssignments";
import { StudentAssignment } from "./Student/StudentCourse/Assignment/StudentAssignment";
import { Lesson } from "./CMS/Course/Lesson/Lesson";
import { StudentLesson } from "./Student/StudentCourse/Lesson/StudentLesson";
import Quiz from "./CMS/Course/Quiz/Quiz";
import QuizQuestion from "./CMS/Course/Quiz/QuizQuestion";
import StudentQuizzes from "./Student/StudentCourse/StudentQuizzes";
import StudentQuiz from "./Student/StudentCourse/Quiz/StudentQuiz";
import StudentQuizQuestion from "./Student/StudentCourse/Quiz/StudentQuizQuestion";
import GradesQuiz from "./CMS/Course/Grade/GradesQuiz";
import GradesQuizQuestion from "./CMS/Course/Grade/GradesQuizQuestion";
import GradesQuizQuestionSubmission from "./CMS/Course/Grade/GradesQuizQuestionSubmission";



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

      
      
      <Route exact path="/content-management" component={ContentManagement} />
      <Route exact path="/content-management/course/:id" component={Course} />
      <Route exact path="/content-management/course/:id/syllabus" component={Syllabus} />
      <Route exact path="/content-management/course/:id/lessons" component={Lessons} />
      <Route exact path="/content-management/course/:id/lessons/:lesson_id" component={Lesson} />
      <Route exact path="/content-management/course/:id/discussion" component={Discussion} />
      <Route exact path="/content-management/course/:id/discussion/topic/:topic_id" component={Topic} />
      <Route exact path="/content-management/course/:id/discussion/topic/:topic_id/create" component={CreatePost} />
      <Route exact path="/content-management/course/:id/discussion/topic/:topic_id/post/:post_id" component={Post} />
      <Route exact path="/content-management/course/:id/assignments" component={Assignments} />
      <Route exact path="/content-management/course/:id/assignments/create" component={CreateAssignment} />
      <Route exact path="/content-management/course/:id/assignment/:assignment_id/update" component={UpdateAssignment} />
      <Route exact path="/content-management/course/:id/assignment/:assignment_id" component={Assignment} />
      <Route exact path="/content-management/course/:id/quiz" component={Quizzes} />
      <Route exact path="/content-management/course/:id/quiz/:quiz_id" component={Quiz} />
      <Route exact path="/content-management/course/:id/quiz/:quiz_id/question/:question_id/:index" component={QuizQuestion} />
      <Route exact path="/content-management/course/:id/students" component={Students} />
      <Route exact path="/content-management/course/:id/grades" component={Grades} />
      <Route exact path="/content-management/course/:id/grades/assignment/:assignment_id" component={GradesAssignmentSubmissions} />
      <Route exact path="/content-management/course/:id/grades/assignment/:assignment_id/submission/:submission_id" component={GradesAssignmentSubmissionDetail} />
      <Route exact path="/content-management/course/:id/grades/gradable/:gradable_id" component={GradesGradable} />
      <Route exact path="/content-management/course/:id/grades/gradable/:gradable_id/student/:student_id" component={GradesGradableDetail} />
      <Route exact path="/content-management/course/:id/grades/quiz/:quiz_id" component={GradesQuiz} />
      <Route exact path="/content-management/course/:id/grades/quiz/:quiz_id/question/:question_id" component={GradesQuizQuestion} />
      <Route exact path="/content-management/course/:id/grades/quiz/:quiz_id/question/:question_id/student/:student_id" component={GradesQuizQuestionSubmission} />

      <Route exact path="/student-view" component={StudentCourses} />
      <Route exact path="/student-view/course/:id" component={StudentCourse} />
      <Route exact path="/student-view/course/:id/syllabus" component={StudentSyllabus} />
      <Route exact path="/student-view/course/:id/lessons" component={StudentLessons} />
      <Route exact path="/student-view/course/:id/lessons/:lesson_id" component={StudentLesson} />
      <Route exact path="/student-view/course/:id/discussion" component={StudentDiscussion} />
      <Route exact path="/student-view/course/:id/discussion/topic/:topic_id" component={StudentTopic} />
      <Route exact path="/student-view/course/:id/discussion/topic/:topic_id/create" component={StudentCreatePost} />
      <Route exact path="/student-view/course/:id/discussion/topic/:topic_id/post/:post_id" component={StudentPost} />
      <Route exact path="/student-view/course/:id/assignments" component={StudentAssignments} />
      <Route exact path="/student-view/course/:id/assignment/:assignment_id" component={StudentAssignment} />
      <Route exact path="/student-view/course/:id/assignment/:assignment_id/submission" component={StudentAssignmentSubmissionDetail} />
      <Route exact path="/student-view/course/:id/quiz" component={StudentQuizzes} />
      <Route exact path="/student-view/course/:id/quiz/:quiz_id" component={StudentQuiz} />
      <Route exact path="/student-view/course/:id/quiz/:quiz_id/question/:question_id/:index" component={StudentQuizQuestion} />
      <Route exact path="/student-view/course/:id/grades" component={StudentGrades} />
      <Route exact path="/student-view/course/:id/play_and_learn" component={StudentPlayLearn} />

    </div>
  </Router>
);

export default withAuthentication(App as any);