import * as React from "react";
import FileReaderInput, {Result} from "react-file-reader-input";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router-dom";
import {ThunkDispatch} from "redux-thunk";
import "../PitchArtWizard/GlobalStyling.css";
import {setLetterPitch, setSpeaker} from "../store/audio/actions";
import {AudioAction} from "../store/audio/types";
import {AppState} from "../store/index";
import {Speaker} from "../types/types";
import "./CreatePitchArt.css";
import "./ImportMetildaTranscribe.css";

interface Props extends RouteComponentProps {
    speakerIndex: number;
    setSpeaker: (speakerIndex: number, speaker: Speaker) => void;
}

class ImportMetildaTranscribe extends React.Component<Props> {
    fileSelected = (event: React.SyntheticEvent<any>, results: Result[]) => {
        if (results.length === 1) {
            const file: File = results[0][1];
            const reader = new FileReader();
            reader.addEventListener("loadend", () => {
                const speakerString = JSON.parse(reader.result as string);
                const speaker: Speaker = speakerString as Speaker;
                this.props.setSpeaker(this.props.speakerIndex, speaker);
            });
            reader.readAsText(file);
        }
    }

    render() {
        return (
            <div className="metilda-audio-analysis-controls-list-item col s12">
                <label className="group-label">Import</label>
                <div className="metilda-audio-analysis-controls-list-item-row">
                    <FileReaderInput as="binary" onChange={this.fileSelected}>
                        <button className="waves-effect waves-light btn">
                            From JSON
                        </button>
                    </FileReaderInput>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    speakers: state.audio.speakers
});

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, void, AudioAction>) => ({
    setSpeaker: (speakerIndex: number, speaker: Speaker) => dispatch(setSpeaker(speakerIndex, speaker))
});

export default connect(mapStateToProps, mapDispatchToProps)(ImportMetildaTranscribe);
