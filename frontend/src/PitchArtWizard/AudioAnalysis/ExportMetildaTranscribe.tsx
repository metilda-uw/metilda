import fileDownload from "js-file-download";
import moment from "moment";
import * as React from "react";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router-dom";
import {AppState} from "../../store";
import {Letter} from "../../types/types";
import "../CreatePitchArt.css";
import "../GlobalStyling.css";
import {MetildaWord} from "../learn/types";
import "./ExportMetildaTranscribe.css";

interface Props extends RouteComponentProps {
    speakers: Letter[][];
    word: string;
}

class ExportMetildaTranscribe extends React.Component<Props> {
    state = {};

    exportToJson = () => {
        const metildaWord = {uploadId: this.props.word, letters: this.props.speakers[0]} as MetildaWord;
        const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
        fileDownload(JSON.stringify(metildaWord, null, 2), `Metilda_Transcribe_${timeStamp}.json`);
    }

    isDisabled = () => {
        if (this.props.speakers.length !== 1) {
            return true;
        }

        const nonWordSep = this.props.speakers[0].filter((item) => !item.isWordSep);

        if (nonWordSep.some((item) => item.syllable === "X")) {
            return true;
        }
    }

    render() {
        return (
            <div className="metilda-audio-analysis-controls-list-item col s12">
                <label className="group-label">Export</label>
                <br/>
                <div className="metilda-export-btns">
                    <button className="waves-effect waves-light btn"
                            disabled={this.isDisabled()}
                            onClick={this.exportToJson}>To JSON
                    </button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    speakers: state.audio.speakers
});

export default connect(mapStateToProps)(ExportMetildaTranscribe);
