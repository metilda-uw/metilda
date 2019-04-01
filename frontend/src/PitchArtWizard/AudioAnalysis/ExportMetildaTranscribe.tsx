import fileDownload from "js-file-download";
import moment from "moment";
import * as React from "react";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router-dom";
import {AppState} from "../../store";
import {Letter} from "../../types/types";
import "../GlobalStyling.css";
import {MetildaWord} from "../learn/types";
import "../TranscribeAudio.css";
import "./ExportMetildaTranscribe.css";

interface Props extends RouteComponentProps {
    letters: Letter[];
    word: string;
    disabled: boolean;
}

class ExportMetildaTranscribe extends React.Component<Props> {
    state = {};

    exportToJson = () => {
        const metildaWord = {uploadId : this.props.word, letters: this.props.letters} as MetildaWord;
        const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
        fileDownload(JSON.stringify(metildaWord, null, 2), `Metilda_Transcribe_${timeStamp}.json`);
    }

    render() {
        return (
            <div className="metilda-audio-analysis-controls-list-item col s12">
                <label className="group-label">Export</label>
                <br/>
                <div className="metilda-export-btns">
                    <button className="waves-effect waves-light btn"
                            disabled={this.props.disabled}
                            onClick={this.exportToJson}>To JSON</button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    letters: state.audio.letters
});

export default connect(mapStateToProps)(ExportMetildaTranscribe);
