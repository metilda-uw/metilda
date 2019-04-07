import * as React from "react";
import {connect} from "react-redux";
import PitchArtContainer from "../PitchArtWizard/PitchArtViewer/PitchArtContainer";
import {AppState} from "../store";
import {Letter} from "../types/types";
import AudioAnalysis from "./AudioAnalysis";

interface Props {
    speakers: Letter[][];
}

class CreatePitchArt extends React.Component<Props> {
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
                    <AudioAnalysis speakerIndex={0} />
                    <AudioAnalysis speakerIndex={0} />
                    <div className="row">
                        <PitchArtContainer
                            letters={this.props.speakers}
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
