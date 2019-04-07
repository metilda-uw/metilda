import * as React from "react";
import {connect} from "react-redux";
import PitchArtContainer from "../PitchArtWizard/PitchArtViewer/PitchArtContainer";
import {AppState} from "../store";
import {Letter, Speaker} from "../types/types";
import AudioAnalysis from "./AudioAnalysis";

interface Props {
    speakers: Speaker[];
}

class CreatePitchArt extends React.Component<Props> {
    renderSpeakers = () => {
        return (
            this.props.speakers.map((item, index) =>
               <AudioAnalysis speakerIndex={index} key={`audio-analysis-${index}-${item.uploadId}`} />
            )
        );
    }

    render() {
        // TODO: determine these new values
        const uploadId = "";
        const minPitch = 30;
        const maxPitch = 300;
        const manualPitchChange = (x: number, y: number) => 2;

        return (
            <div>
                <div className="metilda-page-header">
                    <h5>Transcribe Audio</h5>
                </div>
                <div className="metilda-page-content">
                    {this.renderSpeakers()}
                    <div className="row">
                        <PitchArtContainer
                            speakers={this.props.speakers}
                            width={AudioAnalysis.AUDIO_IMG_WIDTH}
                            height={600}
                            minPitch={minPitch}
                            maxPitch={maxPitch}
                            manualPitchChange={manualPitchChange}
                            uploadId={uploadId}/>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    speakers: state.audio.speakers,
});

export default connect(mapStateToProps)(CreatePitchArt);
