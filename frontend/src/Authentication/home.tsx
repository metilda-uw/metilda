import * as React from "react";
import "./home.scss";
import { withAuthorization } from "../Session";
import Header from "../Layout/Header";

class Home extends React.Component {
  render() {
    return (
      <div className="Home">
        <Header />
        <br/>
        <h3>Welcome to MeTILDA</h3>
        <p>
          <b>
            Melodic Transcription in Language Documentation and Application
            (MeTILDA)
          </b>{" "}
          is a Learning and Analysis Platform that helps people who are <b/>
          interested to learn the endangered language called <b>Blackfoot</b> and <b/>
          also the linguistic researchers who are working <b/>
          for the protection of the language. The visual representation would <b/>
          allow Blackfoot teachers and learners to understand how their <b/>
          pronunciation compares to that of native speakers. Additionally, it <b/>
          would help linguistics researchers in their efforts to document and <b/>
          transcribe audio clips of endangered languages. <b/>
        </p>
        <br/>
        <p>
          <b>
            Platform for Endangered Language Documentation and Analysis
            (PELDA)
          </b>{" "}
          facilitates the use of linguistic tools called <b>Praat</b> and <b>ELAN</b> <b/>
          by integrating these tools into the application interface. The PELDA interface
          allows users to process endangered language recordings and extract their audio <b/>
          features to facilitate effective language documentation and analysis. It also allows users <b/>
          to select a specific time range of an audio file, add hierarchical tiers, and add <b/>
          annotation (comments/notations) details based on specific requirements. In addition, <b/>
          all annotation-related information can be saved in an XML file on the system and <b/>
          viewed later for future access. <b/>
        </p>
        <div className="Acknowledgements">
          <h6>ACKNOWLEDGMENTS</h6>
          <li>Earl Old Person (amsskapipiikani): EOP</li>
          <li>Rod Scout (siksiká): RS</li>
          <li>Natalie Creighton (Kainai): NC</li>
        </div>
        {/* TODO: Add citation for MeTILDA */}
      </div>
    );
  }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Home as any);
