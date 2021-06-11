import * as queryString from "query-string";
import {ChangeEvent, createRef} from "react";
import * as React from "react";
import {RouteComponentProps} from "react-router";
import Recorder from "recorder-js";
import AudioAnalysis from "../Create/AudioAnalysis";
import PlayerBar from "../PitchArtWizard/AudioViewer/PlayerBar";
import "../PitchArtWizard/GlobalStyling.css";
import PitchArtDrawingWindow from "../PitchArtWizard/PitchArtViewer/PitchArtDrawingWindow";
import {PitchRangeDTO, RawPitchValue} from "../PitchArtWizard/PitchArtViewer/types";
import {Speaker} from "../types/types";
import PitchArtPrevPitchValueToggle from "./PitchArtPrevPitchValueToggle";
import StaticWordSyallableData from "./StaticWordSyallableData";
import {MetildaWord} from "./types";
import "./WordSyllableReview.css";
import { withAuthorization } from "../Session";
import Header from "../Layout/Header";
import {uploadRecording, deleteRecording} from "../Create/ImportUtils";
import {controls, Media, Player} from "react-media-player";
import {spinner} from "../Utils/LoadingSpinner";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import {NotificationManager} from "react-notifications";
import PitchRange from "../PitchArtWizard/AudioViewer/PitchRange";
import PitchArtToggle from "../PitchArtWizard/PitchArtViewer/PitchArtToggle";
import { Slider } from "@material-ui/core";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import wordSyllableService from "./services/WordSyllables";

const {PlayPause, SeekBar} = controls;

interface MatchParams {
    numSyllables: string;
}

export interface Props extends RouteComponentProps<MatchParams> {
    firebase: any;
}

interface RecordingEntity {
    recordingUrl: string;
    itemRef: any;
}

interface State {
    activeWordIndex: number;
    userPitchValueLists: RawPitchValue[][];
    words: MetildaWord[];
    isRecording: boolean;
    isLoadingPitchResults: boolean;
    showPrevPitchValueLists: boolean;
    previousRecordings: RecordingEntity[];
    showRecordingModal: boolean;
    showRecordingConfirmationModal: boolean;
    deleteRecordingModal: boolean;
    deleteRecordingItemRef: any;
    currentRecordingName: string;
    recordingResult: any;
    [key: string]: any;
    showRedDot: boolean;
    prevPitchSliderValue: number;
    prevSpeedSliderValue: number;
    pitchValue: number;
    speedValue: number;
    resetDone: boolean;
}
const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });
export interface DialogTitleProps extends WithStyles<typeof styles> {
    id: string;
    children: React.ReactNode;
    onClose: () => void;
  }
const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
    const { children, classes, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  });

export class WordSyllableReview extends React.Component<Props, State> {
    static get AUDIO_IMG_WIDTH(): number {
        return 653;
    }

    static get DEFAULT_MIN_ANALYSIS_PITCH(): number {
        return 75.0;
    }

    static get DEFAULT_MAX_ANALYSIS_PITCH(): number {
        return 500.0;
    }

    // Amount of time to add at the start and end of a word
    // when playing its audio clip
    static get AUDIO_BUFFER_TIME(): number {
        return 0.2;
    }

    private recorder: any;
    private pitchArtRef = createRef <any> ();

    constructor(props: Props) {
        super(props);
        const values = queryString.parse(this.props.location.search);
        const accentIndex = values.accentIndex;

        this.state = {
            loading: true,
            activeWordIndex: 0,
            userPitchValueLists: [],
            words: [],
            isRecording: false,
            isLoadingPitchResults: false,
            showPrevPitchValueLists: false,
            previousRecordings: [],
            showRecordingModal: false,
            showRecordingConfirmationModal: false,
            deleteRecordingModal: false,
            deleteRecordingItemRef: "",
            recordingResult: "",
            currentRecordingName: "",
            minPitch: WordSyllableReview.DEFAULT_MIN_ANALYSIS_PITCH,
            maxPitch: WordSyllableReview.DEFAULT_MAX_ANALYSIS_PITCH,
            showRedDot: false,
            prevPitchSliderValue: 0,
            prevSpeedSliderValue: 1,
            pitchValue: 0,
            speedValue: 1,
            resetDone: false
        };
    }
    componentDidMount() {
        this.setState({loading: true});
        const values: queryString.ParsedQuery<string> = queryString.parse(this.props.location.search);
        const numSyllables: number = parseFloat(this.props.match.params.numSyllables);
        const accentIndex: number = parseFloat(values.accentIndex as string) + 1;

        wordSyllableService.getWordsBySyllableCount(numSyllables, accentIndex)
            .then((res) => {
                console.log(res.data);
                this.setState({
                    words: res.data,
                    minPitch: res.data[0].minPitch,
                    maxPitch: res.data[0].maxPitch
                });

                this.getPreviousRecordings();
                this.setState({loading: false});
            });

    }
    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.state.activeWordIndex !== prevState.activeWordIndex) {
            this.getPreviousRecordings();
            this.resetSamplePitch();
            this.resetSlider(prevState.activeWordIndex);
            this.toggleChanged("showRedDot", false);
        } else if (prevProps.location.search !== this.props.location.search) {
            this.setState({loading: true});
            const numSyllables: number = parseFloat(this.props.match.params.numSyllables);
            const accentIndex: number = parseFloat(this.props.location.search.slice(-1)) + 1;

            wordSyllableService.getWordsBySyllableCount(numSyllables, accentIndex)
                               .then((res) => {
                                  this.setState({
                                     activeWordIndex: 0,
                                     words: res.data,
                                     minPitch: res.data[0].minPitch,
                                     maxPitch: res.data[0].maxPitch
                                  });
                                  this.getPreviousRecordings();
                                  this.resetSamplePitch();
                                  this.resetSlider(0);
                                  this.toggleChanged("showRedDot", false);
                                  this.setState({loading: false});
                               });

        }
    }
    componentWillUnmount() {
        this.resetSlider(this.state.activeWordIndex);
    }
    
    resetSlider = async (wordIndex: number) => {
        if (this.state.resetDone === false) {
            this.resetPitchSlider(wordIndex);
            this.resetSpeedSlider(wordIndex);
            this.setState({
                resetDone: true,
                pitchValue: 0,
                speedValue: 1,
                prevPitchSliderValue: 0,
                prevSpeedSliderValue: 1,
            });
        }
    }
    resetPitchSlider = async (wordIndex: number) => {
        const letter = this.state.words[wordIndex].letters;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < letter.length; i++) {
            letter[i].pitch -= this.state.prevPitchSliderValue;
        }
    }
    resetSpeedSlider = async (wordIndex: number) => {     
        const letter = this.state.words[wordIndex].letters;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < letter.length; i++) {
            letter[i].t0 *= this.state.speedValue;
            letter[i].t1 *= this.state.speedValue;
        }
    }
    resetSamplePitch = async () => {
        this.setState({
           userPitchValueLists: []
        });
    }
    getPreviousRecordings = async () => {
        this.setState({
            previousRecordings: []
          });
        const recordingWordName = this.state.words[this.state.activeWordIndex].uploadId;
        const storageRef = this.props.firebase.uploadFile();
        const uid = this.props.firebase.auth.currentUser.email;
        const fileRef = storageRef.child(uid + "/Recordings/" + recordingWordName);
        const response = await fileRef.listAll();
        response.items.forEach(async (itemRef: any) => {
             const recordingUrl = await itemRef.getDownloadURL();
             const newRecording = {recordingUrl, itemRef};
             this.setState({
               previousRecordings: [...this.state.previousRecordings, newRecording]
             });
          });
    }
    handleCloseDeleteRecordingModal = () => {
        this.setState({
            deleteRecordingModal: false,
        });
    }
    handleOkDeleteRecordingModal = async () => {
        const responseFromCloud = await deleteRecording(this.state.deleteRecordingItemRef, this.props.firebase);
        const updatedRecordings = this.state.previousRecordings.filter((recording) =>
             recording.itemRef !== this.state.deleteRecordingItemRef);
        this.setState({
            previousRecordings: updatedRecordings,
            deleteRecordingModal: false
        });
    }
    deleteRecordingModal = () => {
        return(
            <Dialog fullWidth={true} maxWidth="sm" open={this.state.deleteRecordingModal}
            onClose={this.handleCloseDeleteRecordingModal}
            aria-labelledby="form-dialog-title">
                 <DialogTitle id="alert-dialog-title" onClose={this.handleCloseDeleteRecordingModal}>
                 Are you sure you want to delete the recording?
                 </DialogTitle>
                <DialogActions>
                <button className="DownloadFile waves-effect waves-light btn globalbtn"
                    onClick={this.handleOkDeleteRecordingModal}>
                        Yes
                </button>
                <button className="DownloadFile waves-effect waves-light btn globalbtn"
                    onClick={this.handleCloseDeleteRecordingModal}>
                        No
                </button>
                </DialogActions>
            </Dialog>
        );
    }
    handleClickDeleteRecordings = (itemRef: any) => {
        this.setState({
            deleteRecordingModal: true,
            deleteRecordingItemRef: itemRef
        });
    }
    renderPreviousRecordings = () => {
        return this.state.previousRecordings.map((recording, index) => {
            const recordingName = recording.itemRef.location.path.split("_");
            return(
                <Media key={index}>
                <div className="media">
                {recordingName[recordingName.length - 1]}
                    <div className="media-player">
                        <Player src={recording.recordingUrl} vendor="audio"/>
                    </div>
                    <div className="media-controls metilda-control-container">
                        <div className="metilda-previous-recordings-image-col-1">
                            <PlayPause/>
                        </div>
                        <div className="metilda-previous-recordings-image-col-2 vert-center">
                            <SeekBar className="no-border"/>
                        </div>
                        <div className="metilda-previous-recordings-image-col-3">
                        <button className="btn-floating btn-small waves-effect waves-light globalbtn"
                        onClick={() => this.handleClickDeleteRecordings(recording.itemRef)}>
                            <i className="material-icons right">delete</i>
                        </button>
                        </div>
                    </div>
                </div>
            </Media>);
        });
    }
    wordClicked = (index: number) => {
        this.setState((prevState) =>
            (
                {
                    activeWordIndex: index,
                    minPitch: prevState.words[index].minPitch,
                    maxPitch: prevState.words[index].maxPitch
                }
            )
        );
    }
    handleCloseRecordingModal = () => {
        this.setState({
            currentRecordingName: "",
            showRecordingModal: false
        });
      }
    onChange = (event: any) => {
        this.setState({ [event.target.name]: event.target.value });
      }
    saveRecordingModal = () => {
        return(
            <Dialog fullWidth={true} maxWidth="xs" open={this.state.showRecordingModal}
            onClose={this.handleCloseRecordingModal}aria-labelledby="form-dialog-title">
                <DialogTitle onClose={this.handleCloseRecordingModal} id="form-dialog-title">
                    Enter recording name</DialogTitle>
                <DialogContent>
                <input className="recordingName" name="currentRecordingName" value={this.state.currentRecordingName}
                onChange={this.onChange} type="text" placeholder="Ex: Recording1.wav" required/>
                </DialogContent>
                <DialogActions>
                    <button className="SaveRecording waves-effect waves-light btn globalbtn"
                    onClick={this.uploadRecording}>
                        <i className="material-icons right">cloud_upload</i>
                        Save
                    </button>
                </DialogActions>
            </Dialog>
        );
    }

    uploadRecording = async () => {
       this.setState({
            showRecordingModal: false
       });
       const numberOfSyllables = this.props.match.params.numSyllables;
       const recordingWordName = this.state.words[this.state.activeWordIndex].uploadId;
       const controller = this;
       if (this.state.currentRecordingName !== "") {
           const updatedRecordingName = this.state.currentRecordingName;
           try {
                controller.setState({
                        isLoadingPitchResults: true
                    });
                const uploadResponse = await uploadRecording(this.state.recordingResult, updatedRecordingName,
                    numberOfSyllables, recordingWordName, this.props.firebase);
                this.getPreviousRecordings();
                    } catch (ex) {
                        console.log(ex);
                    }
           controller.setState({
                        isLoadingPitchResults: false
                    });
                } else {
                NotificationManager.error("Recording not uploaded. Recording name is missing");
                }
       this.setState({
            currentRecordingName: ""
        });
   }
   handleCloseRecordingConfirmationModal = () => {
    this.setState({
        showRecordingConfirmationModal: false
    });
  }
    handleOkRecordingConfirmationModal = () => {
        this.setState({
            showRecordingModal: true,
            showRecordingConfirmationModal: false
        });
    }
    recordingConfirmationModal = () => {
        return(
        <Dialog fullWidth={true} maxWidth="sm" open={this.state.showRecordingConfirmationModal}
        onClose={this.handleCloseRecordingConfirmationModal}
        aria-labelledby="form-dialog-title">
            <DialogTitle id="alert-dialog-title" onClose={this.handleCloseRecordingConfirmationModal}>
                Do you want to save the recording to cloud?
            </DialogTitle>
            <DialogActions>
            <button className="RecordingOption_Yes waves-effect waves-light btn globalbtn"
                onClick={this.handleOkRecordingConfirmationModal}>
                    Yes
            </button>
            <button className="RecordingOption_No waves-effect waves-light btn globalbtn"
                onClick={this.handleCloseRecordingConfirmationModal}>
                    No
            </button>
            </DialogActions>
        </Dialog>
        );
    }

    toggleRecord = async () => {
        const audioClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        const audioContext = new audioClass();

        if (this.recorder == null) {
            this.recorder = new Recorder(audioContext);
            navigator.mediaDevices.getUserMedia({audio: true})
                .then((stream) => this.recorder.init(stream).then(() => this.recorder.start()))
                .catch((err) => console.error("Unable to initiate recording", err));
            this.setState({isRecording: true});
        } else {
            const controller = this;
            const result = await this.recorder.stop();
            const formData = new FormData();
            formData.append("file", result.blob);
            const response = await  fetch(`/api/upload/pitch/range?min-pitch=30.0&max-pitch=300.0`, {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            });
            const data = await response.json();
            const pitchValues: RawPitchValue[] = (data as PitchRangeDTO).pitches.map(
                        (item) => ({t0: item[0], t1: item[0], pitch: item[1]}) as RawPitchValue
                    );
            controller.recorder = null;
            controller.setState(
            {
                    userPitchValueLists: controller.state.userPitchValueLists.concat([pitchValues]),
                    isRecording: false,
            });
            const url = URL.createObjectURL(result.blob);
            const audio = new Audio(url);
            const recording = await audio.play();
            this.setState({
                showRecordingConfirmationModal: true,
                recordingResult: result
            });
        }
    }

    saveImage = () => {
        this.pitchArtRef.current!.saveImage();
    }

    toggleChanged = (inputName: string, isSelected: boolean) => {
        if (inputName === "showRedDot") {
            this.onRedDotClick(isSelected);
        }
        this.setState({[inputName]: isSelected} as any);
    }
    
    onRedDotClick = (isRedDotted: boolean) => {
        if (isRedDotted) {
            this.showRedDot();
        } else {
            this.resetSamplePitch();
        }
    }

    showRedDot = async () => {
        const controller = this;
        const letter = this.state.words[this.state.activeWordIndex].letters;
        const notes: RawPitchValue[] = letter.map(
                (item) => ({t0: item.t0, t1: item.t1, pitch: item.pitch}) as RawPitchValue
            );
        const note: RawPitchValue[] = [];
        let k: number = 0;
        while (k !== notes.length - 1) {
            let t0Start: number = notes[k].t0;
            const t0End: number = notes[k + 1].t0;
            const pitchStart: number = notes[k].pitch;
            const pitchEnd: number = notes[k + 1].pitch;
            const x = t0End - t0Start;
            const y = pitchEnd - pitchStart;
            const m = y / x;
            const interval = x / 10;
            let i: number = notes[k].t0;
            while (i <= t0End) {
                note.push({
                    t0: t0Start, t1: t0Start,
                    pitch: m * (t0Start - t0End) + pitchEnd
                });
                t0Start += interval;
                i += interval;
            }
            note.push({
                t0: t0End, t1: t0End,
                pitch: pitchEnd
            });
            k++;
        }
        controller.setState(
            {
                userPitchValueLists: controller.state.userPitchValueLists.concat([note])
            });
    }

    onSliderChangePitch = (pitch: number) => {
        if (pitch === this.state.prevPitchSliderValue) {
            return;
        }
        this.setState({pitchValue: pitch});
        const letter = this.state.words[this.state.activeWordIndex].letters;
        this.resetPitchSlider(this.state.activeWordIndex);        
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < letter.length; i++) {
            letter[i].pitch += pitch;
        }
        this.setState({prevPitchSliderValue: pitch, resetDone: false});
    }

    onSliderChangeSpeed = (speed: number) => {
        if (speed === this.state.prevSpeedSliderValue) {
            return;
        }
        this.setState({speedValue: speed});
        const letter = this.state.words[this.state.activeWordIndex].letters;
        this.resetSpeedSlider(this.state.activeWordIndex);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < letter.length; i++) {
            letter[i].t0 /= speed;
            letter[i].t1 /= speed;
        }
        this.setState({prevSpeedSliderValue: speed, resetDone: false});
    }    
    
    playPitchArt = () => {
      this.pitchArtRef.current!.playPitchArt();
    }

    saveImageforLearn = () => {
        this.pitchArtRef.current!.saveImageforLearn();
    }

    minPitchArtTime = () => {
        if (this.state.words.length === 0
            || this.state.words[this.state.activeWordIndex].letters.length === 0) {
            return 0;
        }

        return Math.max(
            this.state.words[this.state.activeWordIndex].letters[0].t0 - WordSyllableReview.AUDIO_BUFFER_TIME,
            0);
    }

    maxPitchArtTime = () => {
        if (this.state.words.length === 0
            || this.state.words[this.state.activeWordIndex].letters.length === 0) {
            return 0;
        }

        const numLetters = this.state.words[this.state.activeWordIndex].letters.length;
        return (this.state.words[this.state.activeWordIndex].letters[numLetters - 1].t1
            + WordSyllableReview.AUDIO_BUFFER_TIME);
    }

    pageTitle = () => {
        const syllableStr = `${this.props.match.params.numSyllables} Syllables`;

        const values = queryString.parse(this.props.location.search);
        const accentIndex = parseFloat(values.accentIndex as string);
        let accentSuffix: string = "";

        if (accentIndex === 0) {
            accentSuffix = "st";
        } else if (accentIndex === 1) {
            accentSuffix = "nd";
        } else if (accentIndex === 2) {
            accentSuffix = "rd";
        }

        const accentStr = "Accent " + (accentIndex + 1) + accentSuffix + " syllable";
        return syllableStr + ", " + accentStr;
    }

    clearPrevious = () => {
        this.setState({userPitchValueLists: []});
    }

    handleInputChange = (event: ChangeEvent) => {
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

    applyPitchRange = (minPitch: number, maxPitch: number) => {
        this.setState
        (
            {
                    minPitch,
                    maxPitch
                 }
        );
    }

    render() {

        if (this.state.loading) {
            return (
                <div className="metilda-page-content">
                    Loading...
                </div>
            );
        }

        const speakers: Speaker[] = [
            {uploadId: "", letters: this.state.words[this.state.activeWordIndex].letters}
        ];
        const muiTheme = createMuiTheme({
            overrides: {
                MuiSlider: {
                    thumb: {
                    color: "#2bbbad",
                    height: 15,
                    width: 15,
                    },
                    track: {
                    color: "#2bbbad",
                    height: 8,
                    },
                    rail: {
                    color: "#bef6f1",
                    height: 8,
                    }
                }
            }
        });
        return (
            <div>
                {this.recordingConfirmationModal()}
                {this.saveRecordingModal()}
                {this.deleteRecordingModal()}
                <div className="metilda-page-content">
                    <div className="row">
                        <div className="col s4">
                            <h6 className="metilda-control-header">Word List</h6>
                            <div id="metilda-word-list">
                                <ul className="collection">
                                    {
                                        this.state.words.map((word, index) =>
                                            <li key={"metilda-word-" + index}
                                                className={"collection-item "
                                                        + (index === this.state.activeWordIndex ? "active" : "")}
                                                onClick={() => (this.wordClicked(index))}>
                                                {word.uploadId}
                                            </li>
                                        )
                                    }
                                </ul>
                            </div>
                            <div className="metilda-pitch-art-container-control-list">
                                <PitchRange initMinPitch={this.state.minPitch}
                                        initMaxPitch={this.state.maxPitch}
                                        applyPitchRange={this.applyPitchRange}/>
                            </div>
                            <h6 className="metilda-control-header">Previous Recordings</h6>
                            {this.renderPreviousRecordings()}
                            <h6 className="metilda-control-header">Pitch Art</h6>
                            <div className="metilda-pitch-art-container-control-list col s12">
                                <PitchArtPrevPitchValueToggle
                                    handleInputChange={this.handleInputChange}
                                    showPrevPitchValueLists={this.state.showPrevPitchValueLists}/>
                            </div>
                            <div className="row metilda-pitch-art-container-control-toggle-list">
                                <PitchArtToggle
                                    label = "Show Sample Pitch Tracking"
                                    inputName="showRedDot"
                                    isSelected={this.state.showRedDot}
                                    offText="Hide"
                                    onText="Show"
                                    onChange={this.toggleChanged}
                                />
                            </div>
                            <div className="col metilda-pitch-art-container-control-toggle-list">
                                 <Typography
                                    align="left"
                                    color={"textPrimary"}
                                    id="discrete-slider-small-steps" gutterBottom>
                                    Pitch Level
                                </Typography>
                                <ThemeProvider theme={muiTheme}>
                                    <Slider
                                    defaultValue={0}
                                    aria-labelledby="discrete-slider-small-steps"
                                    valueLabelDisplay="auto"
                                    step={10}
                                    marks={true}
                                    min={-50}
                                    max={50}
                                    onChange={(event, value) => this.onSliderChangePitch(value as number)}
                                    value={this.state.pitchValue}
                                    />
                                </ThemeProvider>
                                <Typography
                                    align="left"
                                    color={"textPrimary"}
                                    id="discrete-slider-small-steps" gutterBottom>
                                    Speed Level
                                </Typography>
                                <ThemeProvider theme={muiTheme}>
                                    <Slider
                                    defaultValue={1}
                                    aria-labelledby="discrete-slider-small-steps"
                                    valueLabelDisplay="auto"
                                    step={0.5}
                                    marks={true}
                                    min={0.5}
                                    max={2}
                                    onChange={(event, value) => this.onSliderChangeSpeed(value as number)}
                                    value={this.state.speedValue}    
                                    />
                                </ThemeProvider>
                            </div>
                        </div>
                        {this.state.isLoadingPitchResults && spinner()}
                        <div className="col s8">
                            <div className="metilda-syllable-pitch-art">
                                {
                                    this.state.words.length >= 1 &&
                                    <PitchArtDrawingWindow
                                        ref={this.pitchArtRef}
                                        showArtDesign={true}
                                        showDynamicContent={true}
                                        width={WordSyllableReview.AUDIO_IMG_WIDTH}
                                        height={600}
                                        minPitch={this.state.minPitch}
                                        maxPitch={this.state.maxPitch}
                                        fileName={this.state.words[this.state.activeWordIndex].uploadId}
                                        setLetterPitch={(x, y, z) => (null)}
                                        showAccentPitch={true}
                                        showSyllableText={true}
                                        showVerticallyCentered={true}
                                        showPitchArtLines={true}
                                        showTimeNormalization={false}
                                        showPitchScale={false}
                                        showPerceptualScale={true}
                                        showLargeCircles={true}
                                        showPitchArtImageColor={true}
                                        showPrevPitchValueLists={this.state.showPrevPitchValueLists}
                                        speakers={speakers}
                                        rawPitchValueLists={this.state.userPitchValueLists}
                                        firebase={this.props.firebase}
                                    />
                                }
                                <PlayerBar audioUrl={AudioAnalysis.formatAudioUrl(
                                    this.state.words[this.state.activeWordIndex].uploadId,
                                    this.minPitchArtTime(),
                                    this.maxPitchArtTime()
                                )}/>
                                <div className="pitch-art-controls-container">
                                    <button className="waves-effect waves-light btn metilda-btn align-left globalbtn"
                                            onClick={this.clearPrevious}
                                            disabled={this.state.isRecording
                                                      || this.state.userPitchValueLists.length === 0}>
                                        Clear
                                    </button>
                                    <div className="pitch-art-btn-container">
                                        <button className="waves-effect waves-light btn metilda-btn globalbtn"
                                                onClick={this.toggleRecord}
                                                disabled={this.state.isLoadingPitchResults}>
                                            {!this.state.isRecording ? "Start Record" : "Stop Record"}
                                            <i className="material-icons right">
                                                record_voice_over
                                            </i>
                                        </button>
                                        <button className="waves-effect waves-light btn metilda-btn globalbtn"
                                                onClick={this.playPitchArt}
                                                disabled={this.state.isRecording}>
                                            <i className="material-icons right">
                                                play_circle_filled
                                            </i>
                                            Play Tones
                                        </button>
                                        <button className="waves-effect waves-light btn metilda-btn globalbtn"
                                                onClick={this.saveImageforLearn}
                                                disabled={this.state.isRecording}>
                                            <i className="material-icons right">
                                                cloud_upload
                                            </i>
                                            Save Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(WordSyllableReview as any);
