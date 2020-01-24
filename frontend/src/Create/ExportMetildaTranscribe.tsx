import fileDownload from "js-file-download";
import * as React from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import "../PitchArtWizard/GlobalStyling.css";
import {AppState} from "../store/index";
import {Speaker, Letter} from "../types/types";
import {uploadAnalysis, updateAnalysis} from "./ImportUtils";
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
    exportToJson = async () => {
        const speaker = this.props.speakers[this.props.speakerIndex];
        const metildaWord = {
            uploadId: speaker.uploadId,
            letters: speaker.letters
        } as Speaker;
        const isValidInput = false;
        if (speaker.latestAnalysisId !== null && speaker.latestAnalysisId !== undefined &&
            speaker.latestAnalysisName != null ) {
                if (JSON.stringify(speaker.letters) === JSON.stringify(speaker.lastUploadedLetters)) {
                    alert(`Analysis already saved`);
                } else {
                    const confirmMsg = `Do you want to save this to the existing analysis "${speaker.latestAnalysisName}"?`;
                    const isOk: boolean = confirm(confirmMsg);
                    if (isOk) {
                        // fileDownload(JSON.stringify(metildaWord, null, 2), speaker.latestAnalysisName);
                        this.deletePreviousAnalysis(speaker.latestAnalysisId);
                        const data = await updateAnalysis(metildaWord, speaker.latestAnalysisName,
                            speaker.latestAnalysisId, this.props.firebase);
                        this.props.setLatestAnalysisId(this.props.speakerIndex, speaker.latestAnalysisId,
                            speaker.latestAnalysisName, speaker.letters);
                    } else {
                       this.saveAnalysis(isValidInput, metildaWord, speaker);
                    }
                }
        } else {
            this.saveAnalysis(isValidInput, metildaWord, speaker);
        }
    }

    deletePreviousAnalysis = (analysisId: number) => {
        fetch(`api/get-analysis-file-path/${analysisId.toString()}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }})
        .then((response) => response.json())
        .then((data) => {
            const storageRef = this.props.firebase.uploadFile();
            const fileRef = storageRef.child(data.result[0]);
            // Delete the file
            fileRef.delete().then(function() {
            // File deleted successfully!
             });
        });
    }

    saveAnalysis = async (isValidInput: boolean, metildaWord: Speaker, speaker: Speaker) => {
        let fileName;
        let updatedFileName;
        while (!isValidInput) {
            fileName = prompt("Enter new analysis name", "Ex: Analysis1.json");
            if (fileName == null) {
               // user canceled input
                break;
           }
            updatedFileName = fileName.trim();
            if (updatedFileName.length === 0) {
               alert("Analyis name should contain at least one character");
           } else {
               isValidInput = true;
           }
       }
        if (isValidInput && fileName !== null && fileName !== undefined) {
       // fileDownload(JSON.stringify(metildaWord, null, 2), fileName);
       const data = await uploadAnalysis(metildaWord, speaker.fileIndex, fileName, this.props.firebase);
       this.props.setLatestAnalysisId(this.props.speakerIndex, data,
           fileName, speaker.letters);
       } else {
       alert("Analysis not uploaded. Analysis name is missing");
       }
    }

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
                {/* <button className="ExportMetildaTranscribe-save waves-effect waves-light btn"
                        disabled={this.isDisabled()}
                        onClick={this.exportToJson}>
                    Save analysis
                </button> */}
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
