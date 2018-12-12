import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import './UploadAudio.css';
import AudioImg from "./AudioImg";
import AudioImgLoading from "./AudioImgLoading";
import AudioLetter from "./AudioLetter";
import {Redirect} from "react-router-dom";
import PitchArt from "./PitchArt";
import {controls, Media, Player} from 'react-media-player';
import PitchArtDrawingWindow from "./PitchArtDrawingWindow";

const {PlayPause, MuteUnmute, SeekBar} = controls;


class TranscribeAudio extends Component {
    state = {};

    static get MIN_IMAGE_XPERC() {
        return 320.0 / 2560.0;
    }

    static get MAX_IMAGE_XPERC() {
        return 2306.0 / 2560.0;
    }

    static get AUDIO_IMG_WIDTH() {
        return 800;
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
            closeImgSelectionCallback: () => (null)
        };
        this.imageIntervalSelected = this.imageIntervalSelected.bind(this);
        this.onAudioImageLoaded = this.onAudioImageLoaded.bind(this);
        this.audioIntervalSelected = this.audioIntervalSelected.bind(this);
        this.audioIntervalSelectionCanceled = this.audioIntervalSelectionCanceled.bind(this);

        this.nextClicked = this.nextClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.removePrevious = this.removePrevious.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.applyMaxPitch = this.applyMaxPitch.bind(this);
        this.showAllClicked = this.showAllClicked.bind(this);
        this.scaleIntervals = this.scaleIntervals.bind(this);
        this.selectionIntervalClicked = this.selectionIntervalClicked.bind(this);
        this.pitchArtClicked = this.pitchArtClicked.bind(this);
        this.imageIntervalToTimeInterval = this.imageIntervalToTimeInterval.bind(this);
        this.timeCoordToImageCoord = this.timeCoordToImageCoord.bind(this);

        // 94 quarter tones below A4
        this.minVertPitch = 30.0;

        // 11 quarter tones above A4
        this.maxVertPitch = 604.53;
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

    audioIntervalSelectionCanceled() {
        this.setState({minSelectX: -1, maxSelectX: -1});
    }

    audioIntervalSelected(leftX, rightX) {
        this.setState({minSelectX: leftX, maxSelectX: rightX});
    }

    imageIntervalSelected(leftX, rightX) {
        let letter = "X";

        let ts = this.imageIntervalToTimeInterval(leftX, rightX);

        const controller = this;
        const {uploadId} = this.props.match.params;
        let json = {
            "time_ranges": [ts]
        };

        fetch("/api/max-pitches/" + uploadId, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        })
            .then(response => response.json())
            .then(function (data) {
                    let pitch = data[0];
                    if (pitch < controller.minVertPitch || pitch > controller.maxVertPitch) {
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
                }
            )

        this.state.closeImgSelectionCallback();
    }

    pitchArtClicked() {
        this.imageIntervalSelected(this.state.minSelectX,
            this.state.maxSelectX);
    }

    nextClicked() {
        const {uploadId} = this.props.match.params;
        this.setState({redirectId: uploadId});
    }

    removePrevious() {
        let letters = this.state.letters.slice(0, this.state.letters.length - 1);
        this.setState(prevState => (
            {letters: letters, letterEditVersion: prevState.letterEditVersion + 1})
        );
    }

    resetClicked() {
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
            audioEditVersion: this.state.audioEditVersion + 1
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

        this.setState({
            imageUrl: newUrl,
            audioUrl: newAudioUrl,
            isAudioImageLoaded: false,
            audioEditVersion: this.state.audioEditVersion + 1,
            minAudioTime: 0,
            maxAudioTime: this.state.soundLength
        });
        this.state.closeImgSelectionCallback();
    }

    imageIntervalToTimeInterval(x1, x2) {
        let dt = this.state.maxAudioTime - this.state.minAudioTime;
        let dx = this.state.maxAudioX - this.state.minAudioX;
        let u0 = (x1 - this.state.minAudioX) / dx;
        let u1 = (x2 - this.state.minAudioX) / dx;

        let t0 = this.state.minAudioTime + (u0 * dt);
        let t1 = this.state.minAudioTime + (u1 * dt);

        return [t0, t1];
    }

    timeCoordToImageCoord(t) {
        // clip times that lie beyond the image boundaries
        if (t < this.state.minAudioTime) {
            return this.state.minAudioX;
        } else if (t > this.state.maxAudioTime) {
            return this.state.maxAudioX;
        }

        let dt = this.state.maxAudioTime - this.state.minAudioTime;
        let u0 = (t - this.state.minAudioTime) / dt;

        let dx = this.state.maxAudioX - this.state.minAudioX;
        let x0 = this.state.minAudioX + (u0 * dx);

        return x0
    }

    selectionIntervalClicked() {
        // Compute the new time scale
        let ts = this.imageIntervalToTimeInterval(
            this.state.minSelectX,
            this.state.maxSelectX);

        const {uploadId} = this.props.match.params;
        let newImageUrl = TranscribeAudio.formatImageUrl(
            uploadId,
            this.state.maxPitch,
            ts[0],
            ts[1]);

        let newAudioUrl = TranscribeAudio.formatAudioUrl(
            uploadId,
            ts[0],
            ts[1]);

        this.setState({
            imageUrl: newImageUrl,
            audioUrl: newAudioUrl,
            isAudioImageLoaded: false,
            audioEditVersion: this.state.audioEditVersion + 1,
            minAudioTime: ts[0],
            maxAudioTime: ts[1]
        });

        this.state.closeImgSelectionCallback();
    }

    scaleIntervals() {
        // Scale letter intervals to be within the range [0, 1], where
        // 0 is the left side of the selection interval and 1 is the right
        // side of the selection interval.
        let state = this.state;
        let intervalsInSelection = this.state.letters.filter(function (item) {
            let tooFarLeft = item.t1 < state.minAudioTime;
            let tooFarRight = item.t0 > state.maxAudioTime;
            return !(tooFarLeft || tooFarRight);
        });

        let controller = this;
        return intervalsInSelection.map(function (item) {
            let itemCopy = Object.assign({}, item);

            itemCopy.leftX = controller.timeCoordToImageCoord(itemCopy.t0);
            itemCopy.rightX = controller.timeCoordToImageCoord(itemCopy.t1);

            // transform letter interval into new time scale
            // clip boundaries to prevent overflow
            return itemCopy;
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
                    minVertPitch={this.minVertPitch}
                    maxVertPitch={this.maxVertPitch}
                    uploadId={uploadId}
                    pitches={sortedPitches}
                    times={sortedTimes}/>
                <PitchArt width={700}
                          height={600}
                          key={this.state.letterEditVersion + 1}
                          minVertPitch={this.minVertPitch}
                          maxVertPitch={this.maxVertPitch}
                          uploadId={uploadId}
                          pitches={sortedPitches}
                          times={sortedTimes}/>
            </div>;
        }

        let letters = this.scaleIntervals();
        const isSelectionActive = this.state.minSelectX !== -1
            && this.state.maxSelectX !== -1;
        const isAllShown = this.state.minAudioTime === 0
            && this.state.maxAudioTime === this.state.soundLength;

        return (
            <div>
                <div className="wizard-header">
                    <h3>Pitch Art Wizard</h3>
                    <h4>Transcribe Audio (step 2/2)</h4>
                </div>
                <div className="metilda-audio-analysis-layout">
                    <div className="metilda-audio-analysis">
                        <div>
                            <div className="metilda-audio-analysis-image-container">
                                {audioImageLoading}
                                <AudioImg key={this.state.audioEditVersion}
                                          uploadId={uploadId}
                                          src={this.state.imageUrl}
                                          ref="audioImage"
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
                                        onClick={this.pitchArtClicked}
                                        disabled={!isSelectionActive}>Pch
                                </button>
                            </div>
                            <div>
                                <Media>
                                    <div className="media">
                                        <div className="media-player">
                                            <Player src={this.state.audioUrl}/>
                                        </div>
                                        <div className="media-controls metilda-control-container">
                                            <div className="metilda-audio-analysis-image-col-1">
                                                <PlayPause/>
                                            </div>
                                            <div className="metilda-audio-analysis-image-col-2 vert-center">
                                                <SeekBar className="no-border"/>
                                            </div>
                                            <div className="metilda-audio-analysis-image-col-3">
                                            </div>
                                        </div>
                                    </div>
                                </Media>
                            </div>
                            <div>
                                <div className="metilda-control-container">
                                    <div className="metilda-audio-analysis-image-col-1">
                                        Max Frequency
                                    </div>
                                    <div className="metilda-audio-analysis-image-col-2">
                                        <input name="maxPitch"
                                               onChange={this.handleInputChange}
                                               placeholder="Max frequency (ex: 200)"
                                               type="text"/>
                                    </div>
                                    <div className="metilda-audio-analysis-image-col-3">
                                        <a className="waves-effect waves-light btn fill-parent vert-center"
                                           onClick={this.applyMaxPitch}>Apply</a>
                                    </div>
                                </div>
                            </div>
                            <div className="metilda-control-container">
                                <div className="metilda-audio-analysis-image-col-1">
                                    <span>Letters</span>
                                </div>
                                <div className="metilda-audio-analysis-image-col-2">
                                    {
                                        letters.map(function (item, index) {
                                            return <AudioLetter key={index}
                                                                letter={item.letter}
                                                                leftX={item.leftX}
                                                                rightX={item.rightX}/>
                                        })
                                    }
                                </div>
                                <div className="metilda-audio-analysis-image-col-3">
                                </div>
                            </div>
                        </div>
                        <div className="right-align">
                            <button className="btn waves-effect waves-light m-r-16"
                                    type="submit"
                                    name="action"
                                    disabled={this.state.letters.length === 0}
                                    onClick={this.removePrevious}>
                                Remove Previous
                            </button>
                            <button className="btn waves-effect waves-light"
                                    type="submit"
                                    name="action"
                                    disabled={this.state.letters.length === 0}
                                    onClick={this.resetClicked}>
                                Reset
                            </button>
                            {/*<button className="btn waves-effect waves-light"*/}
                            {/*type="submit"*/}
                            {/*name="action"*/}
                            {/*onClick={this.nextClicked}>*/}
                            {/*Next*/}
                            {/*</button>*/}
                        </div>
                    </div>
                    <div className="metilda-audio-analysis-pitch-art">
                        {pitchArt}
                    </div>
                </div>
            </div>
        );
    }
}

export default TranscribeAudio;