import React, {Component} from 'react';
import Header from './Layout/Header.js';
import UploadAudio from "./PitchArtWizard/UploadAudio";
import {Route} from "react-router-dom";
import TranscribeAudio from "./PitchArtWizard/TranscribeAudio";

class App extends Component {
  state = {};

  componentDidMount() {

  }

  render() {
    return (
      <div className="App">
        <Header />
        <Route exact path="/pitchartwizard/1" component={UploadAudio} />
          <Route path="/pitchartwizard/2/:uploadId" component={TranscribeAudio} />
      </div>
    );
  }
}

export default App;
