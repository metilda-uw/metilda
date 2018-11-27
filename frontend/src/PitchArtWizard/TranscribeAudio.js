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

const {PlayPause, MuteUnmute, SeekBar} = controls;


class TranscribeAudio extends Component {
    state = {};

    constructor(props) {
        super(props);

        const {uploadId} = this.props.match.params;
        const initMaxPitch = "";
        const minImageXPerc = 320.0 / 2560.0;
        const maxImageXPerc = 2306.0 / 2560.0;
        const audioImgWidth = 800;
        this.state = {
            letters: [],
            isAudioImageLoaded: false,
            soundLength: -1,
            selectionInterval: "Letter",
            updateCounter: 0,
            redirectId: null,
            maxPitch: initMaxPitch,
            imageUrl: TranscribeAudio.formatImageUrl(uploadId, initMaxPitch),
            audioEditVersion: 0,
            minSelectX: minImageXPerc * audioImgWidth,
            maxSelectX: maxImageXPerc * audioImgWidth,
            minAudioFrameX: minImageXPerc * audioImgWidth,
            maxAudioFrameX: maxImageXPerc * audioImgWidth,
            minAudioX: minImageXPerc * audioImgWidth,
            maxAudioX: maxImageXPerc * audioImgWidth,
            audioImgWidth: (maxImageXPerc - minImageXPerc) * audioImgWidth,
            closeImgSelectionCallback: () => (null)
        };
        this.imageIntervalSelected = this.imageIntervalSelected.bind(this);
        this.onAudioImageLoaded = this.onAudioImageLoaded.bind(this);
        this.audioIntervalSelected = this.audioIntervalSelected.bind(this);

        this.nextClicked = this.nextClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.removePrevious = this.removePrevious.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.applyMaxPitch = this.applyMaxPitch.bind(this);
        this.showAllClicked = this.showAllClicked.bind(this);
        this.scaleIntervals = this.scaleIntervals.bind(this);
        this.selectionIntervalClicked = this.selectionIntervalClicked.bind(this);
        this.pitchArtClicked = this.pitchArtClicked.bind(this);
    }

    static formatImageUrl(uploadId, maxPitch) {
        return "/api/audio-analysis-image/" + uploadId + ".png?max-pitch=" + maxPitch;
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
                controller.setState({soundLength: data["sound_length"]});
            });
    }

    audioIntervalSelected(leftX, rightX) {
        this.setState({minSelectX: leftX, maxSelectX: rightX});
    }

    imageIntervalSelected(leftX, rightX) {
        let letter = prompt("Enter a letter");

        if (letter !== null && letter.trim().length > 0) {
            let t0 = (leftX - this.state.minAudioX) / this.state.maxAudioX  * this.state.soundLength;
            let t1 = (rightX - this.state.minAudioX) / this.state.maxAudioX * this.state.soundLength;
            const controller = this;
            const {uploadId} = this.props.match.params;
            let json = {
                "time_ranges": [[t0, t1]]
            };

            console.log("[" + leftX + ", " + rightX + "]");

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
                        controller.setState(prevState =>
                            ({
                                letters: prevState.letters.concat({
                                    letter: letter,
                                    leftX: leftX,
                                    rightX: rightX,
                                    t0: t0,
                                    t1: t1,
                                    pitch: data[0]
                                }),
                                updateCounter: prevState.updateCounter + 1
                            })
                        )
                    }
                )
        }

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
            {letters: letters, updateCounter: prevState.updateCounter + 1})
        );
    }

    resetClicked() {
        this.setState(prevState => (
            {letters: [], updateCounter: prevState.updateCounter + 1})
        );
    }

    onAudioImageLoaded(cancelCallback) {
        this.setState({isAudioImageLoaded: true,
                       closeImgSelectionCallback: cancelCallback});
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
        let newUrl = TranscribeAudio.formatImageUrl(uploadId, this.state.maxPitch);
        let {audioEditVersion} = this.state;
        this.setState({
            imageUrl: newUrl,
            isAudioImageLoaded: false,
            audioEditVersion: audioEditVersion + 1
        });
    }

    showAllClicked() {
        this.setState({minAudioFrameX: this.state.minAudioX,
                       maxAudioFrameX: this.state.maxAudioX});
        this.state.closeImgSelectionCallback();
    }

    selectionIntervalClicked() {
        this.setState({minAudioFrameX: this.state.minSelectX,
                       maxAudioFrameX: this.state.maxSelectX});
        this.state.closeImgSelectionCallback();
    }

    scaleIntervals() {
        // Scale letter intervals to be within the range [0, 1], where
        // 0 is the left side of the selection interval and 1 is the right
        // side of the selection interval.
        let state = this.state;
        let maxSelectionX = Math.max(state.minAudioFrameX, state.maxAudioFrameX);
        let minSelectionX = Math.min(state.minAudioFrameX, state.maxAudioFrameX);
        let intervalsInSelection = this.state.letters.filter(function (item) {
            let maxItemX = Math.max(item.leftX, item.rightX);
            let minItemX = Math.min(item.leftX, item.rightX);

            let tooFarLeft = maxItemX < minSelectionX;
            let tooFarRight = minItemX > maxSelectionX;
            return !(tooFarLeft || tooFarRight);
        });

        let selectionWidth = state.maxAudioFrameX - state.minAudioFrameX;

        return intervalsInSelection.map(function (item) {
            let itemCopy = Object.assign({}, item);

            let u1 = (itemCopy.leftX - state.minAudioFrameX) / selectionWidth;
            let u2 = (itemCopy.rightX - state.minAudioFrameX) / selectionWidth;

            // clip boundaries to prevent overflow
            u1 = Math.max(u1, 0.0);
            u2 = Math.min(u2, 1.0);

            itemCopy.leftX = u1 * state.audioImgWidth + state.minAudioX;
            itemCopy.rightX = u2 * state.audioImgWidth + state.minAudioX;
            return itemCopy;
        });
    }

    render() {
        if (this.state.redirectId !== null) {
            let pitchesString = this.state.letters.map(item => "p=" + item.pitch).join("&");
            return <Redirect push to={"/pitchartwizard/4/" + this.state.redirectId + "?" + pitchesString}/>
        }

        const {uploadId} = this.props.match.params;
        const {imageUrl} = this.state;

        let audioImageLoading;
        if (!this.state.isAudioImageLoaded) {
            audioImageLoading = <AudioImgLoading/>
        }

        let pitchArt;
        if (this.state.letters.length > 1) {
            let timesAndPitches = this.state.letters.map(item => [item.t0, item.pitch]);
            let sortedPitches = timesAndPitches.sort((a, b) => b[0] - a[0]).map(item => item[1]);

            pitchArt = <PitchArt width={700}
                                 height={500}
                                 key={this.state.updateCounter}
                                 pitches={sortedPitches}/>;
        }

        let letters = this.scaleIntervals();

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
                                          src={imageUrl}
                                          ref="audioImage"
                                          xminPerc={320.0 / 2560.0}
                                          xmaxPerc={2306.0 / 2560.0}
                                          audioIntervalSelected={this.audioIntervalSelected}
                                          onAudioImageLoaded={this.onAudioImageLoaded}/>
                            </div>
                            <div id="metilda-audio-function-btns">
                                <button className="waves-effect waves-light btn"
                                        onClick={this.showAllClicked}>All</button>
                                <button className="waves-effect waves-light btn"
                                        onClick={this.selectionIntervalClicked}>Sel</button>
                                <button className="waves-effect waves-light btn"
                                        onClick={this.pitchArtClicked}>Pch</button>
                            </div>
                            <div>
                                <Media>
                                    <div className="media">
                                        <div className="media-player">
                                            <Player src={"/api/audio/" + uploadId}/>
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