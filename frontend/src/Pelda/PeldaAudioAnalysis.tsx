import * as React from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import PlayerBar from "../PitchArtWizard/AudioViewer/PlayerBar";
import "../PitchArtWizard/GlobalStyling.css";
import {AppState} from "../store";
import {addLetter, resetLetters, setLetterPitch, setUploadId} from "../store/audio/actions";
import {AudioAction} from "../store/audio/types";
import {Letter, Speaker} from "../types/types";
import PeldaAudioAnalysisImageMenu from "./PeldaAudioAnalysisImageMenu";
import AudioImg from "../Create/AudioImg";
import AudioImgDefault from "../Create/AudioImgDefault";
import AudioImgLoading from "../Create/AudioImgLoading";
import PeldaUploadAudio from "../Create/UploadAudio";
import {NotificationManager} from "react-notifications";
import "../Create/UploadAudio.css";
import "./PeldaAudioAnalysis.css";

export interface PeldaAudioAnalysisProps {
    speakerIndex: number;
    speakers: Speaker[];
    firebase: any;
    files: any[];
    setUploadId: (speakerIndex: number, uploadId: string, fileIndex: number) => void;
    resetLetters: (speakerIndex: number) => void;
    addLetter: (speakerIndex: number, letter: Letter) => void;
    setLetterPitch: (speakerIndex: number, letterIndex: number, pitch: number) => void;
    parentCallBack: (soundLength: number, minAudioTime: number, maxAudioTime: number,
                     selectStartTime: number, selectEndTime: number, selectedFolderName: string ) => void;
    eafTierDataCallBack: (isTier1Enabled: boolean, tier1text: string, isTier2Enabled: boolean,
                          tier2text: string, isTier3Enabled: boolean, tier3text: string, isTier4Enabled: boolean,
                          tier4text: string, isTier5Enabled: boolean, tier5text: string,
                          isTier6Enabled: boolean, tier6text: string) => void;
}

interface State {
    eafFiles: any[];
    selectedFolderName: string;
    showImgMenu: boolean;
    imgMenuX: number;
    imgMenuY: number;
    isAudioImageLoaded: boolean;
    soundLength: number;
    selectionInterval: string;
    maxPitch: number;
    minPitch: number;
    spectrumChecked: boolean;
    pitchChecked: boolean;
    intensityChecked: boolean;
    formantChecked: boolean;
    pulsesChecked: boolean;
    imageUrl: string;
    audioUrl: string;
    audioEditVersion: number;
    minSelectX: number;
    maxSelectX: number;
    minAudioX: number;
    maxAudioX: number;
    minAudioTime: number;
    maxAudioTime: number;
    minZoomStatus: any[];
    maxZoomStatus: any[];
    audioImgWidth: number;
    selectedEafId: string;
    closeImgSelectionCallback: () => void;
    selectionCallback: (t1: number, t2: number) => void;
}

export class PeldaAudioAnalysis extends React.Component<PeldaAudioAnalysisProps, State> {
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
        return 282.0 / 2800.0;
    }

    static get MAX_IMAGE_XPERC(): number {
        return 2752.0 / 2800.0;
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

    static formatImageUrl(uploadId: string, status: string) {
        let url = `/draw-sound/${uploadId}.png/image`;
        url += status;
        return url;
    }

    static formatAudioUrl(uploadId: string, tmin?: number, tmax?: number) {
        if (tmin !== undefined && tmax !== undefined && tmax !== -1) {
            return `/api/audio/${uploadId}/file?tmin=${tmin}&tmax=${tmax}`;
        } else {
            return `/api/audio/${uploadId}/file`;
        }
    }

    constructor(props: PeldaAudioAnalysisProps) {
        super(props);

        this.state = {
            eafFiles: [],
            selectedFolderName: "Uploads",
            showImgMenu: false,
            imgMenuX: -1,
            imgMenuY: -1,
            isAudioImageLoaded: false,
            soundLength: -1,
            selectionInterval: "Letter",
            maxPitch: PeldaAudioAnalysis.DEFAULT_MAX_ANALYSIS_PITCH,
            minPitch: PeldaAudioAnalysis.DEFAULT_MIN_ANALYSIS_PITCH,
            spectrumChecked: true,
            pitchChecked: true,
            intensityChecked: true,
            formantChecked: false,
            pulsesChecked: false,
            imageUrl: PeldaAudioAnalysis.formatImageUrl(
                this.getSpeaker().uploadId,
                "?spectrogram&pitch&intensity&"),
            audioUrl: PeldaAudioAnalysis.formatAudioUrl(this.getSpeaker().uploadId),
            audioEditVersion: 0,
            minSelectX: -1,
            maxSelectX: -1,
            minAudioX: PeldaAudioAnalysis.MIN_IMAGE_XPERC * PeldaAudioAnalysis.AUDIO_IMG_WIDTH,
            maxAudioX: PeldaAudioAnalysis.MAX_IMAGE_XPERC * PeldaAudioAnalysis.AUDIO_IMG_WIDTH,
            minAudioTime: 0.0,
            maxAudioTime: -1.0,
            minZoomStatus: [],
            maxZoomStatus: [],
            audioImgWidth: (PeldaAudioAnalysis.MAX_IMAGE_XPERC - PeldaAudioAnalysis.MIN_IMAGE_XPERC)
                * PeldaAudioAnalysis.AUDIO_IMG_WIDTH,
            selectedEafId: "-1",
            closeImgSelectionCallback: () => (null),
            selectionCallback: (t1, t2) => (null),
        };
        this.imageIntervalSelected = this.imageIntervalSelected.bind(this);
        this.onAudioImageLoaded = this.onAudioImageLoaded.bind(this);
        this.audioIntervalSelected = this.audioIntervalSelected.bind(this);
        this.audioIntervalSelectionCanceled = this.audioIntervalSelectionCanceled.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.showZoomOutAudio = this.showZoomOutAudio.bind(this);
        this.selectionIntervalClicked = this.selectionIntervalClicked.bind(this);
        this.imageIntervalToTimeInterval = this.imageIntervalToTimeInterval.bind(this);
        this.getAudioConfigForSelection = this.getAudioConfigForSelection.bind(this);
        this.manualPitchChange = this.manualPitchChange.bind(this);
        this.targetPitchSelected = this.targetPitchSelected.bind(this);
    }

    getSpeaker = (): Speaker => {
        return this.props.speakers[this.props.speakerIndex];
    }

    componentDidMount() {
        const uploadId = this.getSpeaker().uploadId;
        if (!uploadId) {
            return;
        }

        const controller = this;
        const request: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        };

        const imageUrl = PeldaAudioAnalysis.formatImageUrl(
            uploadId,
            this.checkStatus());

        const audioUrl = PeldaAudioAnalysis.formatAudioUrl(uploadId);

        fetch(`/api/audio/${uploadId}/duration`, request)
            .then((response) => response.json())
            .then(function(data: any) {
                controller.setState({
                    imageUrl,
                    audioUrl,
                    soundLength: data.duration,
                    maxAudioTime: data.duration,
                });
            });

        try {
            this.getEafFiles();
        } catch (ex) {
            console.log(ex);
        }
    }

    setUploadId = async (uploadId: string, uploadPath: string, fileIndex: number, fileType: string) => {
        if (fileType !== "Folder") {
            const storageRef = this.props.firebase.uploadFile();
            storageRef.child(uploadPath).getDownloadURL().then(async (url: any) => {
                // `url` is the download URL for file
                const response = await fetch(url);
                const responseBlob = await response.blob();
                const formData = new FormData();
                formData.append("file", responseBlob, uploadId);
                const analysisResponse = await fetch(`/api/audio/download-file`, {
                    method: "POST",
                    body: formData,
                });
                this.props.setUploadId(this.props.speakerIndex, uploadId, fileIndex);
                this.props.resetLetters(this.props.speakerIndex);
            }).catch(function(error: any) {
                // return;
            });
        } else {
            await this.setState ({
                selectedFolderName:  uploadId,
            });
            this.sendData();
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

        const newAudioUrl = PeldaAudioAnalysis.formatAudioUrl(
            this.getSpeaker().uploadId,
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
            const letter = this.props.speakers[this.props.speakerIndex].letters[index];
            this.state.selectionCallback(letter.t0, letter.t1);

            const newAudioUrl = PeldaAudioAnalysis.formatAudioUrl(
                this.getSpeaker().uploadId,
                letter.t0,
                letter.t1);

            this.setState({
                audioUrl: newAudioUrl,
            });
        }
        this.sendData();
    }

    audioIntervalSelectionCanceled() {
        const config = this.getAudioConfigForSelection();
        this.setState({
            audioUrl: config.audioUrl,
            minSelectX: -1,
            maxSelectX: -1,
        });
        this.sendData();
    }

    audioIntervalSelected(leftX: number, rightX: number) {
        const config = this.getAudioConfigForSelection(leftX, rightX);
        this.setState({
            audioUrl: config.audioUrl,
            minSelectX: leftX,
            maxSelectX: rightX,
        });
        this.sendData();
    }

    imageIntervalSelected(leftX: number,
                          rightX: number,
                          tsOverride?: number[]) {
        const ts = tsOverride || this.imageIntervalToTimeInterval(leftX, rightX);

        fetch(`/api/audio/${this.getSpeaker().uploadId}/pitch/avg`
            + "?t0=" + ts[0]
            + "&t1=" + ts[1]
            + "&max-pitch=" + this.state.maxPitch
            + "&min-pitch=" + this.state.minPitch, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
        }).then((response) => response.json());

        this.sendData();
    }

    manualPitchChange(index: number, newPitch: number) {
        this.props.setLetterPitch(this.props.speakerIndex, index, newPitch);
    }

    manualPitchArtClicked() {
        let manualPitch: number | undefined;
        let isValidNumber = false;

        while (!isValidNumber) {
            const msg = `Enter pitch value between ${this.state.minPitch.toFixed(2)}Hz `
                + `and ${this.state.maxPitch.toFixed(2)}Hz`;

            const manualPitchStr: string | null = prompt(msg);

            if (manualPitchStr === null) {
                // user cancelled manual input
                this.state.closeImgSelectionCallback();
                return;
            }

            if (manualPitchStr.split("").filter((char) => char === ",").length === 1) {
                try {
                    const values = manualPitchStr.split(",");
                    const t0: number = parseFloat(values[0]);
                    const t1: number = parseFloat(values[1]);
                    this.imageIntervalSelected(
                        -1,
                        -1,
                        [t0, t1]);
                    return;
                } catch {
                    // do nothing
                }
            }

            manualPitch = parseFloat(manualPitchStr);

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
            this.state.maxSelectX
        );
    }

    onAudioImageLoaded(cancelCallback: () => void, selectionCallback: (t1: number, t2: number) => void) {
        this.setState({
            isAudioImageLoaded: true,
            closeImgSelectionCallback: cancelCallback,
            selectionCallback,
        });
        this.sendData();
    }

    showZoomOutAudio() {
        if (this.state.minZoomStatus.length !== 0 && this.state.maxZoomStatus.length !== 0) {
            const minZoomStatusArray = this.state.minZoomStatus;
            const maxZoomStatusArray = this.state.maxZoomStatus;
            const lastMinZoomStatus = minZoomStatusArray.pop();
            const lastMaxZoomStatus = maxZoomStatusArray.pop();

            const newImageUrl = `/draw-sound/${this.getSpeaker().uploadId}/${lastMinZoomStatus}/${lastMaxZoomStatus}`
            + this.checkStatus();

            this.state.closeImgSelectionCallback();

            this.setState({
                imageUrl: newImageUrl,
                minZoomStatus: minZoomStatusArray,
                maxZoomStatus: maxZoomStatusArray,
                minAudioTime: lastMinZoomStatus,
                maxAudioTime: lastMaxZoomStatus,
            });

            this.sendData();
        }
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

        const newImageUrl = `/draw-sound/${this.getSpeaker().uploadId}/${config.minAudioTime}/${config.maxAudioTime}`
            + this.checkStatus();

        if (this.state.minAudioTime !== config.minAudioTime || this.state.maxAudioTime !== config.maxAudioTime) {
            this.setState({
                minZoomStatus: [...this.state.minZoomStatus, this.state.minAudioTime],
                maxZoomStatus: [...this.state.maxZoomStatus, this.state.maxAudioTime],
            });
        }

        this.setState({
            imageUrl: newImageUrl,
            minAudioTime: config.minAudioTime,
            maxAudioTime: config.maxAudioTime,
        });

        this.sendData();
    }

    showImgMenu = (imgMenuX: number, imgMenuY: number) => {
        this.setState({imgMenuX, imgMenuY});
    }

    maybeRenderImgMenu = () => {
        if (this.state.imgMenuX !== -1 && this.state.imgMenuY !== -1) {
            const isSelectionActive = this.state.minSelectX !== -1
                && this.state.maxSelectX !== -1;

            const isAllShown = this.state.minAudioTime === 0
                && this.state.maxAudioTime === this.state.soundLength;

            return (
                <PeldaAudioAnalysisImageMenu
                    imgMenuX={this.state.imgMenuX}
                    imgMenuY={this.state.imgMenuY}
                    isSelectionActive={isSelectionActive}
                    isAllShown={isAllShown}
                    intervalSelected={this.selectionIntervalClicked}
                    showZoomOutAudio={this.showZoomOutAudio}
                    onClick={() => this.showImgMenu(-1, -1)}
                />
            );
        }
    }

    handleSpectrumCheckboxChange = async (event: any) => {
        await this.setState((state) => {
            return {
                spectrumChecked: !this.state.spectrumChecked,
            };
        });
        await this.setState((state) => {
            return {
            imageUrl: PeldaAudioAnalysis.formatImageUrl(
                this.getSpeaker().uploadId,
                this.checkStatus()),
            };
        });
    }

    handlePitchCheckboxChange = async (event: any) => {
        await this.setState((state) => {
            return {
                pitchChecked: !this.state.pitchChecked,
            };
        });
        await this.setState((state) => {
            return {
            imageUrl: PeldaAudioAnalysis.formatImageUrl(
                this.getSpeaker().uploadId,
                this.checkStatus()),
            };
        });
    }

    handleIntensityCheckboxChange = async (event: any) => {
        await this.setState((state) => {
            return {
                intensityChecked: !this.state.intensityChecked,
            };
        });
        await this.setState((state) => {
            return {
            imageUrl: PeldaAudioAnalysis.formatImageUrl(
                this.getSpeaker().uploadId,
                this.checkStatus()),
            };
        });
    }

    handleFormantCheckboxChange = async (event: any) => {
        await this.setState((state) => {
            return {
                formantChecked: !this.state.formantChecked,
            };
        });
        await this.setState((state) => {
            return {
            imageUrl: PeldaAudioAnalysis.formatImageUrl(
                this.getSpeaker().uploadId,
                this.checkStatus()),
            };
        });
    }

    handlePulsesCheckboxChange = async (event: any) => {
        await this.setState((state) => {
            return {
                pulsesChecked: !this.state.pulsesChecked,
            };
        });
        await this.setState((state) => {
            return {
            imageUrl: PeldaAudioAnalysis.formatImageUrl(
                this.getSpeaker().uploadId,
                this.checkStatus()),
            };
        });
    }

    checkStatus = () => {
        let status = "?";
        if (this.state.spectrumChecked) {
            status += "spectrogram&";
        }
        if (this.state.pitchChecked) {
            status += "pitch&";
        }
        if (this.state.intensityChecked) {
            status += "intensity&";
        }
        if (this.state.formantChecked) {
            status += "formants&";
        }
        if (this.state.pulsesChecked) {
            status += "pulses&";
        }
        return status;
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

    sendData = () => {
        const ts = this.imageIntervalToTimeInterval(this.state.minSelectX, this.state.maxSelectX);
        this.props.parentCallBack(this.state.soundLength, this.state.minAudioTime, this.state.maxAudioTime,
            ts[0], ts[1], this.state.selectedFolderName);
    }

    save() {
        window.open(this.state.imageUrl);
    }

    getEafFiles = () => {
        // Get all eaf files related to the selected audio file
        const audioId = this.props.speakers.map((item) => item.fileIndex);
        if (audioId[0] !== null) {
            fetch(`api/get-eaf-files/${audioId[0]}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.result !== null) {
                    this.setState({
                        eafFiles: data.result.map((item: any) => item)
                    });
                }
            });
        }
    }

    getEafFilePath = async () => {
        const request: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        };

        let filePath: string = "";
        await fetch(`/api/get-eaf-file-path/${this.state.selectedEafId}`, request)
            .then((response) => response.json())
            .then(function(eafFilePath: any) {
                filePath = eafFilePath.result;
            });
        return filePath[0];
    }

    downloadEaf = async (filePath: string ) => {
        let eafData: string = "";
        try {
            // Download file from cloud
            const storageRef = this.props.firebase.uploadFile();
            const url = await storageRef.child(filePath).getDownloadURL();
            await fetch(url)
                .then((response) => response.text())
                .then((data) => {
                    eafData = data;
            });
        } catch (ex) {
            console.log(ex);
        }
        return eafData;
    }

    viewEaf = async () => {
        if ( this.state.selectedEafId === "-1" ) {
            NotificationManager.info( "Please select an eaf file to view the annotation details!!");
            return;
        }

        const eafFilePath = await this.getEafFilePath();
        const eafData = await this.downloadEaf(eafFilePath);

        const parser = new DOMParser();
        const xml = parser.parseFromString(eafData, "text/xml");

        if (xml !== null) {
            const tiers = xml.querySelectorAll("TIER");
            let isTier1Enabled: boolean = false;
            let isTier2Enabled: boolean = false;
            let isTier3Enabled: boolean = false;
            let isTier4Enabled: boolean = false;
            let isTier5Enabled: boolean = false;
            let isTier6Enabled: boolean = false;
            let tier1text: string = "";
            let tier2text: string = "";
            let tier3text: string = "";
            let tier4text: string = "";
            let tier5text: string = "";
            let tier6text: string = "";

            if (tiers.length > 0) {
                tiers.forEach((element) => {
                    const annotationElement = element.querySelector("ANNOTATION");
                    if ( annotationElement !== null ) {
                        const alignableAnnotationElement = annotationElement.querySelector("ALIGNABLE_ANNOTATION");
                        if ( alignableAnnotationElement !== null ) {
                            const annotationValueElement = alignableAnnotationElement.querySelector("ANNOTATION_VALUE");
                            if ( annotationValueElement !== null ) {
                                if ( element.getAttribute("TIER_ID") === "default" ) {
                                    tier1text = annotationValueElement.innerHTML;
                                    isTier1Enabled = true;
                                } else if ( element.getAttribute("TIER_ID") === "Tier1" ) {
                                    tier2text = annotationValueElement.innerHTML;
                                    isTier2Enabled = true;
                                } else if ( element.getAttribute("TIER_ID") === "Tier2" ) {
                                    tier3text = annotationValueElement.innerHTML;
                                    isTier3Enabled = true;
                                } else if ( element.getAttribute("TIER_ID") === "Tier3" ) {
                                    tier4text = annotationValueElement.innerHTML;
                                    isTier4Enabled = true;
                                } else if ( element.getAttribute("TIER_ID") === "Tier4" ) {
                                    tier5text = annotationValueElement.innerHTML;
                                    isTier5Enabled = true;
                                } else if ( element.getAttribute("TIER_ID") === "Tier5" ) {
                                    tier6text = annotationValueElement.innerHTML;
                                    isTier6Enabled = true;
                                }
                            }
                        }
                    }
                });
            }

            this.props.eafTierDataCallBack(isTier1Enabled, tier1text, isTier2Enabled, tier2text,
                isTier3Enabled, tier3text, isTier4Enabled, tier4text, isTier5Enabled, tier5text,
                isTier6Enabled, tier6text);
        }
    }

    render() {
        const uploadId = this.getSpeaker().uploadId;

        let nonAudioImg;
        if (!uploadId) {
            nonAudioImg = <AudioImgDefault/>;
        } else if (!this.state.isAudioImageLoaded) {
            nonAudioImg = <AudioImgLoading/>;
        }

        const availableEafFilesList = this.state.eafFiles.map((item, index) => {
            return (
                <option key={index} value={item[0]}>{item[1]}</option>
            );
        });

        return (
            <div className="PeldaAudioAnalysis">
                <div className="row">
                    <br />
                    <div className="PeldaAudioAnalysis-speaker metilda-audio-analysis-controls-list col s5">
                        <PeldaUploadAudio initFileName={uploadId} setUploadId={this.setUploadId}
                         userFiles={this.props.files} firebase={this.props.firebase}/>
                    </div>
                    <div className="PeldaAudioAnalysis-analysis metilda-audio-analysis col s7">
                        <div>
                            <div className="metilda-audio-analysis-image-container">
                                {nonAudioImg}
                                {this.maybeRenderImgMenu()}
                                {
                                    uploadId ?
                                        <AudioImg
                                            key={this.state.audioEditVersion}
                                            uploadId={uploadId}
                                            speakerIndex={this.props.speakerIndex}
                                            src={this.state.imageUrl}
                                            ref="audioImage"
                                            imageWidth={PeldaAudioAnalysis.AUDIO_IMG_WIDTH}
                                            xminPerc={PeldaAudioAnalysis.MIN_IMAGE_XPERC}
                                            xmaxPerc={PeldaAudioAnalysis.MAX_IMAGE_XPERC}
                                            audioIntervalSelected={this.audioIntervalSelected}
                                            audioIntervalSelectionCanceled={this.audioIntervalSelectionCanceled}
                                            onAudioImageLoaded={this.onAudioImageLoaded}
                                            showImgMenu={this.showImgMenu}
                                            minAudioX={this.state.minAudioX}
                                            maxAudioX={this.state.maxAudioX}
                                            minAudioTime={this.state.minAudioTime}
                                            maxAudioTime={this.state.maxAudioTime}/>
                                        : []
                                }
                            </div>
                            {uploadId && <PlayerBar key={this.state.audioUrl} audioUrl={this.state.audioUrl}/>}
                        </div>
                        <div className="checkboxes">
                            <label>
                                <input type="checkbox" id="spectrogram" className="spectrogram"
                                checked={this.state.spectrumChecked} onChange={this.handleSpectrumCheckboxChange} />
                                <span> Spectogram </span> <br />
                            </label>
                            <label>
                                <input type="checkbox" id="pitch"  className="pitch" checked={this.state.pitchChecked}
                                onChange={this.handlePitchCheckboxChange} />
                                <span> Pitch </span> <br />
                            </label>
                            <label>
                                <input type="checkbox" id="intensity" className="intensity"
                                checked={this.state.intensityChecked} onChange={this.handleIntensityCheckboxChange} />
                                <span> Intensity </span> <br />
                            </label>
                            <label>
                                <input type="checkbox" id="formant" className="formant"
                                checked={this.state.formantChecked} onChange={this.handleFormantCheckboxChange} />
                                <span> Formant </span> <br />
                            </label>
                            <label>
                                <input type="checkbox" id="pulses" className="pulses"
                                checked={this.state.pulsesChecked} onChange={this.handlePulsesCheckboxChange} />
                                <span> Pulses </span> <br />
                            </label>
                        </div>
                        <div className="eaf-dropdown">
                            <label className="group-label">EAF File</label>
                            <div className="metilda-audio-analysis-controls-list-item-row">
                                <select id="audioFileInput" value={this.state.selectedEafId}
                                className="eafFileName" placeholder="Choose eaf file"
                                onChange={async (event) => await this.setState( {selectedEafId: event.target.value})}>
                                    <option value={"-1"} disabled>Choose eaf file</option>
                                    {availableEafFilesList}
                                </select>
                            </div>
                            <div className="viewEaf">
                                <button onClick={() => this.viewEaf()} >View Selected EAF</button>
                            </div>
                        </div>
                        <div className="savePrint">
                            <button onClick={() => this.save()} >
                                <i className="material-icons right">
                                    image
                                </i>
                                Save Analysis
                            </button><br /> <br />
                            <button onClick={() => window.print()} >
                                <i className="material-icons right">
                                    picture_as_pdf
                                </i>
                                Print Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    speakers: state.audio.speakers,
});

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, void, AudioAction>) => ({
    setUploadId: (speakerIndex: number, uploadId: string, fileIndex: number) =>
     dispatch(setUploadId(speakerIndex, uploadId, fileIndex)),
    addLetter: (speakerIndex: number, newLetter: Letter) => dispatch(addLetter(speakerIndex, newLetter)),
    resetLetters: (speakerIndex: number) => dispatch(resetLetters(speakerIndex)),
    setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) =>
        dispatch(setLetterPitch(speakerIndex, letterIndex, newPitch))
});

export default connect(mapStateToProps, mapDispatchToProps)(PeldaAudioAnalysis);
