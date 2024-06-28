import "./home.scss";
import * as React from "react";
import { withAuthorization } from "../Session";
import Header from "../Components/header/Header";

export const HomeWrapper = () =>  {
    return (
      <div>
        <Header />
        <br />
        <h1>Welcome to MeTILDA</h1>
        <p className="para">
          <b>
            Melodic Transcription in Language Documentation and Application
            (MeTILDA)
          </b>
          is an online platform for studying and learning word melody in a language where pitch is an important part of pronunciation.
          <b />
        </p>
        <p className="list">
          <b>MeTILDA:</b>
          <ul>
            <li>was developed based on the Blackfoot language, however, the goal is to accommodate any language that uses pitch and needs a visual aid to represent pitch movement. </li>
            <li>enables users to create Pitch Art in one application without having to use multiple tools.</li>
            <li>has been developed based on the Blackfoot language by an interdisciplinary team consisting of a Blackfoot language teacher, a linguistics researcher, and a computer scientist.</li>
          </ul>
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
          <ul>
            <li>Mizuki Miyashita (Linguist, University of Montana)</li>
            <li>Min Chen (Computer Scientist, University of Washington)</li>
            <li>Naatosi Fish (Community Linguist, Blackfeet Nation)</li>
            <li>James Randall (Musicologist, University of Montana)</li>
            <li> Research Assistants ( see acknowledgements )</li>
          </ul>
        </p>
         <p className="para">
          <b>Acknowledgements:</b> <br/>
          We would like to thank the following individuals and groups:
          <ul>
            <li>Blackfoot speakers: the late Chief Earl Old Person, Mr. Rod Scout, and Ms. Natalie Creighton. The recordings used for the development were originally provided for the Blackfoot Linguistics Study at the University of Montana.
            </li>
             <li>Kaylene Big Knife for the graphic design of Pitch Art </li>
          <li>Students in LING 491 Audio Data Processing (Fall 2022) for testing the tool.</li>
          <li>
              Audience at the conferences:
              <ul className="subList" >
                <li >
                Society for the Study of the Indigenous Languages of the Americas (SSILA) Summer Meeting
                </li>
                <li>
                   Montana-Alberta Conference on Linguistics (mACOL) 2020
                </li>
                <li>
                   Annual Meeting of Linguistic Society of America (LSA) 2021
                </li>
                <li>
                   West Coast Conference on Formal Linguistics (WCCFL) 2021
                </li>
              </ul>
          </li>
          <li> University of Washington-Bothell( Computer Science):
          <ul className="subList" >
              <li>Mitchell Lee</li>
              <li>Jignasha Borad</li>
              <li>Praveena Avula</li>
              <li>Chris Lee</li>
              <li>Sanjay Penmetsa</li>
            </ul>
          </li>
          <li> University of Montana (Linguistics):
          <ul className="subList" >
              <li>Shay Sullivan(2022)</li>
              <li>Bethany Tafoya(2023)</li>
              <li>Meaghan Toomey(2023)</li>
            </ul>
          </li>
          <li>
          The MeTILDA project is supported by:
           <ul className="subList">
              <li >The National Science Foundation Dynamic Language Infrastructure (BCS-2109437; BCS-2109654)</li>
              <li>Linguistics Program at the University of Montana</li>
              <li>Computer Science at the University of Washington - Bothell. </li>
            </ul>
          </li>
          </ul>
        </p>
        
        {/* TODO: Add citation for MeTILDA */}
      </div>
    );
}

export default withAuthorization(!!HomeWrapper)(HomeWrapper as any);
