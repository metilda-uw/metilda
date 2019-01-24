import React, {Component} from 'react';
import PitchArtDrawingWindow from "../PitchArtDrawingWindow";
import PitchArt from "../PitchArt";
import TranscribeAudio from "../TranscribeAudio";

class PitchArtContainer extends Component {
    render() {
        let timesAndPitches = this.props.letters.map(item => [item.t0, item.pitch]);
        let sortedTimesAndPitches = timesAndPitches.sort((a, b) => a[0] - b[0]);
        let sortedPitches = sortedTimesAndPitches.map(item => item[1]);
        let sortedTimes = sortedTimesAndPitches.map(item => item[0] * this.props.soundLength);

        return (
            <div>
                <PitchArtDrawingWindow
                    width={this.props.width}
                    height={this.props.height}
                    key={this.props.letterEditVersion}
                    minVertPitch={this.props.minVertPitch}
                    maxVertPitch={this.props.maxVertPitch}
                    uploadId={this.props.uploadId}
                    pitches={sortedPitches}
                    times={sortedTimes}/>
                <PitchArt width={this.props.width}
                          height={this.props.height}
                          key={this.props.letterEditVersion + 1}
                          minVertPitch={this.props.minVertPitch}
                          maxVertPitch={this.props.maxVertPitch}
                          uploadId={this.props.uploadId}
                          pitches={sortedPitches}
                          times={sortedTimes}/>
            </div>
        )
    }
}

export default PitchArtContainer;