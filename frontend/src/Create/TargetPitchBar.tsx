import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { ThunkDispatch } from "redux-thunk";
import { AppState } from "../store";
import {
  removeLetter,
  resetLetters,
  setLetterSyllable,
  setLetterTime,
  setLatestAnalysisId,
  setSpeaker,
  setUploadId,
} from "../store/audio/actions";
import $ from "jquery";
import { AudioAction } from "../store/audio/types";
import { Letter, Speaker } from "../types/types";
import AudioLetter from "./AudioLetter";
import fileDownload from "js-file-download";
import FileReaderInput, { Result } from "react-file-reader-input";
import {
  uploadAnalysis,
  updateAnalysis,
  importSpeakerFile,
} from "./ImportUtils";
import { SyntheticEvent } from "react";
import ReactGA from "react-ga";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from "@material-ui/core/styles";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { NotificationManager } from "react-notifications";
import UpdateSyllable from "./UpdateSyllable";
import './TargetPitchBar.scss';

//import SaveAnalysisFireStore from "./SaveAnalysisFirestore";

export interface TargetPitchBarProps {
  letters: any;
  files: any;
  speakers: Speaker[];
  speakerIndex: number;
  minAudioTime: number;
  maxAudioTime: number;
  minAudioX: number;
  maxAudioX: number;
  firebase: any;
  targetPitchSelected: (letterIndex: number) => void;
  removeLetter: (speakerIndex: number, index: number, indices?:number[]) => void;
  resetLetters: (speakerIndex: number) => void;
  setUploadId: (
    speakerIndex: number,
    uploadId: string,
    fileIndex: number
  ) => void;
  setLetterSyllable: (
    speakerIndex: number,
    index: number,
    syllable: string
  ) => void;
  setLetterTime: (
    speakerIndex: number,
    index: number,
    t0: number,
    t1: number
  ) => void;
  setLatestAnalysisId: (
    speakerIndex: number,
    latestAnalysisId: number,
    latestAnalysisName: string,
    lastUploadedLetters: Letter[]
  ) => void;
  setSpeaker: (speakerIndex: number, speaker: Speaker) => void;
}

interface State {
  selectedIndex: number;
  showNewAnalysisModal: boolean;
  showExistingAnalysisModal: boolean;
  showEditSyllableModal: boolean;
  showDeleteLetterModal:boolean;
  currentAnalysisName: string;
  currentSyllable: string;
  currentSyllableT0: number;
  [key: string]: any;
  isContourElementsSelectionActive:boolean;
  selectedContourIndexes:number[];
}

interface PitchBarLetter extends Letter {
  isShown: boolean;
  leftX: number;
  rightX: number;
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
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

export class TargetPitchBar extends Component<TargetPitchBarProps, State> {
  private metildaSyllableBarRef;
  private selectionOverlay;
  private isDragging;
  private initialX;
  private initialY;
  private selectedContourElements;
  constructor(props: TargetPitchBarProps) {
    super(props);
    this.state = {
      selectedIndex: -1,
      showNewAnalysisModal: false,
      showExistingAnalysisModal: false,
      showEditSyllableModal: false,
      showDeleteLetterModal:false,
      currentAnalysisName: "",
      currentSyllable: "",
      currentSyllableT0: 0,
      isContourElementsSelectionActive:false,
      selectedContourIndexes:[],
    };
    this.timeCoordToImageCoord = this.timeCoordToImageCoord.bind(this);
    this.targetPitchSelected = this.targetPitchSelected.bind(this);
    this.scaleIntervals = this.scaleIntervals.bind(this);
    this.removeLetterEvent = this.removeLetterEvent.bind(this);
    this.resetAllLettersEvent = this.resetAllLettersEvent.bind(this);
    this.setLetterSyllableEvent = this.setLetterSyllableEvent.bind(this);
    this.setLetterTimeEvent = this.setLetterTimeEvent.bind(this);
    this.metildaSyllableBarRef = React.createRef();
    this.selectionOverlay = React.createRef();
    this.isDragging = false;
    this.initialX = 0;
    this.initialY = 0;
    this.selectedContourElements = [];
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
  }

  resetAllLettersEvent() {
    this.props.resetLetters(this.props.speakerIndex);
  }

  timeCoordToImageCoord(t: number) {
    // clip times that lie beyond the image boundaries
    if (t < this.props.minAudioTime) {
      return 0;
    } else if (t > this.props.maxAudioTime) {
      return this.props.maxAudioX - this.props.minAudioX;
    }

    const dt = this.props.maxAudioTime - this.props.minAudioTime;
    const u0 = (t - this.props.minAudioTime) / dt;

    const dx = this.props.maxAudioX - this.props.minAudioX;
    const x0 = u0 * dx;

    return x0;
  }

  scaleIntervals(): PitchBarLetter[] {
    // Scale letter intervals to be within the range [0, 1], where
    // 0 is the left side of the selection interval and 1 is the right
    // side of the selection interval.
    const controller = this;
    const intervalsInSelection: PitchBarLetter[] = this.props.speakers[
      this.props.speakerIndex
    ].letters.map(function (item: Letter) {
      const pitchBarLetter: PitchBarLetter = Object.assign(
        { leftX: -1, rightX: -1, isShown: false },
        item
      );
      const tooFarLeft = pitchBarLetter.t1 < controller.props.minAudioTime;
      const tooFarRight = pitchBarLetter.t0 > controller.props.maxAudioTime;
      pitchBarLetter.isShown = !(tooFarLeft || tooFarRight);
      return pitchBarLetter;
    });

    // Since the letters are relatively positioned, we need to decrement
    // their positions based on all previous letters' widths.
    let prevLetterWidths = 0.0;
    return intervalsInSelection.map(function (item) {
      if (!item.isShown) {
        return item;
      }

      const itemCopy = Object.assign({}, item);
      itemCopy.leftX =
        controller.timeCoordToImageCoord(itemCopy.t0) - prevLetterWidths;
      itemCopy.rightX =
        controller.timeCoordToImageCoord(itemCopy.t1) - prevLetterWidths;

      prevLetterWidths += itemCopy.rightX - itemCopy.leftX;

      // transform letter interval into new time scale
      // clip boundaries to prevent overflow
      return itemCopy;
    });
  }

  targetPitchSelected(letterIndex: number) {
    this.setState({ selectedIndex: letterIndex });
    this.props.targetPitchSelected(letterIndex);
  }

  removeLetterEvent() {
    this.props.removeLetter(this.props.speakerIndex, this.state.selectedIndex);
    this.setState({ selectedIndex: -1 });
    this.props.targetPitchSelected(-1);
    this.handleCloseDeleteLetterModal();
  }

  removeGroupOfLettersEvent = () =>{
    const letters = this.props.speakers[this.props.speakerIndex].letters;
    const selectedletter = letters[this.state.selectedIndex];
    const matchingIndices = letters.map((letter, index) =>{
      if(letter.isContour){
        const contourRange = letter.contourGroupRange;
        return (contourRange[0] == selectedletter.contourGroupRange[0] && 
        contourRange[1] == selectedletter.contourGroupRange[1])? index : null;
      }
      return null;
    } ).filter((index) => index != null);
    this.props.removeLetter(this.props.speakerIndex, -1, matchingIndices);
    this.setState({ selectedIndex: -1 });
    this.props.targetPitchSelected(-1);
    this.handleCloseDeleteLetterModal();

  }

  setLetterSyllableEvent() {
    let isValidInput = false;
    let syllable = "";

    while (!isValidInput) {
      const response = prompt("Enter syllable text", "X");

      if (response == null) {
        // user canceled input
        return;
      }

      syllable = response.trim();
      if (syllable.length === 0) {
        NotificationManager.error(
          "Syllable should contain at least one character"
        );
      } else {
        isValidInput = true;
      }
    }

    this.props.setLetterSyllable(
      this.props.speakerIndex,
      this.state.selectedIndex,
      syllable
    );
    this.setState({ selectedIndex: -1 });
    this.props.targetPitchSelected(-1);
  }

  setLetterTimeEvent() {
    let isValidInput = false;
    const time =
      this.props.letters[this.props.speakerIndex].letters[
        this.state.selectedIndex
      ].t0;
    let newTime = 0;
    while (!isValidInput) {
      const response = prompt("Enter time ", time.toString());

      if (response == null) {
        // user canceled input
        return;
      }

      newTime = parseFloat(response);
      if (newTime === 0) {
        NotificationManager.error("Please enter a number greater than 0.");
      } else {
        isValidInput = true;
      }
    }
    this.props.setLetterTime(
      this.props.speakerIndex,
      this.state.selectedIndex,
      newTime,
      0
    );
    this.setState({ selectedIndex: -1 });
    this.props.targetPitchSelected(-1);
  }

  // Edit Syllable Modal
  editSyllableModal = () => {
    if (this.state.showEditSyllableModal) {
      return (
        <UpdateSyllable
          showEditSyllableModal={this.state.showEditSyllableModal}
          currentSyllable={
            this.props.letters[this.props.speakerIndex].letters[
              this.state.selectedIndex
            ].syllable
          }
          currentT0={
            this.props.letters[this.props.speakerIndex].letters[
              this.state.selectedIndex
            ].t0
          }
          currentT1={
            this.props.letters[this.props.speakerIndex].letters[
              this.state.selectedIndex
            ].t1
          }
          saveSyllable={this.saveSyllable}
          handleClose={this.handleCloseEditSyllableModal}
        ></UpdateSyllable>
      );
    }
  };

  saveSyllable = (syllable: string, t0: number, t1: number): void => {
    this.props.setLetterSyllable(
      this.props.speakerIndex,
      this.state.selectedIndex,
      syllable
    );
    this.props.setLetterTime(
      this.props.speakerIndex,
      this.state.selectedIndex,
      t0,
      t1
    );
    this.setState({ showEditSyllableModal: false });
  };

  editSyllableEvent = () => {
    this.setState({
      showEditSyllableModal: true,
    });
  };

  removeSyllableEvent = () =>{
    const letters = this.props.speakers[this.props.speakerIndex].letters;
    if(this.state.selectedContourIndexes.length > 0 && this.state.isContourElementsSelectionActive){
    
      this.props.removeLetter(this.props.speakerIndex, -1, this.state.selectedContourIndexes);
      this.removeContourSelection();
      this.setState({
        isContourElementsSelectionActive:false,
        selectedContourIndexes:[],
      });
      return;
    }
    
    const letter = letters[this.state.selectedIndex];
    if(letter != null && letter.isContour){
      this.setState({
        showDeleteLetterModal: true,
      });
    }else{
      this.removeLetterEvent();
    }

  }
  handleCloseDeleteLetterModal= ()=>{
    if(this.state.showDeleteLetterModal){
      this.setState({
        showDeleteLetterModal: false,
      });
    } 
  }

  removeLetterEventModal = () => {
    const speaker = this.props.speakers[this.props.speakerIndex];
    return (
      <Dialog
        fullWidth={true}
        maxWidth="sm"
        open={this.state.showDeleteLetterModal}
        onClose={this.handleCloseDeleteLetterModal}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle
          id="alert-dialog-title"
          onClose={this.handleCloseDeleteLetterModal}
        >
          Remove single pulse or group of pulses
        </DialogTitle>
        <DialogActions>
          <button
            className="single-syllable waves-effect waves-light btn globalbtn"
            onClick={this.removeLetterEvent}
          >
            Single pulse
          </button>
          <button
            className="group-syllables waves-effect waves-light btn globalbtn"
            onClick={this.removeGroupOfLettersEvent}
          >
            Group of pulses
          </button>
        </DialogActions>
      </Dialog>
    );
  };

  handleCloseEditSyllableModal = () => {
    this.setState({
      showEditSyllableModal: false,
    });
  };

  handleCloseExistingAnalysis = () => {
    this.setState({
      showExistingAnalysisModal: false,
    });
  };

  downloadAnalysis = () => {
    const speaker = this.props.speakers[this.props.speakerIndex];
    const metildaWord = {
      uploadId: speaker.uploadId,
      letters: speaker.letters,
    } as Speaker;
    const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
    const fileName = `Speaker${this.props.speakerIndex + 1}_${timeStamp}.json`;
    fileDownload(JSON.stringify(metildaWord, null, 2), fileName);
  };

  saveAnalysis = async () => {
    ReactGA.event({
      category: "Save Analysis",
      action: "User pressed Save Analysis button",
    });
    const speaker = this.props.speakers[this.props.speakerIndex];
    const metildaWord = {
      uploadId: speaker.uploadId,
      letters: speaker.letters,
    } as Speaker;
    let matchingFile = [];
    if (speaker.fileIndex === undefined) {
      matchingFile = this.props.files.filter(
        (currentRow: any) => currentRow.name === speaker.uploadId
      );
      // Check if the upload id from the analysis file loaded using 'Open' option
      // matches any of the existing files
      if (matchingFile.length === 0) {
        NotificationManager.error("Please select file before saving analysis");
        return;
      } else {
        this.props.setUploadId(
          this.props.speakerIndex,
          speaker.uploadId,
          matchingFile[0][0]
        );
      }
    }
    if (
      speaker.latestAnalysisId !== null &&
      speaker.latestAnalysisId !== undefined &&
      speaker.latestAnalysisName != null
    ) {
      if (
        JSON.stringify(speaker.letters) ===
        JSON.stringify(speaker.lastUploadedLetters)
      ) {
        NotificationManager.info("Analysis already saved");
      } else {
        this.setState({
          showExistingAnalysisModal: true,
        });
      }
    } else {
      this.setState({
        showNewAnalysisModal: true,
      });
    }
  };

  deletePreviousImages = async (latestAnalysisId: any, firebase: any) => {
    const imageResponse = await fetch(
      `/api/get-image-for-analysis/${latestAnalysisId.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );
    const imageBody = await imageResponse.json();
    const storageRef = firebase.uploadFile();
    imageBody.result.forEach(async (image: any) => {
      // Delete image from cloud
      const imagePath = image[2];
      const imageRef = storageRef.child(imagePath);
      const responseFromCloud = imageRef.delete();
      // Delete image from DB
      const formData = new FormData();
      formData.append("image_id", image[0]);
      const response = await fetch(`/api/delete-image`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });
    });
  };

  deletePreviousAnalysis = (analysisId: number) => {
    fetch(`api/get-analysis-file-path/${analysisId.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const storageRef = this.props.firebase.uploadFile();
        const fileRef = storageRef.child(data.result[0]);
        // Delete the file
        fileRef.delete().then(function () {
          // File deleted successfully!
        });
      });
  };

  handleCloseNewAnalysis = () => {
    this.setState({
      currentAnalysisName: "",
      showNewAnalysisModal: false,
    });
  };

  onChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  saveNewAnalysisModal = () => {
    return (
      <Dialog
        fullWidth={true}
        maxWidth="xs"
        open={this.state.showNewAnalysisModal}
        onClose={this.handleCloseNewAnalysis}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle
          onClose={this.handleCloseNewAnalysis}
          id="form-dialog-title"
        >
          Enter analysis name
          <br />
          (Supported Formats: json)
        </DialogTitle>
        <DialogContent>
          <input
            className="analysisName"
            name="currentAnalysisName"
            value={this.state.currentAnalysisName}
            onChange={this.onChange}
            type="text"
            placeholder={'Ex: "Analysis1.json" or "Analysis1"'}
            required
          />
        </DialogContent>
        <DialogActions>
          <button
            className="SaveAnalysis waves-effect waves-light btn globalbtn"
            onClick={this.uploadAnalysis}
          >
            <i className="material-icons right">cloud_upload</i>
            Save
          </button>
        </DialogActions>
      </Dialog>
    );
  };

  handleNoExistingAnalysis = () => {
    this.setState({
      showNewAnalysisModal: true,
      showExistingAnalysisModal: false,
    });
  };

  handleOkExistingAnalysis = async () => {
    const speaker = this.props.speakers[this.props.speakerIndex];
    const metildaWord = {
      uploadId: speaker.uploadId,
      letters: speaker.letters,
    } as Speaker;
    if (
      speaker.latestAnalysisId !== null &&
      speaker.latestAnalysisId !== undefined &&
      speaker.latestAnalysisName != null
    ) {
      this.deletePreviousAnalysis(speaker.latestAnalysisId);
      const data = await updateAnalysis(
        metildaWord,
        speaker.latestAnalysisName,
        speaker.latestAnalysisId,
        this.props.firebase
      );
      const response = this.deletePreviousImages(
        speaker.latestAnalysisId,
        this.props.firebase
      );
      this.props.setLatestAnalysisId(
        this.props.speakerIndex,
        speaker.latestAnalysisId,
        speaker.latestAnalysisName,
        speaker.letters
      );
    }
    this.setState({
      showExistingAnalysisModal: false,
    });
  };

  saveExisitingAnalysisModal = () => {
    const speaker = this.props.speakers[this.props.speakerIndex];
    return (
      <Dialog
        fullWidth={true}
        maxWidth="sm"
        open={this.state.showExistingAnalysisModal}
        onClose={this.handleCloseExistingAnalysis}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle
          id="alert-dialog-title"
          onClose={this.handleCloseExistingAnalysis}
        >
          Do you want to save this to the existing analysis{" "}
          {speaker.latestAnalysisName}
        </DialogTitle>
        <DialogActions>
          <button
            className="DownloadFile waves-effect waves-light btn globalbtn"
            onClick={this.handleOkExistingAnalysis}
          >
            Yes
          </button>
          <button
            className="DownloadFile waves-effect waves-light btn globalbtn"
            onClick={this.handleNoExistingAnalysis}
          >
            No
          </button>
        </DialogActions>
      </Dialog>
    );
  };

  evalFileName = (name: string): string => {
    const startsWithDot: boolean = name.startsWith(".");
    const isEmpty: boolean = name.length === 0;
    const tooManyDots: boolean = name.indexOf(".") !== name.lastIndexOf(".");
    const invalidFileFormat: boolean =
      name.includes(".") && name.slice(name.indexOf(".")) !== ".json";

    const baseMessage: string = "Analysis not uploaded. ";
    if (startsWithDot) {
      return baseMessage + "File name cannot start with a '.'";
    } else if (isEmpty) {
      return baseMessage + "Analysis name is missing";
    } else if (tooManyDots) {
      return (
        baseMessage +
        "Analysis name can only have one dot to specify file extension"
      );
    } else if (invalidFileFormat) {
      return baseMessage + "Unsupported file format";
    } else {
      return "ok";
    }
  };

  uploadAnalysis = async () => {
    this.setState({
      showNewAnalysisModal: false,
    });
    const speaker = this.props.speakers[this.props.speakerIndex];
    const metildaWord = {
      uploadId: speaker.uploadId,
      letters: speaker.letters,
    } as Speaker;
    const matchingFile = this.props.files.filter(
      (currentRow: any) => currentRow.name === speaker.uploadId
    );
    const fileStatus: string = this.evalFileName(
      this.state.currentAnalysisName
    );
    if (fileStatus === "ok") {
      const updatedAnalysisName = this.state.currentAnalysisName.trim();
      const fileIndex =
        speaker.fileIndex !== undefined
          ? speaker.fileIndex
          : matchingFile[0][0];
      const data = await uploadAnalysis(
        metildaWord,
        fileIndex,
        updatedAnalysisName,
        this.props.firebase
      );
      this.props.setLatestAnalysisId(
        this.props.speakerIndex,
        data,
        updatedAnalysisName,
        speaker.letters
      );
    } else {
      NotificationManager.error(fileStatus);
    }

    this.setState({
      currentAnalysisName: "",
    });
  };

  fileSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
    results: Result[]
  ) => {
    importSpeakerFile(results, this.props.speakerIndex, this.props.setSpeaker);
  };

  checkIfSpeakerImportIsOk = (event: SyntheticEvent) => {
    if (this.props.speakers[this.props.speakerIndex].letters.length === 0) {
      return;
    }
    const isOk: boolean = window.confirm(
      "The current speaker will be reset.\n\n" + "Do you want to continue?"
    );

    if (!isOk) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  handleMouseDown = (event) => {
    event.preventDefault();
    if (event.button === 0) {
      const { metildaSyllableBarRef } = this;
      const containerRect = this.metildaSyllableBarRef.current.getBoundingClientRect();

      const initialX = event.clientX - containerRect.left;
      const initialY = event.clientY - containerRect.top;


      this.isDragging = true;
      this.initialX = initialX;
      this.initialY = initialY;

      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
      document.addEventListener('click', this.handleDocumentClick);
    }
  };
  
  handleDocumentClick = (event) => {
    
    if (this.state.isContourElementsSelectionActive) {
      const { clientX, clientY } = event;
      const containerRect = this.selectionOverlay.current.getBoundingClientRect();

      // check if the click event is performed inside selection
      if(clientX >= containerRect.left && clientX  <= containerRect.right 
        && clientY >= containerRect.top && clientY <= containerRect.bottom){
        return;
      }
      this.removeContourSelection();
      document.removeEventListener('click', this.handleDocumentClick);
      // Remove the selection
      this.setState({
        isContourElementsSelectionActive:false,
        selectedContourIndexes:[],
      });
    }
  };

  handleMouseMove = (event) => {
    if (this.isDragging) {
      const initialX = this.initialX;
      const initialY = this.initialY;
      const { clientX, clientY } = event;
     

      const containerRect = this.metildaSyllableBarRef.current.getBoundingClientRect();
      const currentX = clientX - containerRect.left;
      const currentY = clientY - containerRect.top;

      // Determine the selected area
      const minX = Math.min(initialX, currentX);
      const maxX = Math.max(initialX, currentX);
      // const minY = Math.min(initialY, currentY);
      // const maxY = Math.max(initialY, currentY);


      const selectionOverlay = this.selectionOverlay.current;
      if (selectionOverlay) {
        selectionOverlay.classList.add('selection-highlight');
        selectionOverlay.style.display = "block";
        selectionOverlay.style.left = `${initialX + containerRect.left}px`;  // Set left position
       // selectionOverlay.style.top = `${containerRect.top - scrollTop}px`;    // Set top position
        selectionOverlay.style.width = `${Math.abs(currentX - initialX)}px`; // Set width 
        selectionOverlay.style.height = `${containerRect.bottom - containerRect.top}px`; // Set height
      }

      let el = $(this.metildaSyllableBarRef.current);
      const childElements =  el.children();
      let selectedElements = [];
      if(childElements.length != 0){
        for(let i=0;i<childElements.length;i++){
          if(childElements[i].classList.contains('selection')) continue;
          const boundingRect = childElements[i].getBoundingClientRect();
          const childLeft =  boundingRect.left - containerRect.left + (boundingRect.width/2);
          const childRight = boundingRect.right - containerRect.left;
          const isInsideX = childLeft <= maxX && childRight >= minX;
          const isInsideY = boundingRect.top <= clientY && clientY <= boundingRect.bottom;
          if(isInsideX && isInsideY) selectedElements.push(childElements[i]);
        }
      }
    
      if(selectedElements.length > 0){
        const indexes = selectedElements.reduce((acc,element) =>{return acc.concat(element.id)},[]);
        
        const letters = this.props.speakers[this.props.speakerIndex].letters;
        let allAreContour = true;
        for (let i = 0; i < indexes.length; i++) {
          const idx = indexes[i];
          if (!letters[idx].isContour) {
            allAreContour = false;
            break;
          }
        }
        if(allAreContour){
          this.selectedContourElements = indexes;
        }else{
          this.selectedContourElements = [];
        }
      }else{
        this.selectedContourElements = [];
      }

      console.log("this.selectedContourElements :: ", this.selectedContourElements);
    }
  };

  handleMouseUp = (event) => {
    event.stopPropagation();
    event.preventDefault();
    this.isDragging = false;
    this.initialX = 0;
    this.initialY = 0;
    
    if(this.selectedContourElements.length > 0){
      this.selectedContourElements = this.selectedContourElements.map((ele) => parseInt(ele));
      this.setState({
        isContourElementsSelectionActive:true,
        selectedContourIndexes:this.selectedContourElements,
      });
    }else{
      this.removeContourSelection();
    }
    // Remove event listeners for mousemove and mouseup
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  };

  removeContourSelection = () =>{
    const selectionOverlay = this.selectionOverlay.current;
      if (selectionOverlay) {
        selectionOverlay.classList.remove('selection-highlight');
        selectionOverlay.style.display = "none";
      }
  };

  render() {
    const controller = this;
    const letters = this.scaleIntervals();
    const speaker = this.props.speakers[this.props.speakerIndex];
    return (
      <div className="TargetPitchBar">
        {this.saveNewAnalysisModal()}
        {this.saveExisitingAnalysisModal()}
        {this.editSyllableModal()}
        {this.removeLetterEventModal()}
        <div className="metilda-control-container metilda-target-pitch-bar">
          <div className="metilda-audio-analysis-image-col-1">
            <span>Syllables</span>
          </div>
          <div className="metilda-audio-analysis-image-col-2 metilda-audio-analysis-letter-container"
            ref={this.metildaSyllableBarRef}
            onMouseDown={this.handleMouseDown}
            >
            <div ref ={this.selectionOverlay} className="selection"></div>
            {letters.map(function (item, index) {
              if (!item.isShown) {
                return;
              }

              return (
                <AudioLetter
                  key={index}
                  index={index}
                  letter={item.syllable}
                  leftX={item.leftX}
                  rightX={item.rightX}
                  isSelected={index === controller.state.selectedIndex}
                  isWordSep={item.isWordSep}
                  onClick={() => controller.targetPitchSelected(index)}
                />
              );
            })}
          </div>
        </div>
        {/* <div ref ={this.selectionOverlay} className="selection"></div> */}
        <div className="TargetPitchBarElements">
          <div className="btn-group-analysis-controls">
            <button
              className="TargetPitchBar-edit-syllable btn globalbtn waves-effect waves-light"
              type="submit"
              name="action"
              disabled={this.state.selectedIndex === -1}
              onClick={this.editSyllableEvent}
            >
              Edit Syllable
            </button>
            {/* <button className="TargetPitchBar-set-syllable btn globalbtn waves-effect waves-light"
                            type="submit"
                            name="action"
                            disabled={this.state.selectedIndex === -1}
                            onClick={this.setLetterSyllableEvent}>
                        Set Syllable
                    </button>
                    <button className="TargetPitchBar-set-time btn globalbtn waves-effect waves-light"
                            type="submit"
                            name="action"
                            disabled={this.state.selectedIndex === -1}
                            onClick={this.setLetterTimeEvent}>
                        Set Time
                    </button> */}
            <button
              className="TargetPitchBar-remove-letter btn globalbtn waves-effect waves-light"
              type="submit"
              name="action"
              disabled={this.state.selectedIndex === -1 && !this.state.isContourElementsSelectionActive}
              onClick={this.removeSyllableEvent}
            >
              Remove
            </button>
            <button
              className="TargetPitchBar-clear-letter btn globalbtn waves-effect waves-light"
              type="submit"
              name="action"
              disabled={speaker.letters.length === 0}
              onClick={this.resetAllLettersEvent}
            >
              Clear
            </button>
          </div>
          <div className="btn-group-file-controls">
            <button
              onClick={this.checkIfSpeakerImportIsOk}
              className="TargetPitchBar-open-analysis btn globalbtn waves-effect waves-light m-r-16"
            >
              <FileReaderInput as="binary" onChange={this.fileSelected}>
                Open
              </FileReaderInput>
            </button>
            <button
              className="TargetPitchBar-save-analysis btn globalbtn waves-effect waves-light m-r-16"
              type="submit"
              name="action"
              disabled={speaker.letters.length === 0}
              onClick={this.saveAnalysis}
            >
              Save
            </button>
            <button
              className="TargetPitchBar-download-analysis btn globalbtn waves-effect waves-light"
              type="submit"
              name="action"
              disabled={speaker.letters.length === 0}
              onClick={this.downloadAnalysis}
            >
              Download
            </button>
            {/* <SaveAnalysisFireStore analysis={speaker} /> */}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  speakers: state.audio.speakers,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, void, AudioAction>
) => ({
  removeLetter: (speakerIndex: number, index: number, indices?:number[]) =>
    dispatch(removeLetter(speakerIndex, index, indices)),
  resetLetters: (speakerIndex: number) => dispatch(resetLetters(speakerIndex)),
  setUploadId: (speakerIndex: number, uploadId: string, fileIndex: number) =>
    dispatch(setUploadId(speakerIndex, uploadId, fileIndex)),
  setLetterSyllable: (speakerIndex: number, index: number, syllable: string) =>
    dispatch(setLetterSyllable(speakerIndex, index, syllable)),
  setLetterTime: (
    speakerIndex: number,
    index: number,
    newT0: number,
    newT1: number
  ) => dispatch(setLetterTime(speakerIndex, index, newT0, newT1)),
  setLatestAnalysisId: (
    speakerIndex: number,
    latestAnalysisId: number,
    latestAnalysisName: string,
    lastUploadedLetters: Letter[]
  ) =>
    dispatch(
      setLatestAnalysisId(
        speakerIndex,
        latestAnalysisId,
        latestAnalysisName,
        lastUploadedLetters
      )
    ),
  setSpeaker: (speakerIndex: number, speaker: Speaker) =>
    dispatch(setSpeaker(speakerIndex, speaker)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TargetPitchBar);
