import React, {Component} from 'react';

export interface AudioLetterProps {
  isSelected?: boolean;
  isWordSep?: boolean;
  index?: number;
  leftX?: number;
  rightX?: number;
  letter?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

class AudioLetter extends Component<AudioLetterProps> {
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
      <div id={(this.props.index).toString()} className={"metilda-transcribe-letter" + extraClass}
           onClick={this.props.onClick}
           style={{left: leftX, width: rightX - leftX}}>
          <p>{letter}</p>
      </div>
    );
  }
} 

export default AudioLetter;