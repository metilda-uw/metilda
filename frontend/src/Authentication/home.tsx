import "./home.scss";
import * as React from "react";
import { withAuthorization } from "../Session";
import Header from "../Components/header/Header";

class Home extends React.Component {
  render() {
    return (
      <div className="Home">
        <Header />
        <br />
        <h3>Welcome to MeTILDA</h3>
        <p className="para">
          <b>
            Melodic Transcription in Language Documentation and Application
            (MeTILDA)
          </b>{" "}
          is an online platform for studying and learning word melody in a language where pitch is an important part of pronunciation.
          <b />
        </p>
        <p className="list">
          <b>MeTILDA:</b>
          <li>was developed based on the Blackfoot language, however, the goal is to accommodate any language that uses pitch and needs a visual aid to represent pitch movement. </li>
          <li>enables users to create Pitch Art in one application without having to use multiple tools.</li>
          <li>has been developed based on the Blackfoot language by an interdisciplinary team consisting of a Blackfoot language teacher, a linguistics researcher, and a computer scientist.</li>
        </p>
        <p className="para">
          Currently, there are two Beta features: “Create Pitch Art” and “Learn Word Melody” which are available for test use. Create Pitch Art is a feature where users can create a visual guide for word melody using uploaded recordings. Learn Word Melody is a space where users can compare their production of word melody to a recording. Other features are in-progress.
        </p>
        <p className="para">
         Pitch Art is designed to help language teachers and learners understand how pitch moves throughout a word. Pitch Art is a visual representation of pitch movement in a word.  pitch movement is shown as a simple graph, with dots that represent syllables and height representing pitch.
        </p >
        <p className="para">The team also aims to improve the tool to help linguistic research with respect to documentation and analysis in language’s rhythm and melody.</p>
        <p className="para"><b>Who can use MeTILDA?</b><br/>
        MeTILDA is available for test use. Create an account and login to MeTILDA. Feedback is welcomed.</p>
        <p className="para"><b>MeTILDA Development Team</b>
          <li>Mizuki Miyashita (Linguist, University of Montana)</li>
          <li>Min Chen (Computer Scientist, University of Washington)</li>
          <li>Naatosi Fish (Community Linguist, Blackfeet Nation)</li>
          <li>James Randall (Musicologist, University of Montana)</li></p>
        
          <p className="para">
            <b>Research Assistants</b>
            <br/>
            <b>Computer Science:</b>
            <li>Mitchell Lee</li>
            <li>Jignasha Borad</li>
            <li>Praveena Avula</li>
            <li>Chris Lee</li>
            <li>Sanjay Penmetsa</li>
            <br/>
            <b>Linguistics:</b>
          </p>
        
        <p className="list">
          <b>Acknowledgements:</b>
          <li>Blackfoot speakers: the late Chief Earl Old Person, Mr. Rod Scout, and Ms. Natalie Creighton. The recordings used for the development were originally provided for the Blackfoot Linguistics Study at the University of Montana.
</li>
          <li>Students in LING 491 Audio Data Processing (Fall 2022) for testing the tool.
</li>
          <li>Audience at the conferences (list them)</li>
        </p>
        {/* TODO: Add citation for MeTILDA */}
      </div>
    );
  }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Home as any);
