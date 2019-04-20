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
}

class ExportMetildaTranscribe extends React.Component<Props> {
    exportToJson = () => {
        const speaker = this.props.speakers[this.props.speakerIndex];
        const metildaWord = {
            uploadId: speaker.uploadId,
            letters: speaker.letters
        } as MetildaWord;
        const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
        fileDownload(JSON.stringify(metildaWord, null, 2), `Metilda_Transcribe_${timeStamp}.json`);
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
            <button className="waves-effect waves-light btn"
                    disabled={this.isDisabled()}
                    onClick={this.exportToJson}>
                Save
            </button>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    speakers: state.audio.speakers
});

export default connect(mapStateToProps)(ExportMetildaTranscribe);
