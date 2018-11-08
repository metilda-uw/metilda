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
        <div className="metilda-audio-analysis">
            <div>
                <div>
                      <AudioImg uploadId={uploadId}
                                ref="audioImage"
                                graphStartX={320.0}
                                graphEndX={2306.0}
                                letterIntervalSelected={this.letterIntervalSelected} />
                </div>
                <div className="metilda-transcribe-container">
                    <div className="metilda-transcribe-container-col metilda-transcribe-letter-container-label">
                        <span>Letters</span>
                    </div>
                    <div id="metilda-transcribe-letter-container"
                         className="metilda-transcribe-container-col">
                        {
                            this.state.letters.map(function(item, index) {
                                return <AudioLetter key={index}
                                                    letter={item.letter}
                                                    leftX={item.leftX}
                                                    rightX={item.rightX}/>
                            })
                        }
                    </div>
                    <div className="metilda-transcribe-container-col metilda-transcribe-letter-container-end"></div>
                </div>
            </div>
            <div className="right-align">
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