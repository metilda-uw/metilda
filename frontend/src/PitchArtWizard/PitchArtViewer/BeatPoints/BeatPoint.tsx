import * as React from "react";
import {Letter, Speaker} from "../../../types/types";
import BeatPointDrawingWindow from "./BeatPointDrawingWindow";
import AudioAnalysis from "../../../Create/AudioAnalysis";



interface Props {
    speakers: Speaker[];
    width: number;
    height: number;
    minPitch: number;
    maxPitch: number;
    showPitchArtImageColor: boolean;
}

class BeatPoint extends React.Component<Props> {
        constructor(props: Props) {
        super(props);
    }

    renderBeatPointWindow = (speaker: Speaker, speakerIndex: number) => {
        return (
            <div>
                <BeatPointDrawingWindow 
                    speaker={speaker}
                    index={speakerIndex}
                    width={this.props.width}
                    height={this.props.height}
                    minPitch={this.props.minPitch}
                    maxPitch={this.props.maxPitch}
                    showPitchArtImageColor={this.props.showPitchArtImageColor}
                />
            </div>
        );
    }

    // for each speaker in the Audio Analysis render a BeatPointWindow Component
    // The Beat Point window will render the syllables as circles and allow the user to move them on the timeline.
    render() {
        return (
            <div>
            {
                this.props.speakers.slice(0, 2).map(
                    (item, speakerIndex) => this.renderBeatPointWindow(item, speakerIndex)
                )
            }
            </div>
        );       
    }

}

export default BeatPoint;