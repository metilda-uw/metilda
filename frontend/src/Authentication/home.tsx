import * as React from 'react'
import './home.scss'
import { withAuthorization } from '../Session'
import Header from '../Layout/Header'

class Home extends React.Component {
  render() {
    return (
      <div className="Home">
        <Header />
        <h3>Welcome to MeTILDA</h3>
        <p>
          <b>
            Melodic Transcription in Language Documentation and Application
            (MeTILDA)
          </b>{' '}
          is a Learning and Analysis Platform that helps people who are
          interested to learn the endangered language called
          <b>Blackfoot</b> and also the linguistic researchers who are working
          for the protection of the language. The visual representation would
          allow Blackfoot teachers and learners to understand how their
          pronunciation compares to that of native speakers. Additionally, it
          would help linguistics researchers in their efforts to document and
          transcribe audio clips of endangered languages.
        </p>
        <div className="Acknowledgements">
          <h6>ACKNOWLEDGMENTS:</h6>
          <li>Earl Old Person (amsskapipiikani): EOP</li>
          <li>Rod Scout (siksiká): RS</li>
          <li>Natalie Creighton (Kainai): NC</li>
        </div>
        {/* TODO: Add citation for MeTILDA */}
      </div>
    )
  }
}

const authCondition = (authUser: any) => !!authUser
export default withAuthorization(authCondition)(Home as any)
