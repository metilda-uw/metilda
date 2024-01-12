
import { Link } from "react-router-dom";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../constants/routes";

import React, { useContext, useEffect, useState } from "react";
import FirebaseContext from "../Firebase/context";
import ReactGA from "react-ga";

import { withAuthorization } from "../Session";
import Header from "../Components/header/Header";


class DocumentationContent extends React.Component {
  render() {
    return (
      <div className="Home">
        <Header />

        <br />
         <h3>References</h3>
         <h4>MeT scale</h4>
         <p className="para">
             Mizuki Miyashita, Min Chen, and James Randall, and Naatosi Fish. 2021.
             “Introducing the Melodic Transcription (MeT) Scale for Language Documentation and Application.” Presentation at the 39th West Coast Conference on Formal Linguistics (WCCFL). Online conference. University of Arizona.
             <a href="www.google.com" > Paper Link </a>
         </p>
        
 
         <h4>PeT scale</h4>
         <p>
             Fish, Naatosi. 2018. Fish, Naatosi I., "PEDAGOGY OF PITCH IN L2 BLACKFOOT" (2018). Undergraduate Theses, Professional Papers, and Capstone Artifacts. 193.
             <a href="https://scholarworks.umt.edu/utpp/193/">Paper Link</a> 
          </p>
         <p>
            
         </p>
 
         <p>
             Naatosi Fish and Mizuki Miyashita. 2017. Guiding Pronunciation of Blackfoot Melody. In Honoring Our Teachers. Eds. by Jon Reyhner, Joseph Martin, Louise Lockard and Willard Sakiestewa Gilbert. Flagstaff, AZ: Northern Arizona University. 203-210.
             <a href="www.google.com" > Paper Link </a>
         </p>
       </div>
    );
  }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(DocumentationContent as any);


