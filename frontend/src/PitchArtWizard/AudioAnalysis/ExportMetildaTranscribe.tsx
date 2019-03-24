import * as React from 'react';
import '../TranscribeAudio.css';
import "../GlobalStyling.css";
import "./ExportMetildaTranscribe.css";
import {Redirect, RouteComponentProps} from "react-router-dom";
import {AppState} from "../../store";
import {connect} from "react-redux";
import fileDownload from "js-file-download";
import {MetildaWord} from "../learn/types";
import {Letter} from "../../types/types";
import moment from 'moment';

interface Props extends RouteComponentProps {
    letters: Array<Letter>,
    word: string,
    disabled: boolean
}

class ExportMetildaTranscribe extends React.Component<Props> {
    state = {};

    exportToJson = () => {
        let metildaWord = {uploadId : this.props.word, letters: this.props.letters} as MetildaWord;
        let timeStamp = moment().format('MM-DD-YYYY_hh_mm_ss');
        fileDownload(JSON.stringify(metildaWord, null, 2), `Metilda_Transcribe_${timeStamp}.json`);
    };

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