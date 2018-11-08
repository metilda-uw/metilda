import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import styles from "./TranscribeAudio.css";

class AudioLetter extends Component {
  state = {};

  constructor(props) {
      super(props);
  }

  render() {
    const {letter, leftX, rightX} = this.props;

    return (
      <div className="metilda-transcribe-letter"
           style={{left: leftX + 28, width: rightX - leftX}}>
          <p>{letter}</p>
      </div>
    );
  }
}

export default AudioLetter;