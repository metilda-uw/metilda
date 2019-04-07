import "materialize-css/dist/css/materialize.min.css";
import * as React from "react";
import {Route} from "react-router-dom";
import CreatePitchArt from "./Create/CreatePitchArt";
import Header from "./Layout/Header.js";
import WordSyllableCategories from "./Learn/WordSyllableCategories";
import WordSyllableReview from "./Learn/WordSyllableReview";

class App extends React.Component {
  state = {};

  render() {
    return (
      <div className="App">
        <Header />
        <Route path="/pitchartwizard/:uploadId?" component={CreatePitchArt} />
        <Route exact path="/learn/words/syllables" component={WordSyllableCategories} />
        <Route path="/learn/words/syllables/:numSyllables" component={WordSyllableReview} />
      </div>
    );
  }
}

export default App;
