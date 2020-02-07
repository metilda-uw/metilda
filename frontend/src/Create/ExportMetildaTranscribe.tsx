import * as React from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import "../PitchArtWizard/GlobalStyling.css";
import {AppState} from "../store/index";
import {Speaker, Letter} from "../types/types";
import {AudioAction} from "../store/audio/types";
import {setLatestAnalysisId} from "../store/audio/actions";
import "./CreatePitchArt.css";
import "./ExportMetildaTranscribe.css";

export interface ExportMetildaTranscribeProps {
    speakers: Speaker[];
    speakerIndex: number;
    firebase: any;
    setLatestAnalysisId: (speakerIndex: number, latestAnalysisId: number,
                          latestAnalysisName: string, lastUploadedLetters: Letter[]) => void;
}

export class ExportMetildaTranscribe extends React.Component<ExportMetildaTranscribeProps> {

isDisabled = () => {
        const speaker = this.props.speakers[this.props.speakerIndex];
        if (speaker.letters.length === 0) {
            return true;
        }

        const nonWordSep = speaker.letters.filter(
            (item) => !item.isWordSep);

        if (nonWordSep.some((item) => item.syllable === "X")) {
            return false;
        }
    }

render() {
        return (
            <div className="ExportMetildaTranscribe">
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    speakers: state.audio.speakers
});

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, void, AudioAction>) => ({
    setLatestAnalysisId: (speakerIndex: number, latestAnalysisId: number, latestAnalysisName: string,
                          lastUploadedLetters: Letter[]) => dispatch(setLatestAnalysisId(speakerIndex, latestAnalysisId,
                            latestAnalysisName, lastUploadedLetters))
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportMetildaTranscribe);
