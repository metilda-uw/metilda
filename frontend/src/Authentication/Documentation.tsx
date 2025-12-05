
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
        
         <h2>References</h2>
         <h3>MeTILDA</h3>
          <p className="para">
            Chen, Min., Lee, Chris., Fish, Naatosi., Miyashita, Mizuki. and Randall, James. 2024. Cloud-based Platform for Indigenous Language Sound Education. In Proceedings of the Seventh Workshop on the Use of Computational Methods in the Study of Endangered Languages (pp. 1-6).
          <a href="https://aclanthology.org/2024.computel-1.1.pdf"> Paper Link </a>
          </p>

         <h3>MeT scale</h3>
         <p className="para">
             Mizuki Miyashita, Min Chen, and James Randall, and Naatosi Fish. 2021.
             “Introducing the Melodic Transcription (MeT) Scale for Language Documentation and Application.” Presentation at the 39th West Coast Conference on Formal Linguistics (WCCFL). Online conference. University of Arizona.
             <a href="https://www.lingref.com/cpp/wccfl/39/paper3648.pdf" className="terms_of_use_Link" > Paper Link </a>
         </p>
        
 
         <h3>Pitch Art</h3>
         <p className="para">
             Fish, Naatosi. 2018. Fish, Naatosi I., "PEDAGOGY OF PITCH IN L2 BLACKFOOT" (2018). Undergraduate Theses, Professional Papers, and Capstone Artifacts. 193.
             <a href="https://scholarworks.umt.edu/utpp/193/" className="terms_of_use_Link"> Paper Link</a> 
          </p>
         
         <p className="para">
             Naatosi Fish and Mizuki Miyashita. 2017. Guiding Pronunciation of Blackfoot Melody. In Honoring Our Teachers. Eds. by Jon Reyhner, Joseph Martin, Louise Lockard and Willard Sakiestewa Gilbert. Flagstaff, AZ: Northern Arizona University. 203-210.
             <a href="https://jan.ucc.nau.edu/~jar/HOT/HOT-12.pdf" className="terms_of_use_Link"  > Paper Link </a>
         </p>
       </div>
    );
  }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(DocumentationContent as any);


