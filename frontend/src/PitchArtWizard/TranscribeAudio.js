import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import './UploadAudio.css';
import styles from "./TranscribeAudio.css";
import AudioImg from "./AudioImg";
import AudioImgLoading from "./AudioImgLoading";
import AudioLetter from "./AudioLetter";
import {Redirect} from "react-router-dom";


class TranscribeAudio extends Component {
  state = {};

  constructor(props) {
      super(props);
      this.state = {
          letters: [],
          isAudioImageLoaded: false,
          soundLength: -1,
          selectionInterval: "Letter",
          redirectId: null};
      this.imageIntervalSelected = this.imageIntervalSelected.bind(this);
      this.onAudioImageLoaded = this.onAudioImageLoaded.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
      this.nextClicked = this.nextClicked.bind(this);
  }

  componentDidMount() {
    const {uploadId} = this.props.match.params;
    var controller = this;
    fetch("/api/sound-length/" + uploadId, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: {uploadId: uploadId}})
    .then(response => response.json())
    .then(function(data) {
        controller.setState({soundLength: data["sound_length"]});
    });
  }

  imageIntervalSelected(leftX, rightX, minTimePerc, maxTimePerc) {
      let letter = prompt("Enter a letter");

      if (letter !== null && letter.trim().length > 0) {
         let t0 = minTimePerc * this.state.soundLength;
         let t1 = maxTimePerc * this.state.soundLength;
         const controller = this;
         const {uploadId} = this.props.match.params;
         let json = {
           "time_ranges": [[t0, t1]]
         };

         fetch("/api/max-pitches/" + uploadId, {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)})
        .then(response => response.json())
        .then(function(data) {
            controller.setState(state => state.letters.push(
              {letter: letter,
               leftX: leftX,
               rightX: rightX,
               t0: t0,
               t1: t1,
               pitch: data[0]}
            ));
        });
      }
  }

  nextClicked() {
      const {uploadId} = this.props.match.params;
      this.setState({redirectId: uploadId});
  }

  onAudioImageLoaded() {
      this.setState({isAudioImageLoaded: true});
  }

  handleInputChange(event) {
    const target = event.target;

    let value = null;
    if (target.type === "checkbox") {
        value = target.checked;
    } else if (target.type === "file") {
        value = target.files[0];
    } else {
        value = target.value;
    }

    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  render() {
    if (this.state.redirectId !== null) {
      let pitchesString = this.state.letters.map(item => "p=" + item.pitch).join("&");
      return <Redirect push to={"/pitchartwizard/4/" + this.state.redirectId + "?" + pitchesString } />
    }

    const {uploadId} = this.props.match.params;

    let audioImageLoading;
    if (!this.state.isAudioImageLoaded) {
        audioImageLoading = <AudioImgLoading />
    }

    return (
      <div>
        <div className="wizard-header">
            <h3>Pitch Art Wizard</h3>
            <h4>Transcribe Audio (step 2/3)</h4>
        </div>
        <div className="metilda-audio-analysis">
            <div>
                <div className="metilda-audio-analysis-image-container">
                    {audioImageLoading}
                      <AudioImg uploadId={uploadId}
                                ref="audioImage"
                                xminPerc={320.0 / 2560.0}
                                xmaxPerc={2306.0 / 2560.0}
                                imageIntervalSelected={this.imageIntervalSelected}
                                onAudioImageLoaded={this.onAudioImageLoaded}/>
                </div>
                {/*<div className="switch metilda-audio-analysis-input">*/}
                    {/*<span className="metilda-checkbox-label">Selection Interval</span>*/}
                    {/*<label>*/}
                        {/*Sound*/}
                        {/*<input name="imageSelection"*/}
                               {/*type="checkbox"*/}
                               {/*onChange={this.handleInputChange}*/}
                               {/*checked={this.state.selectionInterval === "Letter" ? "checked": ""}/>*/}
                        {/*<span className="lever"></span>*/}
                        {/*Letter*/}
                    {/*</label>*/}
                {/*</div>*/}
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
                        name="action"
                        onClick={this.nextClicked}>
                    Next
                </button>
            </div>
        </div>
      </div>
    );
  }
}

export default TranscribeAudio;