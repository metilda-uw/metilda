import React from "react";
import { Link } from "react-router-dom";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../constants/routes";

import ReactGA from "react-ga";


const TermsOfUseContent = () => {
 
  
   return(
      <div className="terms-of-use">
      <h1>MeTILDA Terms of Use</h1>
      <p>Last updated: April 6, 2023</p>

      <section className="section">
        <h2>Introduction</h2>
        <p>
          Please read these Terms of Use carefully before using MeTILDA on this website. Development
          of MeTILDA is an ongoing collaborative project conducted by the MeTILDA team consisting of
          researchers at the University of Montana and the University of Washington, as well as scholars
          and collaborators from the Blackfoot language communities.
        </p>
      </section>

      <section className="section">
        <h2>Acceptance of Terms</h2>
        <p>
          Your access to and use of the Service is conditional on your acceptance of and compliance with
          these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
        </p>
        <p>
          Please agree to the terms of use before using MeTILDA. To use MeTILDA you need to follow these
          terms and rules. These terms are a legal agreement between you (the user) and us (the developers).
          By Using MeTILDA you agree to be legally bound by these terms. We are asking you to follow the rules,
          if the rules are broken we can stop you from accessing and using this software.
        </p>
      </section>

      <section className="section">
        <h2>Citing MeTILDA and Pitch Art</h2>
        <p>
          Please cite MeTILDA and Pitch Art in your own writings, please cite publications appropriately
          (see webpage for citations).
        </p>
      </section>

      <section className="section">
        <h2>Participation</h2>
        <p>
          Users of this in-progress tool are encouraged to provide feedback to the development team via
          online survey forms for the improvement of MeTILDA.
        </p>
      </section>

      <section className="section">
        <h2>Ownership</h2>
        <p>
         meTILDA and any copyrights, including our domain, name, software, and tools are owned by us the developers. Additionally we own any pitch art created on the site, however we grant full non commercial use of any Pitch Art images generated by the user.
         Any commercial, or for-profit use of MeTILDA, its likeness, or any content generated on MeTILDA is expressly forbidden unless an agreement is reached between the developers and users on a case by case basis.
         Data you upload to the site including recordings and spectrograms belong to you the user. 

         ARBITRATION NOTICE: UNLESS YOU OPT OUT OF ARBITRATION WITHIN 30 DAYS OF THE DATE YOU FIRST AGREE TO THESE TERMS OF USE BY FOLLOWING THE OPT-OUT PROCEDURE SPECIFIED IN THE "ARBITRATION" SECTION BELOW, AND EXCEPT FOR CERTAIN TYPES OF DISPUTES DESCRIBED IN THE "ARBITRATION" SECTION BELOW, YOU AGREE THAT DISPUTES BETWEEN YOU AND MeTILDA WILL BE RESOLVED BY BINDING, INDIVIDUAL ARBITRATION AND YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.

         General. You and MeTILDA agree that any dispute, claim or controversy arising out of or relating to these Terms of Use or the breach, termination, enforcement, interpretation or validity thereof (collectively, "Disputes") will be settled by binding arbitration; except that either party retains the right to bring an individual action in small claims court. Without limiting the preceding sentence, you will also have the right to litigate any other Disputes if you provide MeTILDA with written notice of your desire to do so within thirty (30) days following the date you first agree to these Terms of Use (such notice, an "Arbitration Opt-out Notice"). If you do not provide MeTILDA with an Arbitration Opt-out Notice within the thirty (30) day period, you will be deemed to have knowingly and intentionally waived your right to litigate any Dispute except as expressly set forth with respect to individual actions in small claims courts. You acknowledge and agree that you and MeTILDA are each waiving the right to a trial by jury or to participate as a plaintiff or class member in any purported class action or representative proceeding. Further, unless both you and MeTILDA otherwise agree, the arbitrator may not consolidate more than one person's claims, and may not otherwise preside over any form of any class or representative proceeding. If this specific paragraph is held unenforceable, then the entirety of this "Legal Disputes" section will be deemed void. This "Legal Disputes" section will survive any termination of these Terms of Use. Notwithstanding the foregoing, each party reserves the right to seek injunctive or other equitable relief in a court of competent jurisdiction with respect to any dispute related to the actual or threatened infringement, misappropriation or violation of a party's intellectual property or proprietary rights or breach of the User Content and Activities provisions of this Agreement.

         Any legal problems that may arise between you and us must be resolved by you and us through discussion without the involvement of a legal court. We both reserve the right to bring lawsuits to small claims court. You (the user) also have the right to opt out of discussion with us to settle disputes, if you provide written notice to us within 30 days of agreeing to these terms of use. If you do not provide written notice you agree that you have waived the right to litigate, except to bring a suit to small claims court. Further, you agree that you are waiving your right to participate in a class action lawsuit. This paragraph is still legally binding even if you later decide you don’t agree to the terms of use, or stop using MeTILDA.


        </p>
      </section>
      
      <section className="section">
        <h2>Termination</h2>
        <p>
        We may terminate or suspend access to MeTILDA, without prior notice or liability, for any reason whatsoever, including, without limitation, a breach of the terms of use. 

         We have the right to terminate access to MeTILDA for any reason, and without telling you. We accept no liability for termination of use.

         All provisions of the Terms which by their nature shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability. 

         These terms of use survive and you still have to follow the rules even if we terminate your account. This includes all rules laid out in this agreement.

         Content on MeTILDA  allows you to post on social media (e.g. facebook, instagram etc), link (share hyperlinks to MeTILDA and other content), store (download and save stuff created on MeTILDA), share (Pitch Art images and other content with other people) and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the use and sharing of this content.

        </p>
      </section>
      
      <section className="section">
        <h2>Links To Other Websites</h2>
        <p>
        Our Service may contain links to third-party web sites or services that are not owned or controlled by MeTILDA. MeTILDA has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that MeTILDA shall not be responsible or liable, directly or indirectly, for any damage or loss caused, or alleged to be caused by, or in connection with, the use of, or reliance on any such content, goods or services available on or through any such web sites or services.


        </p>
      </section>
      
      <section className="section">
        <h2>Privacy Policy </h2>
        <p>
         Information we collect: MeTILDA collects basic statistics on what kind of users use our platform. This data may include what language users are working on, how you are using MeTILDA, and demographic information of the users such as tribal affiliation, institutional affiliation, and employment. Any data shared will always be anonymized. 

         How we collect data: User information  will be collected through user metadata and feedback information will be collected via the survey forms..

         How we use information we collect: The data collected may be used by the development team as statistics in future presentations, research, and further development of the tool. The research concerns language teaching application as well as language prosody. Your data will not be shared for commercial uses or sold for profit.
        </p>
      </section>
      
      <section className="section">
        <h2>Changes</h2>
        <p>
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is substantial  you will need to agree to the new terms before using the website again. What constitutes a material change will be determined at our sole discretion. 
        </p>
      </section>
      </div>
   );
     
  };
  

export default TermsOfUseContent;
export {TermsOfUseContent};
