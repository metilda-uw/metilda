import * as React from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import PitchArtContainer from "../PitchArtWizard/PitchArtViewer/PitchArtContainer";
import {AppState} from "../store";
import {setLetterPitch} from "../store/audio/actions";
import {AudioAction} from "../store/audio/types";
import {Speaker} from "../types/types";
import AudioAnalysis from "./AudioAnalysis";
import "./CreatePitchArt.css";

export interface CreatePitchArtProps {
    speakers: Speaker[];
    setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) => void;
}

export class CreatePitchArt extends React.Component<CreatePitchArtProps> {
    renderSpeakers = () => {
        return (
            this.props.speakers.map((item, index) =>
                <AudioAnalysis speakerIndex={index} key={`audio-analysis-${index}-${item.uploadId}`}/>
            )
        );
    }

    formatFileName = (uploadId: string): string => {
        const splitIndex = uploadId.lastIndexOf(".");

        if (splitIndex !== -1) {
            return uploadId.slice(0, splitIndex);
        }

        return uploadId;
    }

    render() {
        const uploadId = this.props.speakers.map((item) => this.formatFileName(item.uploadId)).join("_");

        return (
            <div className="CreatePitchArt">
                <div className="metilda-page-content">
                    {this.renderSpeakers()}
                    <div className="row">
                        <PitchArtContainer
                            speakers={this.props.speakers}
                            width={AudioAnalysis.AUDIO_IMG_WIDTH}
                            height={500}
                            setLetterPitch={this.props.setLetterPitch}
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

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, void, AudioAction>) => ({
    setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) =>
        dispatch(setLetterPitch(speakerIndex, letterIndex, newPitch)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreatePitchArt);
