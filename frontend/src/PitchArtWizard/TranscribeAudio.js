import React, {Component} from 'react';
import './UploadAudio.css';
import AudioImg from "./AudioImg";
import AudioImgLoading from "./AudioImgLoading";
import {connect} from "react-redux";
import PlayerBar from "./AudioViewer/PlayerBar";
import PitchRange from "./AudioViewer/PitchRange";
import TargetPitchBar from "./TargetPitchBar";
import PitchArtContainer from "./PitchArtViewer/PitchArtContainer";
import update from 'immutability-helper';
import UploadAudio from "./UploadAudio";
import AudioImgDefault from "./AudioImgDefault";
import {addLetter, audioSelectionAction, setLetterPitch, setLetterSyllable} from "../actions/audioAnalysisActions";
import audioAnalysisReducer from "../reducers/audioAnalysisReducers";


class TranscribeAudio extends Component {
    state = {};

    /**
     * WARNING:
     * MIN_IMAGE_XPERC and MAX_IMAGE_XPERC are statically set based
     * on the audio analysis image returned by the API. If the image
     * content changes, then these values should change.
     *
     * Also, a weird bug popped up once in the imgareaselect library up
     * that resulted in a infinite recursion. Once the dimensions
     * below were altered slightly, the bug went away. Likely it
     * was a result of a weird, undocumented edge case in that library.
     */
    static get MIN_IMAGE_XPERC() {
        return 351.0 / 2800.0;
    }

    static get MAX_IMAGE_XPERC() {
        return 2522.0 / 2800.0;
    }

    static get AUDIO_IMG_WIDTH() {
        return 653;
    }

    static get DEFAULT_MIN_ANALYSIS_PITCH() {
        return 75.0;
    }

    static get DEFAULT_MAX_ANALYSIS_PITCH() {
        return 500.0;
    }

    static get DEFAULT_SYLLABLE_TEXT() {
        return "X";
    }

    static get DEFAULT_SEPARATOR_TEXT() {
        return "";
    }

    constructor(props) {
        super(props);

        const {uploadId} = this.props.match.params;
        this.state = {
            letters: [],
            isAudioImageLoaded: false,
            soundLength: -1,
            selectionInterval: "Letter",
            maxPitch: TranscribeAudio.DEFAULT_MAX_ANALYSIS_PITCH,
            minPitch: TranscribeAudio.DEFAULT_MIN_ANALYSIS_PITCH,
            imageUrl: TranscribeAudio.formatImageUrl(
                uploadId,
                TranscribeAudio.DEFAULT_MIN_ANALYSIS_PITCH,
                TranscribeAudio.DEFAULT_MAX_ANALYSIS_PITCH),
            audioUrl: TranscribeAudio.formatAudioUrl(uploadId),
            audioEditVersion: 0,
            minSelectX: -1,
            maxSelectX: -1,
            minAudioX: TranscribeAudio.MIN_IMAGE_XPERC * TranscribeAudio.AUDIO_IMG_WIDTH,
            maxAudioX: TranscribeAudio.MAX_IMAGE_XPERC * TranscribeAudio.AUDIO_IMG_WIDTH,
            minAudioTime: 0.0,
            maxAudioTime: -1.0,
            audioImgWidth: (TranscribeAudio.MAX_IMAGE_XPERC - TranscribeAudio.MIN_IMAGE_XPERC)
                * TranscribeAudio.AUDIO_IMG_WIDTH,
            closeImgSelectionCallback: () => (null),
            selectionCallback: (t1, t2) => (null)
        };
        this.imageIntervalSelected = this.imageIntervalSelected.bind(this);
        this.onAudioImageLoaded = this.onAudioImageLoaded.bind(this);
        this.audioIntervalSelected = this.audioIntervalSelected.bind(this);
        this.audioIntervalSelectionCanceled = this.audioIntervalSelectionCanceled.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.applyPitchRange = this.applyPitchRange.bind(this);
        this.showAllClicked = this.showAllClicked.bind(this);
        this.selectionIntervalClicked = this.selectionIntervalClicked.bind(this);
        this.pitchArtRangeClicked = this.pitchArtRangeClicked.bind(this);
        this.averagePitchArtClicked = this.averagePitchArtClicked.bind(this);
        this.manualPitchArtClicked = this.manualPitchArtClicked.bind(this);
        this.wordSplitClicked = this.wordSplitClicked.bind(this);
        this.imageIntervalToTimeInterval = this.imageIntervalToTimeInterval.bind(this);
        this.getAudioConfigForSelection = this.getAudioConfigForSelection.bind(this);
        this.manualPitchChange = this.manualPitchChange.bind(this);
        this.addPitch = this.addPitch.bind(this);
        this.targetPitchSelected = this.targetPitchSelected.bind(this);
    }

    static formatImageUrl(uploadId, minPitch, maxPitch, tmin, tmax) {
        let url = `/api/audio-analysis-image/${uploadId}.png`;
        let urlOptions = [];

        if (minPitch !== undefined) {
            urlOptions.push(`min-pitch=${minPitch}`);
        }

        if (maxPitch !== undefined) {
            urlOptions.push(`max-pitch=${maxPitch}`);
        }

        if (tmin !== undefined) {
            urlOptions.push(`tmin=${tmin}`);
        }

        if (tmax !== undefined) {
            urlOptions.push(`&tmax=${tmax}`);
        }

        if (urlOptions.length > 0) {
            url += "?" + urlOptions.join("&");
        }

        return url;
    }

    static formatAudioUrl(uploadId, tmin, tmax) {
        if (tmin !== undefined && tmax !== undefined && tmax !== -1) {
            return `/api/audio/${uploadId}?tmin=${tmin}&tmax=${tmax}`;
        } else {
            return `/api/audio/${uploadId}`;
        }
    }

    componentDidMount() {
        const {uploadId} = this.props.match.params;
        if (uploadId) {
            var controller = this;
            fetch("/api/sound-length/" + uploadId, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: {uploadId: uploadId}
            })
                .then(response => response.json())
                .then(function (data) {
                    controller.setState({
                        soundLength: data["sound_length"],
                        maxAudioTime: data["sound_length"]
                    });
                });
        }
    }

    getAudioConfigForSelection(leftX, rightX) {
        // Compute the new time scale
        let ts;
        if (leftX !== undefined && rightX !== undefined) {
            ts = this.imageIntervalToTimeInterval(leftX, rightX);
        } else {
            ts = [this.state.minAudioTime, this.state.maxAudioTime];
        }

        const {uploadId} = this.props.match.params;

        let newAudioUrl = TranscribeAudio.formatAudioUrl(
            uploadId,
            ts[0],
            ts[1]);

        return {
            audioUrl: newAudioUrl,
            minAudioTime: ts[0],
            maxAudioTime: ts[1]
        };
    }

    targetPitchSelected(index) {
        if (index !== -1) {
            let letter = this.state.letters[index];
            this.state.selectionCallback(letter.t0, letter.t1);

            const {uploadId} = this.props.match.params;
            let newAudioUrl = TranscribeAudio.formatAudioUrl(
                uploadId,
                letter.t0,
                letter.t1);

            this.setState({
                audioUrl: newAudioUrl
            });
        }
    }

    audioIntervalSelectionCanceled() {
        let config = this.getAudioConfigForSelection();
        this.setState({
            audioUrl: config.audioUrl,
            minSelectX: -1,
            maxSelectX: -1
        });
    }

    audioIntervalSelected(leftX, rightX) {
        let config = this.getAudioConfigForSelection(leftX, rightX);
        this.setState({
            audioUrl: config.audioUrl,
            minSelectX: leftX,
            maxSelectX: rightX
        });
    }

    addPitch(pitch, letter, ts, isManualPitch, isWordSep) {
        if (!isWordSep) {
            if (pitch < this.state.minPitch || pitch > this.state.maxPitch) {
                // the pitch outside the bounds of the window, omit it
                return
            }
        }

        if (ts[0] === ts[1]) {
            // add buffer to avoid adding a very narrow box to Target Pitch
            ts[0] = Math.max(ts[0] - 0.001, 0);
            ts[1] = Math.min(ts[1] + 0.001, this.state.soundLength);
        }

        let newLetter = {
            letter: letter,
            leftX: -1,
            rightX: -1,
            t0: ts[0],
            t1: ts[1],
            pitch: pitch,
            syllable: TranscribeAudio.DEFAULT_SYLLABLE_TEXT,
            isManualPitch: isManualPitch,
            isWordSep: isWordSep
        };

        let newLettersList = this.state.letters.concat(newLetter);
        newLettersList = newLettersList.sort((a, b) => a.t0 - b.t0);

        this.setState(prevState =>
            ({
                letters: newLettersList
            })
        );

        this.props.addLetter(newLetter);
        this.state.closeImgSelectionCallback();
    }

    imageIntervalSelected(leftX, rightX, manualPitch, isWordSep=false) {
        let ts = this.imageIntervalToTimeInterval(leftX, rightX);

        const {uploadId} = this.props.match.params;
        if (manualPitch !== undefined) {
            this.addPitch(manualPitch, TranscribeAudio.DEFAULT_SYLLABLE_TEXT, ts, true);
            return;
        }

        if (isWordSep) {
            this.addPitch(-1, TranscribeAudio.DEFAULT_SEPARATOR_TEXT, ts, false, true);
            return;
        }

        fetch("/api/avg-pitch/"
            + uploadId
            + "?t0=" + ts[0]
            + "&t1=" + ts[1]
            + "&max-pitch=" + this.state.maxPitch
            + "&min-pitch=" + this.state.minPitch, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => this.addPitch(data["avg_pitch"], TranscribeAudio.DEFAULT_SYLLABLE_TEXT, ts, false)
            )
    }

    pitchArtRangeClicked() {
        let ts = this.imageIntervalToTimeInterval(this.state.minSelectX, this.state.maxSelectX);

        const {uploadId} = this.props.match.params;
        let json = {
            "time_range": ts
        };

        fetch("/api/all-pitches/"
            + uploadId + "?max-pitch="
            + this.state.maxPitch
            + "&min-pitch=" + this.state.minPitch, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        })
            .then(response => response.json())
            .then(data => data.map(item => this.addPitch(item[1],
                TranscribeAudio.DEFAULT_SYLLABLE_TEXT,
                [item[0], item[0]]))
            )
    }

    averagePitchArtClicked() {
        this.imageIntervalSelected(
            this.state.minSelectX,
            this.state.maxSelectX);
    }

    wordSplitClicked() {
        this.imageIntervalSelected(
            this.state.minSelectX,
            this.state.maxSelectX,
            undefined,
            true);
    }

    manualPitchChange(index, newPitch) {
        this.props.setLetterPitch(index, newPitch);
    }

    manualPitchArtClicked() {
        let manualPitch;
        let isValidNumber = false;

        while (!isValidNumber) {
            let msg = `Enter pitch value between ${this.state.minPitch.toFixed(2)}Hz and ${this.state.maxPitch.toFixed(2)}Hz`;

            manualPitch = prompt(msg);

            if (manualPitch === null) {
                // user cancelled manual input
                this.state.closeImgSelectionCallback();
                return;
            }

            manualPitch = parseFloat(manualPitch);

            isValidNumber = !isNaN(manualPitch);

            if (!isValidNumber) {
                alert(`Invalid frequency, expected a number`);
                continue;
            }

            isValidNumber = !(manualPitch < this.state.minPitch || manualPitch > this.state.maxPitch);
            if (!isValidNumber) {
                alert(`${manualPitch}Hz is not between between ${this.state.minPitch.toFixed(2)}Hz and ${this.state.maxPitch.toFixed(2)}Hz`);
            }
        }

        this.imageIntervalSelected(
            this.state.minSelectX,
            this.state.maxSelectX,
            manualPitch);
    }

    onAudioImageLoaded(cancelCallback, selectionCallback) {
        this.setState({
            isAudioImageLoaded: true,
            closeImgSelectionCallback: cancelCallback,
            selectionCallback: selectionCallback
        });
    }

    handleInputChange(event) {
        const target = event.target;

        let value = null;
        if (target.type === "checkbox") {
            value = target.checked;
        } else if (target.type === "file") {
            value = target.files[0];
        } else {
            value = target.value;
        }

        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    applyPitchRange(minPitch, maxPitch) {
        const {uploadId} = this.props.match.params;
        let newUrl = TranscribeAudio.formatImageUrl(
            uploadId,
            minPitch,
            maxPitch,
            this.state.minAudioTime,
            this.state.maxAudioTime);

        this.state.closeImgSelectionCallback();

        this.setState({
            imageUrl: newUrl,
            isAudioImageLoaded: false,
            audioEditVersion: this.state.audioEditVersion + 1,
            minPitch: minPitch !== "" ? parseFloat(minPitch) : TranscribeAudio.DEFAULT_MIN_ANALYSIS_PITCH,
            maxPitch: maxPitch !== "" ? parseFloat(maxPitch) : TranscribeAudio.DEFAULT_MAX_ANALYSIS_PITCH
        });
    }

    showAllClicked() {
        const {uploadId} = this.props.match.params;
        let newUrl = TranscribeAudio.formatImageUrl(
            uploadId,
            this.state.minPitch,
            this.state.maxPitch,
            0,
            this.state.soundLength);

        let newAudioUrl = TranscribeAudio.formatAudioUrl(
            uploadId,
            0,
            this.state.soundLength);

        this.state.closeImgSelectionCallback();

        this.setState({
            imageUrl: newUrl,
            audioUrl: newAudioUrl,
            isAudioImageLoaded: false,
            audioEditVersion: this.state.audioEditVersion + 1,
            minAudioTime: 0,
            maxAudioTime: this.state.soundLength
        });
    }

    imageIntervalToTimeInterval(x1, x2) {
        let dt = this.state.maxAudioTime - this.state.minAudioTime;
        let dx = this.state.maxAudioX - this.state.minAudioX;
        let u0 = x1 / dx;
        let u1 = x2 / dx;

        let t0 = this.state.minAudioTime + (u0 * dt);
        let t1 = this.state.minAudioTime + (u1 * dt);
        return [t0, t1];
    }

    selectionIntervalClicked() {
        // Compute the new time scale
        let config = this.getAudioConfigForSelection(
            this.state.minSelectX,
            this.state.maxSelectX);

        const {uploadId} = this.props.match.params;
        let newImageUrl = TranscribeAudio.formatImageUrl(
            uploadId,
            this.state.minPitch,
            this.state.maxPitch,
            config.minAudioTime,
            config.maxAudioTime);

        this.state.closeImgSelectionCallback();

        this.setState({
            imageUrl: newImageUrl,
            audioUrl: config.audioUrl,
            isAudioImageLoaded: false,
            audioEditVersion: this.state.audioEditVersion + 1,
            minAudioTime: config.minAudioTime,
            maxAudioTime: config.maxAudioTime
        });
    }

    render() {
        const {uploadId} = this.props.match.params;

        let nonAudioImg;
        if (!uploadId) {
            nonAudioImg = <AudioImgDefault/>;
        } else if (!this.state.isAudioImageLoaded) {
            nonAudioImg = <AudioImgLoading/>;
        }

        const isSelectionActive = this.state.minSelectX !== -1
            && this.state.maxSelectX !== -1;
        const isAllShown = this.state.minAudioTime === 0
            && this.state.maxAudioTime === this.state.soundLength;

        let title = "";
        if (this.props.match.params.uploadId) {
            title = "- " + this.props.match.params.uploadId;
        }

        return (
            <div>
                <div className="wizard-header">
                    <h5>Transcribe Audio {title}</h5>
                </div>
                <div className="metilda-audio-analysis-layout">
                    <div className="row">
                        <div className="metilda-audio-analysis-controls-list col s4">
                            <h6 className="metilda-control-header">Audio Analysis</h6>
                            <UploadAudio initFileName={uploadId}/>
                            <PitchRange initMinPitch={this.state.minPitch}
                                        initMaxPitch={this.state.maxPitch}
                                        applyPitchRange={this.applyPitchRange}/>
                        </div>
                        <div className="metilda-audio-analysis col s8">
                            <div>
                                <div className="metilda-audio-analysis-image-container">
                                    {nonAudioImg}
                                    {
                                        uploadId ?
                                            <AudioImg key={this.state.audioEditVersion}
                                                      uploadId={uploadId}
                                                      src={this.state.imageUrl}
                                                      ref="audioImage"
                                                      imageWidth={TranscribeAudio.AUDIO_IMG_WIDTH}
                                                      xminPerc={TranscribeAudio.MIN_IMAGE_XPERC}
                                                      xmaxPerc={TranscribeAudio.MAX_IMAGE_XPERC}
                                                      audioIntervalSelected={this.audioIntervalSelected}
                                                      audioIntervalSelectionCanceled={this.audioIntervalSelectionCanceled}
                                                      onAudioImageLoaded={this.onAudioImageLoaded}
                                                      minAudioX={this.state.minAudioX}
                                                      maxAudioX={this.state.maxAudioX}
                                                      minAudioTime={this.state.minAudioTime}
                                                      maxAudioTime={this.state.maxAudioTime}/>
                                            : []
                                    }
                                </div>
                                <div id="metilda-audio-function-btns">
                                    <button className="waves-effect waves-light btn"
                                            onClick={this.showAllClicked}
                                            disabled={isAllShown}>All
                                    </button>
                                    <button className="waves-effect waves-light btn"
                                            onClick={this.selectionIntervalClicked}
                                            disabled={!isSelectionActive}>Sel
                                    </button>
                                    <button className="waves-effect waves-light btn"
                                            onClick={this.pitchArtRangeClicked}
                                            disabled={!isSelectionActive}>Range Pitch
                                    </button>
                                    <button className="waves-effect waves-light btn"
                                            onClick={this.averagePitchArtClicked}
                                            disabled={!isSelectionActive}>Average Pitch
                                    </button>
                                    <button className="waves-effect waves-light btn"
                                            onClick={this.manualPitchArtClicked}
                                            disabled={!isSelectionActive}>Manual Pitch
                                    </button>
                                    <button className="waves-effect waves-light btn"
                                            onClick={this.wordSplitClicked}
                                            disabled={!isSelectionActive}>Split
                                    </button>
                                </div>
                                <PlayerBar key={this.state.audioUrl}
                                           audioUrl={this.state.audioUrl}/>

                                <TargetPitchBar letters={this.props.letters}
                                                minAudioX={this.state.minAudioX}
                                                maxAudioX={this.state.maxAudioX}
                                                minAudioTime={this.state.minAudioTime}
                                                maxAudioTime={this.state.maxAudioTime}
                                                targetPitchSelected={this.targetPitchSelected}/>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <PitchArtContainer
                            letters={this.props.letters}
                            soundLength={this.state.soundLength}
                            width={TranscribeAudio.AUDIO_IMG_WIDTH}
                            height={600}
                            minPitch={this.state.minPitch}
                            maxPitch={this.state.maxPitch}
                            manualPitchChange={this.manualPitchChange}
                            uploadId={uploadId}/>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    letters: state.audioAnalysisReducer.letters
});

const mapDispatchToProps = dispatch => ({
    addLetter: (newLetter) => dispatch(addLetter(newLetter)),
    setLetterPitch: (index, newPitch) => dispatch(setLetterPitch(index, newPitch))
});

export default connect(mapStateToProps, mapDispatchToProps)(TranscribeAudio);