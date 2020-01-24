import React, {Component} from 'react';

class AudioLetter extends Component {
  state = {};

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