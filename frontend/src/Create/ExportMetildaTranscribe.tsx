import fileDownload from "js-file-download";
import moment from "moment";
import * as React from "react";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router-dom";
import {MetildaWord} from "../Learn/types";
import "../PitchArtWizard/GlobalStyling.css";
import {AppState} from "../store/index";
import {Letter, Speaker} from "../types/types";
import "./CreatePitchArt.css";
import "./ExportMetildaTranscribe.css";

interface Props extends RouteComponentProps {
    speakers: Speaker[];
    speakerIndex: number;
    word: string;
}

class ExportMetildaTranscribe extends React.Component<Props> {
    state = {};

    exportToJson = () => {
        const metildaWord = {
            uploadId: this.props.word,
            letters: this.props.speakers[this.props.speakerIndex].letters
        } as MetildaWord;
        const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
        fileDownload(JSON.stringify(metildaWord, null, 2), `Metilda_Transcribe_${timeStamp}.json`);
    };

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
            <div className="metilda-audio-analysis-controls-list-item col s12">
                <label className="group-label">Export</label>
                <div className="metilda-audio-analysis-controls-list-item-row">
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
