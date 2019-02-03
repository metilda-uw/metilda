import React, {Component} from 'react';
import styles from "./TranscribeAudio.css";

class AudioLetter extends Component {
  state = {};

  constructor(props) {
      super(props);
  }

  render() {
    const {letter, leftX, rightX} = this.props;

    return (
      <div className={"metilda-transcribe-letter" + (this.props.isSelected ? ' selected': '')}
           onClick={this.props.onClick}
           style={{left: leftX, width: rightX - leftX}}>
          <p>{letter}</p>
      </div>
    );
  }
}

export default AudioLetter;