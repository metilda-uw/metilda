import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import './UploadAudio.css';
import styles from "./TranscribeAudio.css";
import AudioImg from "./AudioImg";
import AudioLetter from "./AudioLetter";

class TranscribeAudio extends Component {
  state = {};

  constructor(props) {
      super(props);
      this.state = {letters: []};
      this.letterIntervalSelected = this.letterIntervalSelected.bind(this);
  }

  letterIntervalSelected(leftX, rightX) {
      let letter = prompt("Enter a letter");

      if (letter !== null && letter.trim().length > 0) {
         this.setState(state => state.letters.push(
             {letter: letter, leftX: leftX, rightX: rightX}
         ));
      }
  }

  render() {
    const {uploadId} = this.props.match.params;

    return (
      <div>
        <div className="wizard-header">
            <h3>Pitch Art Wizard</h3>
            <h4>Transcribe Audio (step 2/4)</h4>
        </div>
        <div className="metilda-audio-analysis-form">
            <div className="row">
                <div className="col s12 left-align">
                      <AudioImg uploadId={uploadId}
                                letterIntervalSelected={this.letterIntervalSelected} />

                </div>
                <div id="metilda-transcribe-container" className="col s12">
                    {
                        this.state.letters.map(function(item, index) {
                            return <AudioLetter key={index}
                                                letter={item.letter}
                                                leftX={item.leftX}
                                                rightX={item.rightX}/>
                        })
                    }
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col s4 right-align">
                <button className="btn waves-effect waves-light"
                        type="submit"
                        name="action">
                    Next
                </button>
            </div>
        </div>
      </div>
    );
  }
}

export default TranscribeAudio;