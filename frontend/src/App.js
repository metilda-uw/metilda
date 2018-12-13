import React, {Component} from 'react';
import Header from './Layout/Header.js';
import UploadAudio from "./PitchArtWizard/UploadAudio";
import {Route} from "react-router-dom";
import TranscribeAudio from "./PitchArtWizard/TranscribeAudio";
import ReviewPitchArt from "./PitchArtWizard/ReviewPitchArt";

class App extends Component {
  state = {};

  render() {
    return (
      <div className="App">
        <Header />
        <Route exact path="/" component={UploadAudio} />
        <Route path="/pitchartwizard/2/:uploadId" component={TranscribeAudio} />
      </div>
    );
  }
}

export default App;
