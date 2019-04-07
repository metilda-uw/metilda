import React, {Component} from 'react';
import styles from "./CreatePitchArt.css";

class AudioLetter extends Component {
  state = {};

  constructor(props) {
      super(props);
  }

  render() {
    const {letter, leftX, rightX} = this.props;
    let extraClass = " ";

    if (this.props.isSelected) {
        extraClass += "selected";
    } else if (this.props.isWordSep) {
        extraClass += "seperator";
    }

    return (
      <div className={"metilda-transcribe-letter" + extraClass}
           onClick={this.props.onClick}
           style={{left: leftX, width: rightX - leftX}}>
          <p>{letter}</p>
      </div>
    );
  }
}

export default AudioLetter;