import fileDownload from "js-file-download";
import moment from "moment";
import * as React from "react";
import {connect} from "react-redux";
import "../PitchArtWizard/GlobalStyling.css";
import {AppState} from "../store/index";
import {Speaker} from "../types/types";
import "./CreatePitchArt.css";
import "./ExportMetildaTranscribe.css";

export interface ExportMetildaTranscribeProps {
    speakers: Speaker[];
    speakerIndex: number;
}

export class ExportMetildaTranscribe extends React.Component<ExportMetildaTranscribeProps> {
    exportToJson = () => {
        const speaker = this.props.speakers[this.props.speakerIndex];
        const metildaWord = {
            uploadId: speaker.uploadId,
            letters: speaker.letters
        } as Speaker;
        const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
        const fileName = `Speaker${this.props.speakerIndex + 1}_${timeStamp}.json`;
        fileDownload(JSON.stringify(metildaWord, null, 2), fileName);
    }

    isDisabled = () => {
        if (this.props.speakers[this.props.speakerIndex].letters.length === 0) {
            return true;
        }

        const nonWordSep = this.props.speakers[this.props.speakerIndex].letters.filter(
            (item) => !item.isWordSep);

        if (nonWordSep.some((item) => item.syllable === "X")) {
            return true;
        }
    }

    render() {
        return (
            <div className="ExportMetildaTranscribe">
                <button className="ExportMetildaTranscribe-save waves-effect waves-light btn"
                        disabled={this.isDisabled()}
                        onClick={this.exportToJson}>
                    Save
                </button>
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    speakers: state.audio.speakers
});

export default connect(mapStateToProps)(ExportMetildaTranscribe);
