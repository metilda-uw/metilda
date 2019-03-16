import * as React from 'react';
import Header from './Layout/Header.js';
import UploadAudio from "./PitchArtWizard/UploadAudio";
import {Route} from "react-router-dom";
import TranscribeAudio from "./PitchArtWizard/TranscribeAudio";
import 'materialize-css/dist/css/materialize.min.css';

export interface Props {}
interface State {}

class App extends React.Component<Props, State> {
  state = {};

  render() {
    return (
      <div className="App">
        <Header />
        <Route path="/pitchartwizard/:uploadId?" component={TranscribeAudio} />
      </div>
    );
  }
}

export default App;
