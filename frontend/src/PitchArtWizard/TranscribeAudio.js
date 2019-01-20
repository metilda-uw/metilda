import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import './UploadAudio.css';
import AudioImg from "./AudioImg";
import AudioImgLoading from "./AudioImgLoading";
import AudioLetter from "./AudioLetter";
import {Redirect} from "react-router-dom";
import PitchArt from "./PitchArt";
import PitchArtDrawingWindow from "./PitchArtDrawingWindow";
import {connect} from "react-redux";
import {audioSelectionAction} from "../actions/audioAnalysisActions";
import PlayerBar from "./AudioViewer/PlayerBar";
import MaxFrequencyBar from "./AudioViewer/MaxFrequencyBar";
import TargetPitchBar from "./TargetPitchBar";


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

    static get DEFAULT_MIN_VERT_PITCH() {
        // 94 quarter tones below A4
        return 30.0;
    }

    static get DEFAULT_MAX_VERT_PITCH() {
        // 11 quarter tones above A4
        return 604.53;
    }

    constructor(props) {
        super(props);

        const {uploadId} = this.props.match.params;
        this.state = {
            letters: [],
            isAudioImageLoaded: false,
            soundLength: -1,
            selectionInterval: "Letter",
            letterEditVersion: 0,
            redirectId: null,
            maxPitch: "",
            imageUrl: TranscribeAudio.formatImageUrl(uploadId),
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
            minVertPitch: TranscribeAudio.DEFAULT_MIN_VERT_PITCH,
            maxVertPitch: TranscribeAudio.DEFAULT_MAX_VERT_PITCH,
            closeImgSelectionCallback: () => (null)
        };
        this.imageIntervalSelected = this.imageIntervalSelected.bind(this);
        this.onAudioImageLoaded = this.onAudioImageLoaded.bind(this);
        this.audioIntervalSelected = this.audioIntervalSelected.bind(this);
        this.audioIntervalSelectionCanceled = this.audioIntervalSelectionCanceled.bind(this);

        this.nextClicked = this.nextClicked.bind(this);
        this.resetAllLetters = this.resetAllLetters.bind(this);
        this.removeLetter = this.removeLetter.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.applyMaxPitch = this.applyMaxPitch.bind(this);
        this.showAllClicked = this.showAllClicked.bind(this);
        this.selectionIntervalClicked = this.selectionIntervalClicked.bind(this);
        this.praatPitchArtClicked = this.praatPitchArtClicked.bind(this);
        this.manualPitchArtClicked = this.manualPitchArtClicked.bind(this);
        this.imageIntervalToTimeInterval = this.imageIntervalToTimeInterval.bind(this);
        this.getAudioConfigForSelection = this.getAudioConfigForSelection.bind(this);
    }

    static formatImageUrl(uploadId, maxPitch, tmin, tmax) {
        let url = `/api/audio-analysis-image/${uploadId}.png`;
        let urlOptions = [];

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

    audioIntervalSelectionCanceled() {
        let config = this.getAudioConfigForSelection();
        this.setState({
            audioUrl: config.audioUrl,
            minSelectX: -1,
            maxSelectX: -1});
    }

    audioIntervalSelected(leftX, rightX) {
        let config = this.getAudioConfigForSelection(leftX, rightX);
        this.setState({
            audioUrl: config.audioUrl,
            minSelectX: leftX,
            maxSelectX: rightX});
    }

    imageIntervalSelected(leftX, rightX, manualPitch) {
        let letter = "X";

        let ts = this.imageIntervalToTimeInterval(leftX, rightX);

        const controller = this;
        const {uploadId} = this.props.match.params;
        let json = {
            "time_ranges": [ts]
        };

        function addLetter(pitch) {
            if (pitch < controller.minVertPitch || pitch > controller.state.maxVertPitch) {
                // the pitch outside the bounds of the window, omit it
                return
            }

            controller.setState(prevState =>
                ({
                    letters: prevState.letters.concat({
                        letter: letter,
                        leftX: -1,
                        rightX: -1,
                        t0: ts[0],
                        t1: ts[1],
                        pitch: pitch
                    }),
                    letterEditVersion: prevState.letterEditVersion + 1
                })
            )

            controller.state.closeImgSelectionCallback();
        }

        if (manualPitch !== undefined) {
            addLetter(manualPitch);
            return;
        }

        fetch("/api/max-pitches/" + uploadId + "?max-pitch=" + this.state.maxPitch, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        })
            .then(response => response.json())
            .then(function (data) {
                    addLetter(data[0])
                }
            )
    }

    praatPitchArtClicked() {
        this.imageIntervalSelected(
            this.state.minSelectX,
            this.state.maxSelectX);
    }

    manualPitchArtClicked() {
        let manualPitch;
        let isValidNumber = false;

        while (!isValidNumber) {
            let msg = `Enter pitch value between ${this.state.minVertPitch.toFixed(2)}Hz and ${this.state.maxVertPitch.toFixed(2)}Hz`;

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

            debugger;
            isValidNumber = !(manualPitch < this.state.minVertPitch || manualPitch > this.state.maxVertPitch);
            if (!isValidNumber) {
                alert(`${manualPitch}Hz is not between between ${this.state.minVertPitch.toFixed(2)}Hz and ${this.state.maxVertPitch.toFixed(2)}Hz`);
            }
        }

        this.imageIntervalSelected(
            this.state.minSelectX,
            this.state.maxSelectX,
            manualPitch);
    }

    nextClicked() {
        const {uploadId} = this.props.match.params;
        this.setState({redirectId: uploadId});
    }

    removeLetter(index) {
        this.setState(prevState => (
            {
                letters: prevState.letters.filter((_, i) => i !== index),
                letterEditVersion: prevState.letterEditVersion + 1
            })
        );
    }

    resetAllLetters() {
        this.setState(prevState => (
            {letters: [], letterEditVersion: prevState.letterEditVersion + 1})
        );
    }

    onAudioImageLoaded(cancelCallback) {
        this.setState({
            isAudioImageLoaded: true,
            closeImgSelectionCallback: cancelCallback
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

    applyMaxPitch() {
        const {uploadId} = this.props.match.params;
        let newUrl = TranscribeAudio.formatImageUrl(
            uploadId,
            this.state.maxPitch,
            this.state.minAudioTime,
            this.state.maxAudioTime);
        this.setState({
            imageUrl: newUrl,
            isAudioImageLoaded: false,
            letterEditVersion: this.state.letterEditVersion + 1,
            audioEditVersion: this.state.audioEditVersion + 1,
            maxVertPitch: this.state.maxPitch !== "" ? this.state.maxPitch : TranscribeAudio.DEFAULT_MAX_VERT_PITCH
        });
    }

    showAllClicked() {
        const {uploadId} = this.props.match.params;
        let newUrl = TranscribeAudio.formatImageUrl(
            uploadId,
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
        if (this.state.redirectId !== null) {
            let pitchesString = this.state.letters.map(item => "p=" + item.pitch).join("&");
            return <Redirect push to={"/pitchartwizard/4/" + this.state.redirectId + "?" + pitchesString}/>
        }

        const {uploadId} = this.props.match.params;

        let audioImageLoading;
        if (!this.state.isAudioImageLoaded) {
            audioImageLoading = <AudioImgLoading/>
        }

        let pitchArt;
        if (this.state.letters.length > 1) {
            let timesAndPitches = this.state.letters.map(item => [item.t0, item.pitch]);
            let sortedTimesAndPitches = timesAndPitches.sort((a, b) => a[0] - b[0]);
            let sortedPitches = sortedTimesAndPitches.map(item => item[1]);
            let sortedTimes = sortedTimesAndPitches.map(item => item[0] * this.state.soundLength);

            pitchArt = <div>
                <PitchArtDrawingWindow
                    width={700}
                    height={600}
                    key={this.state.letterEditVersion}
                    minVertPitch={this.state.minVertPitch}
                    maxVertPitch={this.state.maxVertPitch}
                    uploadId={uploadId}
                    pitches={sortedPitches}
                    times={sortedTimes}/>
                <PitchArt width={700}
                          height={600}
                          key={this.state.letterEditVersion + 1}
                          minVertPitch={this.state.minVertPitch}
                          maxVertPitch={this.state.maxVertPitch}
                          uploadId={uploadId}
                          pitches={sortedPitches}
                          times={sortedTimes}/>
            </div>;
        }

        const isSelectionActive = this.state.minSelectX !== -1
            && this.state.maxSelectX !== -1;
        const isAllShown = this.state.minAudioTime === 0
            && this.state.maxAudioTime === this.state.soundLength;

        return (
            <div>
                <div className="wizard-header">
                    <h5>Transcribe Audio - {this.props.match.params.uploadId}</h5>
                </div>
                <div className="metilda-audio-analysis-layout">
                    <div className="row">
                        <div className="metilda-audio-analysis-controls col s4">
                            <MaxFrequencyBar handleInputChange={this.handleInputChange}
                                             applyMaxPitch={this.applyMaxPitch}/>
                        </div>
                        <div className="metilda-audio-analysis col s8">
                            <div>
                                <div className="metilda-audio-analysis-image-container">
                                    {audioImageLoading}
                                    <AudioImg key={this.state.audioEditVersion}
                                              uploadId={uploadId}
                                              src={this.state.imageUrl}
                                              ref="audioImage"
                                              imageWidth={TranscribeAudio.AUDIO_IMG_WIDTH}
                                              xminPerc={TranscribeAudio.MIN_IMAGE_XPERC}
                                              xmaxPerc={TranscribeAudio.MAX_IMAGE_XPERC}
                                              audioIntervalSelected={this.audioIntervalSelected}
                                              audioIntervalSelectionCanceled={this.audioIntervalSelectionCanceled}
                                              onAudioImageLoaded={this.onAudioImageLoaded}/>
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
                                            onClick={this.praatPitchArtClicked}
                                            disabled={!isSelectionActive}>Praat Pch
                                    </button>
                                    <button className="waves-effect waves-light btn"
                                            onClick={this.manualPitchArtClicked}
                                            disabled={!isSelectionActive}>Manual Pch
                                    </button>
                                </div>
                                <PlayerBar key={this.state.audioUrl}
                                           audioUrl={this.state.audioUrl}/>

                                <TargetPitchBar letters={this.state.letters}
                                                key={this.state.letterEditVersion}
                                                letterEdit
                                                removeLetter={this.removeLetter}
                                                resetAllLetters={this.resetAllLetters}
                                                minAudioX={this.state.minAudioX}
                                                maxAudioX={this.state.maxAudioX}
                                                minAudioTime={this.state.minAudioTime}
                                                maxAudioTime={this.state.maxAudioTime}/>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col 8 push-s4">
                            {pitchArt}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    ...state
});

export default connect(mapStateToProps, null)(TranscribeAudio);