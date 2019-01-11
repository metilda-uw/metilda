import React, {Component} from 'react';
import AudioLetter from "./AudioLetter";

class TargetPitchBar extends Component {
    state = {};

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div>
                <div className="metilda-control-container">
                    <div className="metilda-audio-analysis-image-col-1">
                        <span>Target Pitch</span>
                    </div>
                    <div className="metilda-audio-analysis-image-col-2">
                        {
                            this.props.letters.map(function (item, index) {
                                return <AudioLetter key={index}
                                                    letter={item.letter}
                                                    leftX={item.leftX}
                                                    rightX={item.rightX}/>
                            })
                        }
                    </div>
                    <div className="metilda-audio-analysis-image-col-3">
                    </div>
                </div>
                <div className="right-align">
                    <button className="btn waves-effect waves-light m-r-16"
                            type="submit"
                            name="action"
                            disabled={this.props.totalLetterCount === 0}
                            onClick={this.removePrevious}>
                        Remove Previous
                    </button>
                    <button className="btn waves-effect waves-light"
                            type="submit"
                            name="action"
                            disabled={this.props.totalLetterCount === 0}
                            onClick={this.resetClicked}>
                        Reset
                    </button>
                    {/*<button className="btn waves-effect waves-light"*/}
                    {/*type="submit"*/}
                    {/*name="action"*/}
                    {/*onClick={this.nextClicked}>*/}
                    {/*Next*/}
                    {/*</button>*/}
                </div>
            </div>

        );
    }
}

export default TargetPitchBar;