import React  from "react";
import { withRouter } from "react-router-dom";
import * as ROUTES from "../constants/routes";
import { DemoVideo } from "./DemoVideo";
import "./landing.scss";
// const DemoVideo = lazy(() => import("./DemoVideo"));

export interface Props {
  history: any;
}




export class Landing extends React.Component<Props> {

  displayLoginPage = () => {
    this.props.history.push(ROUTES.SIGN_IN);
  }

  render() {
    return (
      <div className="landing_Page">
        <h1> Welcome to MeTILDA</h1>
        <h2> Melodic Transcription in Language Documentation and Application</h2>
        <h3>Learning and Analysis Platform for Linguistic Researchers and
          teachers/students
        </h3>
        <button className="login_Button" onClick={this.displayLoginPage}>
         
            <div>Login/Sign Up</div>
        </button>
        <p />
        {/* beauitfy this  */}
        <p className="para">
          <b>MeTILDA:</b>
          <ul>
                <li>was developed based on the Blackfoot language, however, the goal is to accommodate any language that uses pitch and needs a visual aid to represent pitch movement. </li>
                <li>enables users to create Pitch Art in one application without having to use multiple tools.</li>
                 <li>has been developed based on the Blackfoot language by an interdisciplinary team consisting of a Blackfoot language teacher, a linguistics researcher, and a computer scientist.</li>
          </ul>
              </p>
        <p className="para">
          Currently, there are two Beta features: “Create Pitch Art” and “Learn Word Melody” which are available for test use. Create Pitch Art is a feature where users can create a visual guide for word melody using uploaded recordings. Learn Word Melody is a space where users can compare their production of word melody to a recording. Other features are in-progress.
        </p >
        <p  className="para">
         Pitch Art is designed to help language teachers and learners understand how pitch moves throughout a word. Pitch Art is a visual representation of pitch movement in a word.  pitch movement is shown as a simple graph, with dots that represent syllables and height representing pitch.
        </p  >
        <p  className="para">The team also aims to improve the tool to help linguistic research with respect to documentation and analysis in language’s rhythm and melody.</p >
        <p  className="para"><b>Who can use MeTILDA? <br></br></b>
        MeTILDA is available for test use. Create an account and login to MeTILDA. Feedback is welcomed.
        </p >
       
        <p>This is a short demo of the system in its current state!</p >
          <DemoVideo />
        
      </div>
     
    );
  }
}

export default withRouter(Landing as any);
