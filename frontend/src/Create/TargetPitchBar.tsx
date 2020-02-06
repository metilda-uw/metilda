import React, {Component} from "react";
import {connect} from "react-redux";
import moment from "moment";
import {ThunkDispatch} from "redux-thunk";
import {AppState} from "../store";
import {removeLetter, resetLetters, setLetterSyllable, setLatestAnalysisId, setSpeaker} from "../store/audio/actions";
import {AudioAction} from "../store/audio/types";
import {Letter, Speaker} from "../types/types";
import AudioLetter from "./AudioLetter";
import fileDownload from "js-file-download";
import FileReaderInput, {Result} from "react-file-reader-input";
import {uploadAnalysis, updateAnalysis, importSpeakerFile} from "./ImportUtils";
import {SyntheticEvent} from "react";
import ReactGA from "react-ga";

export interface TargetPitchBarProps {
    letters: any;
    speakers: Speaker[];
    speakerIndex: number;
    minAudioTime: number;
    maxAudioTime: number;
    minAudioX: number;
    maxAudioX: number;
    firebase: any;
    targetPitchSelected: (letterIndex: number) => void;
    removeLetter: (speakerIndex: number, index: number) => void;
    resetLetters: (speakerIndex: number) => void;
    setLetterSyllable: (speakerIndex: number, index: number, syllable: string) => void;
    setLatestAnalysisId: (speakerIndex: number, latestAnalysisId: number,
                          latestAnalysisName: string, lastUploadedLetters: Letter[]) => void;
    setSpeaker: (speakerIndex: number, speaker: Speaker) => void;
}

interface State {
    selectedIndex: number;
}

interface PitchBarLetter extends Letter {
    isShown: boolean;
    leftX: number;
    rightX: number;
}

export class TargetPitchBar extends Component<TargetPitchBarProps, State> {
    constructor(props: TargetPitchBarProps) {
        super(props);
        this.state = {
            selectedIndex: -1
        };
        this.timeCoordToImageCoord = this.timeCoordToImageCoord.bind(this);
        this.targetPitchSelected = this.targetPitchSelected.bind(this);
        this.scaleIntervals = this.scaleIntervals.bind(this);
        this.removeLetterEvent = this.removeLetterEvent.bind(this);
        this.resetAllLettersEvent = this.resetAllLettersEvent.bind(this);
        this.setLetterSyllableEvent = this.setLetterSyllableEvent.bind(this);
    }

    resetAllLettersEvent() {
        this.props.resetLetters(this.props.speakerIndex);
    }

    timeCoordToImageCoord(t: number) {
        // clip times that lie beyond the image boundaries
        if (t < this.props.minAudioTime) {
            return 0;
        } else if (t > this.props.maxAudioTime) {
            return this.props.maxAudioX - this.props.minAudioX;
        }

        const dt = this.props.maxAudioTime - this.props.minAudioTime;
        const u0 = (t - this.props.minAudioTime) / dt;

        const dx = this.props.maxAudioX - this.props.minAudioX;
        const x0 = u0 * dx;

        return x0;
    }

    scaleIntervals(): PitchBarLetter[] {
        // Scale letter intervals to be within the range [0, 1], where
        // 0 is the left side of the selection interval and 1 is the right
        // side of the selection interval.
        const controller = this;
        const intervalsInSelection: PitchBarLetter[] = this.props.speakers[this.props.speakerIndex].letters.map(
            function(item: Letter) {
                const pitchBarLetter: PitchBarLetter = Object.assign(
                    {leftX: -1, rightX: -1, isShown: false}, item
                );
                const tooFarLeft = pitchBarLetter.t1 < controller.props.minAudioTime;
                const tooFarRight = pitchBarLetter.t0 > controller.props.maxAudioTime;
                pitchBarLetter.isShown = !(tooFarLeft || tooFarRight);
                return pitchBarLetter;
            });

        // Since the letters are relatively positioned, we need to decrement
        // their positions based on all previous letters' widths.
        let prevLetterWidths = 0.0;
        return intervalsInSelection.map(function(item) {
            if (!item.isShown) {
                return item;
            }

            const itemCopy = Object.assign({}, item);
            itemCopy.leftX = controller.timeCoordToImageCoord(itemCopy.t0) - prevLetterWidths;
            itemCopy.rightX = controller.timeCoordToImageCoord(itemCopy.t1) - prevLetterWidths;

            prevLetterWidths += itemCopy.rightX - itemCopy.leftX;

            // transform letter interval into new time scale
            // clip boundaries to prevent overflow
            return itemCopy;
        });
    }

    targetPitchSelected(letterIndex: number) {
        this.setState({selectedIndex: letterIndex});
        this.props.targetPitchSelected(letterIndex);
    }

    removeLetterEvent() {
        this.props.removeLetter(this.props.speakerIndex, this.state.selectedIndex);
        this.setState({selectedIndex: -1});
        this.props.targetPitchSelected(-1);
    }

    setLetterSyllableEvent() {
        let isValidInput = false;
        let syllable = "";

        while (!isValidInput) {
            const response = prompt("Enter syllable text", "X");

            if (response == null) {
                // user canceled input
                return;
            }

            syllable = response.trim();
            if (syllable.length === 0) {
                alert("Syllable should contain at least one character");
            } else {
                isValidInput = true;
            }
        }

        this.props.setLetterSyllable(this.props.speakerIndex, this.state.selectedIndex, syllable);
        this.setState({selectedIndex: -1});
        this.props.targetPitchSelected(-1);
    }

    downloadAnalysis = () => {
        const speaker = this.props.speakers[this.props.speakerIndex];
        const metildaWord = {
            uploadId: speaker.uploadId,
            letters: speaker.letters
        } as Speaker;
        const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
        const fileName = `Speaker${this.props.speakerIndex + 1}_${timeStamp}.json`;
        fileDownload(JSON.stringify(metildaWord, null, 2), fileName);
    }

    saveAnalysis = async () => {
        ReactGA.event({
            category: "Save Analysis",
            action: "User pressed Save Analysis button"
          });
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
                        this.deletePreviousAnalysis(speaker.latestAnalysisId);
                        const data = await updateAnalysis(metildaWord, speaker.latestAnalysisName,
                            speaker.latestAnalysisId, this.props.firebase);
                        this.props.setLatestAnalysisId(this.props.speakerIndex, speaker.latestAnalysisId,
                            speaker.latestAnalysisName, speaker.letters);
                    } else {
                       this.uploadAnalysis(isValidInput, metildaWord, speaker);
                    }
                }
        } else {
            this.uploadAnalysis(isValidInput, metildaWord, speaker);
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

    uploadAnalysis = async (isValidInput: boolean, metildaWord: Speaker, speaker: Speaker) => {
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
       const data = await uploadAnalysis(metildaWord, speaker.fileIndex, fileName, this.props.firebase);
       this.props.setLatestAnalysisId(this.props.speakerIndex, data,
           fileName, speaker.letters);
       } else {
       alert("Analysis not uploaded. Analysis name is missing");
       }
    }
    fileSelected = (event: React.ChangeEvent<HTMLInputElement>, results: Result[]) => {
        importSpeakerFile(results, this.props.speakerIndex, this.props.setSpeaker);
    }
    checkIfSpeakerImportIsOk = (event: SyntheticEvent) => {
        if (this.props.speakers[this.props.speakerIndex].letters.length === 0) {
            return;
        }

        const isOk: boolean = confirm(
            "The current speaker will be reset.\n\n" +
            "Do you want to continue?"
        );

        if (!isOk) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    render() {
        const controller = this;
        const letters = this.scaleIntervals();
        const speaker = this.props.speakers[this.props.speakerIndex];
        return (
            <div className="TargetPitchBar">
                <div className="metilda-control-container metilda-target-pitch-bar">
                    <div className="metilda-audio-analysis-image-col-1">
                        <span>Target Pitch</span>
                    </div>
                    <div className="metilda-audio-analysis-image-col-2 metilda-audio-analysis-letter-container">
                        {
                            letters.map(function(item, index) {
                                if (!item.isShown) {
                                    return;
                                }

                                return <AudioLetter key={index}
                                                    letter={item.syllable}
                                                    leftX={item.leftX}
                                                    rightX={item.rightX}
                                                    isSelected={index === controller.state.selectedIndex}
                                                    isWordSep={item.isWordSep}
                                                    onClick={() => controller.targetPitchSelected(index)}/>;
                            })
                        }
                    </div>
                </div>
                <div className="TargetPitchBarElements">
                    <button className="TargetPitchBar-set-syllable btn waves-effect waves-light m-r-16"
                            type="submit"
                            name="action"
                            disabled={this.state.selectedIndex === -1}
                            onClick={this.setLetterSyllableEvent}>
                        Set Syllable
                    </button>
                    <button className="TargetPitchBar-remove-letter btn waves-effect waves-light m-r-16"
                            type="submit"
                            name="action"
                            disabled={this.state.selectedIndex === -1}
                            onClick={this.removeLetterEvent}>
                        Remove
                    </button>
                    <button className="TargetPitchBar-clear-letter btn waves-effect waves-light m-r-16"
                            type="submit"
                            name="action"
                            disabled={speaker.letters.length === 0}
                            onClick={this.resetAllLettersEvent}>
                        Clear
                    </button>
                    <button onClick={this.checkIfSpeakerImportIsOk}
                            className="TargetPitchBar-open-analysis btn waves-effect waves-light m-r-16">
                        <FileReaderInput as="binary" onChange={this.fileSelected}>
                            Open
                        </FileReaderInput>
                    </button>
                    <button className="TargetPitchBar-save-analysis btn waves-effect waves-light m-r-16"
                            type="submit"
                            name="action"
                            disabled={speaker.letters.length === 0}
                            onClick={this.saveAnalysis}>
                        Save
                    </button>
                    <button className="TargetPitchBar-download-analysis btn waves-effect waves-light"
                            type="submit"
                            name="action"
                            disabled={speaker.letters.length === 0}
                            onClick={this.downloadAnalysis}>
                        Download
                    </button>
                </div>
            </div>

        );
    }
}

const mapStateToProps = (state: AppState) => ({
    speakers: state.audio.speakers
});

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, void, AudioAction>) => ({
    removeLetter: (speakerIndex: number, index: number) => dispatch(removeLetter(speakerIndex, index)),
    resetLetters: (speakerIndex: number) => dispatch(resetLetters(speakerIndex)),
    setLetterSyllable: (speakerIndex: number, index: number, syllable: string) =>
        dispatch(setLetterSyllable(speakerIndex, index, syllable)),
    setLatestAnalysisId: (speakerIndex: number, latestAnalysisId: number, latestAnalysisName: string,
                          lastUploadedLetters: Letter[]) => dispatch(setLatestAnalysisId(speakerIndex, latestAnalysisId,
                            latestAnalysisName, lastUploadedLetters)),
     setSpeaker: (speakerIndex: number, speaker: Speaker) => dispatch(setSpeaker(speakerIndex, speaker))
});

export default connect(mapStateToProps, mapDispatchToProps)(TargetPitchBar);
