import * as React from "react";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {ThunkDispatch} from "redux-thunk";
import {AppState} from "../store";
import {addLetter, setLetterPitch} from "../store/audio/actions";
import {AudioAction} from "../store/audio/types";
import {Letter} from "../types/types";
import ExportMetildaTranscribe from "./AudioAnalysis/ExportMetildaTranscribe";
import AudioImg from "./AudioImg";
import AudioImgDefault from "./AudioImgDefault";
import AudioImgLoading from "./AudioImgLoading";
import PitchRange from "./AudioViewer/PitchRange";
import PlayerBar from "./AudioViewer/PlayerBar";
import "./GlobalStyling.css";
import PitchArtContainer from "./PitchArtViewer/PitchArtContainer";
import TargetPitchBar from "./TargetPitchBar";
import UploadAudio from "./UploadAudio";
import "./UploadAudio.css";

interface MatchParams  {
    uploadId: string;
}
export interface Props extends RouteComponentProps<MatchParams> {
    letters: Letter[];
    addLetter: (letter: Letter) => void;
    setLetterPitch: (index: number, pitch: number) => void;
}
interface State {
    letters: Letter[];
    isAudioImageLoaded: boolean;
    soundLength: number;
    selectionInterval: string;
    maxPitch: number;
    minPitch: number;
    imageUrl: string;
    audioUrl: string;
    audioEditVersion: number;
    minSelectX: number;
    maxSelectX: number;
    minAudioX: number;
    maxAudioX: number;
    minAudioTime: number;
    maxAudioTime: number;
    audioImgWidth: number;
    closeImgSelectionCallback: () => void;
    selectionCallback: (t1: number, t2: number) => void;
}

class CreatePitchArt extends React.Component<Props, State> {
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
    static get MIN_IMAGE_XPERC(): number {
        return 351.0 / 2800.0;
    }

    static get MAX_IMAGE_XPERC(): number {
        return 2522.0 / 2800.0;
    }

    static get AUDIO_IMG_WIDTH(): number {
        return 653;
    }

    static get DEFAULT_MIN_ANALYSIS_PITCH(): number {
        return 75.0;
    }

    static get DEFAULT_MAX_ANALYSIS_PITCH(): number {
        return 500.0;
    }

    static get DEFAULT_SYLLABLE_TEXT(): string {
        return "X";
    }

    static get DEFAULT_SEPARATOR_TEXT(): string {
        return "";
    }

    static formatImageUrl(uploadId: string, minPitch?: number, maxPitch?: number, tmin?: number, tmax?: number) {
        let url = `/api/audio-analysis-image/${uploadId}.png`;
        const urlOptions = [];

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

    static formatAudioUrl(uploadId: string, tmin?: number, tmax?: number) {
        if (tmin !== undefined && tmax !== undefined && tmax !== -1) {
            return `/api/audio/${uploadId}?tmin=${tmin}&tmax=${tmax}`;
        } else {
            return `/api/audio/${uploadId}`;
        }
    }

    constructor(props: Props) {
        super(props);

        const {uploadId} = this.props.match.params;
        this.state = {
            letters: [],
            isAudioImageLoaded: false,
            soundLength: -1,
            selectionInterval: "Letter",
            maxPitch: CreatePitchArt.DEFAULT_MAX_ANALYSIS_PITCH,
            minPitch: CreatePitchArt.DEFAULT_MIN_ANALYSIS_PITCH,
            imageUrl: CreatePitchArt.formatImageUrl(
                uploadId,
                CreatePitchArt.DEFAULT_MIN_ANALYSIS_PITCH,
                CreatePitchArt.DEFAULT_MAX_ANALYSIS_PITCH),
            audioUrl: CreatePitchArt.formatAudioUrl(uploadId),
            audioEditVersion: 0,
            minSelectX: -1,
            maxSelectX: -1,
            minAudioX: CreatePitchArt.MIN_IMAGE_XPERC * CreatePitchArt.AUDIO_IMG_WIDTH,
            maxAudioX: CreatePitchArt.MAX_IMAGE_XPERC * CreatePitchArt.AUDIO_IMG_WIDTH,
            minAudioTime: 0.0,
            maxAudioTime: -1.0,
            audioImgWidth: (CreatePitchArt.MAX_IMAGE_XPERC - CreatePitchArt.MIN_IMAGE_XPERC)
                * CreatePitchArt.AUDIO_IMG_WIDTH,
            closeImgSelectionCallback: () => (null),
            selectionCallback: (t1, t2) => (null),
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

    componentDidMount() {
        const {uploadId} = this.props.match.params;
        if (uploadId) {
            const controller = this;
            const request: RequestInit = {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({uploadId}),
            };
            fetch("/api/sound-length/" + uploadId, request)
                .then((response) => response.json())
                .then(function(data: any) {
                    controller.setState({
                        soundLength: data.sound_length,
                        maxAudioTime: data.sound_length,
                    });
                });
        }
    }

    getAudioConfigForSelection(leftX?: number, rightX?: number) {
        // Compute the new time scale
        let ts;
        if (leftX !== undefined && rightX !== undefined) {
            ts = this.imageIntervalToTimeInterval(leftX, rightX);
        } else {
            ts = [this.state.minAudioTime, this.state.maxAudioTime];
        }

        const {uploadId} = this.props.match.params;

        const newAudioUrl = CreatePitchArt.formatAudioUrl(
            uploadId,
            ts[0],
            ts[1]);

        return {
            audioUrl: newAudioUrl,
            minAudioTime: ts[0],
            maxAudioTime: ts[1],
        };
    }

    targetPitchSelected(index: number) {
        if (index !== -1) {
            const letter = this.props.letters[index];
            this.state.selectionCallback(letter.t0, letter.t1);

            const {uploadId} = this.props.match.params;
            const newAudioUrl = CreatePitchArt.formatAudioUrl(
                uploadId,
                letter.t0,
                letter.t1);

            this.setState({
                audioUrl: newAudioUrl,
            });
        }
    }

    audioIntervalSelectionCanceled() {
        const config = this.getAudioConfigForSelection();
        this.setState({
            audioUrl: config.audioUrl,
            minSelectX: -1,
            maxSelectX: -1,
        });
    }

    audioIntervalSelected(leftX: number, rightX: number) {
        const config = this.getAudioConfigForSelection(leftX, rightX);
        this.setState({
            audioUrl: config.audioUrl,
            minSelectX: leftX,
            maxSelectX: rightX,
        });
    }

    addPitch(pitch: number, letter: string, ts: number[], isManualPitch: boolean= false, isWordSep: boolean= false) {
        if (!isWordSep) {
            if (pitch < this.state.minPitch || pitch > this.state.maxPitch) {
                // the pitch outside the bounds of the window, omit it
                return;
            }
        }

        if (ts[0] === ts[1]) {
            // add buffer to avoid adding a very narrow box to Target Pitch
            ts[0] = Math.max(ts[0] - 0.001, 0);
            ts[1] = Math.min(ts[1] + 0.001, this.state.soundLength);
        }

        const newLetter = {
            t0: ts[0],
            t1: ts[1],
            pitch,
            syllable: CreatePitchArt.DEFAULT_SYLLABLE_TEXT,
            isManualPitch,
            isWordSep,
        };

        this.props.addLetter(newLetter);
        this.state.closeImgSelectionCallback();
    }

    imageIntervalSelected(leftX: number, rightX: number, manualPitch?: number, isWordSep: boolean= false) {
        const ts = this.imageIntervalToTimeInterval(leftX, rightX);

        const {uploadId} = this.props.match.params;
        if (manualPitch !== undefined) {
            this.addPitch(manualPitch, CreatePitchArt.DEFAULT_SYLLABLE_TEXT, ts, true);
            return;
        }

        if (isWordSep) {
            this.addPitch(-1, CreatePitchArt.DEFAULT_SEPARATOR_TEXT, ts, false, true);
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
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => this.addPitch(data.avg_pitch, CreatePitchArt.DEFAULT_SYLLABLE_TEXT, ts, false),
            );
    }

    pitchArtRangeClicked() {
        const ts = this.imageIntervalToTimeInterval(this.state.minSelectX, this.state.maxSelectX);

        const {uploadId} = this.props.match.params;
        const json = {
            time_range: ts,
        };

        type ApiResult = number[][];

        fetch("/api/all-pitches/"
            + uploadId + "?max-pitch="
            + this.state.maxPitch
            + "&min-pitch=" + this.state.minPitch, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(json),
        })
            .then((response) => response.json())
            .then((data) => (data as ApiResult).map((item) => this.addPitch(item[1],
                CreatePitchArt.DEFAULT_SYLLABLE_TEXT,
                [item[0], item[0]])),
            );
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

    manualPitchChange(index: number, newPitch: number) {
        this.props.setLetterPitch(index, newPitch);
    }

    manualPitchArtClicked() {
        let manualPitch;
        let isValidNumber = false;

        while (!isValidNumber) {
            const msg = `Enter pitch value between ${this.state.minPitch.toFixed(2)}Hz `
                      + `and ${this.state.maxPitch.toFixed(2)}Hz`;

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
                const errorMsg
                    = `${manualPitch}Hz is not between between ${this.state.minPitch.toFixed(2)}Hz `
                    + `and ${this.state.maxPitch.toFixed(2)}Hz`;
                alert(errorMsg);
            }
        }

        this.imageIntervalSelected(
            this.state.minSelectX,
            this.state.maxSelectX,
            manualPitch);
    }

    onAudioImageLoaded(cancelCallback: () => void, selectionCallback: (t1: number, t2: number) => void) {
        this.setState({
            isAudioImageLoaded: true,
            closeImgSelectionCallback: cancelCallback,
            selectionCallback,
        });
    }

    handleInputChange(event: Event) {
        const target = event.target as HTMLInputElement;

        let value: boolean | File | string;
        if (target.type === "checkbox") {
            value = target.checked;
        } else if (target.type === "file") {
            value = target.files![0];
        } else {
            value = target.value;
        }

        const name = target.name;

        this.setState({[name]: value} as any);
    }

    applyPitchRange(minPitch: number, maxPitch: number) {
        const {uploadId} = this.props.match.params;
        const newUrl = CreatePitchArt.formatImageUrl(
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
            minPitch: minPitch || CreatePitchArt.DEFAULT_MIN_ANALYSIS_PITCH,
            maxPitch: maxPitch || CreatePitchArt.DEFAULT_MAX_ANALYSIS_PITCH,
        });
    }

    showAllClicked() {
        const {uploadId} = this.props.match.params;
        const newUrl = CreatePitchArt.formatImageUrl(
            uploadId,
            this.state.minPitch,
            this.state.maxPitch,
            0,
            this.state.soundLength);

        const newAudioUrl = CreatePitchArt.formatAudioUrl(
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
            maxAudioTime: this.state.soundLength,
        });
    }

    imageIntervalToTimeInterval(x1: number, x2: number) {
        const dt = this.state.maxAudioTime - this.state.minAudioTime;
        const dx = this.state.maxAudioX - this.state.minAudioX;
        const u0 = x1 / dx;
        const u1 = x2 / dx;

        const t0 = this.state.minAudioTime + (u0 * dt);
        const t1 = this.state.minAudioTime + (u1 * dt);
        return [t0, t1];
    }

    selectionIntervalClicked() {
        // Compute the new time scale
        const config = this.getAudioConfigForSelection(
            this.state.minSelectX,
            this.state.maxSelectX);

        const {uploadId} = this.props.match.params;
        const newImageUrl = CreatePitchArt.formatImageUrl(
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
            maxAudioTime: config.maxAudioTime,
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
                <div className="metilda-page-header">
                    <h5>Transcribe Audio {title}</h5>
                </div>
                <div className="metilda-page-content">
                    <div className="row">
                        <div className="metilda-audio-analysis-controls-list col s4">
                            <h6 className="metilda-control-header">Audio Analysis</h6>
                            <UploadAudio initFileName={uploadId}/>
                            <PitchRange initMinPitch={this.state.minPitch}
                                        initMaxPitch={this.state.maxPitch}
                                        applyPitchRange={this.applyPitchRange}/>
                            <ExportMetildaTranscribe
                                word={this.props.match.params.uploadId}
                                disabled={this.props.letters.length === 0
                                       || this.props.letters.filter((item) => !item.isWordSep)
                                                            .some((item) => item.syllable === "X")}/>
                        </div>
                        <div className="metilda-audio-analysis col s8">
                            <div>
                                <div className="metilda-audio-analysis-image-container">
                                    {nonAudioImg}
                                    {
                                        uploadId ?
                                            <AudioImg
                                                key={this.state.audioEditVersion}
                                                uploadId={uploadId}
                                                src={this.state.imageUrl}
                                                ref="audioImage"
                                                imageWidth={CreatePitchArt.AUDIO_IMG_WIDTH}
                                                xminPerc={CreatePitchArt.MIN_IMAGE_XPERC}
                                                xmaxPerc={CreatePitchArt.MAX_IMAGE_XPERC}
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
                            width={CreatePitchArt.AUDIO_IMG_WIDTH}
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

const mapStateToProps = (state: AppState) => ({
    letters: state.audio.letters,
});

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, void, AudioAction>) => ({
    addLetter: (newLetter: Letter) => dispatch(addLetter(newLetter)),
    setLetterPitch: (index: number, newPitch: number) => dispatch(setLetterPitch(index, newPitch)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreatePitchArt);
