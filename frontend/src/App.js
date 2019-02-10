import React, {Component} from 'react';
import Header from './Layout/Header.js';
import UploadAudio from "./PitchArtWizard/UploadAudio";
import {Route} from "react-router-dom";
import TranscribeAudio from "./PitchArtWizard/TranscribeAudio";
import 'materialize-css/dist/css/materialize.min.css';

class App extends Component {
  state = {};

  render() {
    return (
      <div className="App">
        <Header />
        <Route path="/:uploadId?" component={TranscribeAudio} />
      </div>
    );
  }
}

export default App;
