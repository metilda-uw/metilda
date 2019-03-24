import * as React from 'react';
import Header from './Layout/Header.js';
import UploadAudio from "./PitchArtWizard/UploadAudio";
import {Route} from "react-router-dom";
import TranscribeAudio from "./PitchArtWizard/TranscribeAudio";
import 'materialize-css/dist/css/materialize.min.css';
import WordSyllableReview from "./PitchArtWizard/learn/WordSyllableReview";
import WordSyllableCategories from "./PitchArtWizard/learn/WordSyllableCategories";

export interface Props {}
interface State {}

class App extends React.Component<Props, State> {
  state = {};

  render() {
    return (
      <div className="App">
        <Header />
        <Route path="/pitchartwizard/:uploadId?" component={TranscribeAudio} />
        <Route exact path="/learn/words/syllables" component={WordSyllableCategories} />
        <Route path="/learn/words/syllables/:numSyllables" component={WordSyllableReview} />
      </div>
    );
  }
}

export default App;
