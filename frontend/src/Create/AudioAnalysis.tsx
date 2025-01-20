import * as React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AppState } from "../store";
import { NotificationManager } from "react-notifications";

import AudioAnalysisImageMenu from "./AudioAnalysisImageMenu";
import AudioImg from "./AudioImg";
import AudioImgDefault from "./AudioImgDefault";
import AudioImgLoading from "./AudioImgLoading";
import PitchRange from "../PitchArtWizard/AudioViewer/PitchRange";
import PlayerBar from "../PitchArtWizard/AudioViewer/PlayerBar";
import { PitchRangeDTO } from "../PitchArtWizard/PitchArtViewer/types";
import SpeakerControl from "./SpeakerControl";
import TargetPitchBar from "./TargetPitchBar";
import UploadAudio from "./UploadAudio";
import {
  addLetter,
  addSpeaker,
  removeSpeaker,
  setSpeakerName,
  setWord,
  setWordTranslation,
  setWordTime,
  resetLetters,
  setLetterPitch,
  setUploadId,
} from "../store/audio/actions";
import { AudioAction } from "../store/audio/types";
import { Letter, Speaker } from "../types/types";
import * as DEFAULT from "../constants/create";

import "./UploadAudio.css";
import "./AudioAnalysis.css";
import { isTypeFlagSet } from "tslint";

export interface AudioAnalysisProps {
  speakerIndex: number;
  speakers: Speaker[];
  firebase: any;
  files: any[];
  maxPitch: number;
  minPitch: number;
  addSpeaker: () => void;
  removeSpeaker: (speakerIndex: number) => void;
  setUploadId: (
    speakerIndex: number,
    uploadId: string,
    fileIndex: number
  ) => void;
  resetLetters: (speakerIndex: number) => void;
  setSpeakerName: (speakerIndex: number, speakerName: string) => void;
  setWord: (speakerIndex: number, word: string) => void;
  setWordTranslation: (speakerIndex: number, wordTranslation: string) => void;
  addLetter: (speakerIndex: number, letter: Letter) => void;
  setWordTime: (speakerIndex: number, time: number) => void;
  setLetterPitch: (
    speakerIndex: number,
    letterIndex: number,
    pitch: number
  ) => void;
  parentCallBack: (selectedFolderName: string) => void;
  updateAudioPitch: (index: number, minPitch: number, maxPitch: number) => void;
  
}

interface State {
  selectedFolderName: string;
  showImgMenu: boolean;
  imgMenuX: number;
  imgMenuY: number;
  isAudioImageLoaded: boolean;
  soundLength: number;
  selectionInterval: string;
  imageUrl: string;
  audioUrl: string;
  imageUrlStack: string[];
  audioEditVersion: number;
  minSelectX: number;
  maxSelectX: number;
  minAudioX: number;
  maxAudioX: number;
  minPitch: number;
  maxPitch: number;
  minAudioTime: number;
  maxAudioTime: number;
  audioImgWidth: number;
  speakerName: string;
  word: string;
  wordTranslation: string;
  closeImgSelectionCallback: () => void;
  selectionCallback: (t1: number, t2: number) => void;
  // needed for the onChange event to work.
  [key: string]: any;
  beats: number[]; // Stores the time positions of the beats

}

export class AudioAnalysis extends React.Component<AudioAnalysisProps, State> {
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
  static formatImageUrl(uploadId: string, minPitch?: number, maxPitch?: number, tmin?: number, tmax?: number) {
    let url = `/api/audio/${uploadId}.png/image`;
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
      return `/api/audio/${uploadId}/file?tmin=${tmin}&tmax=${tmax}`;
    } else {
      return `/api/audio/${uploadId}/file`;
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (state.manualImageUrlOverride) {
      // Skip automatic updates if the image URL was manually overridden
      console.log("Skipping getDerivedStateFromProps due to manualImageUrlOverride");
      return null;
    }
  
    const uploadId = props.speakers[props.speakerIndex]?.uploadId;
    if (!uploadId) return null;
  
    const newImageUrl = state.minAudioTime === 0 && state.maxAudioTime === -1
      ? AudioAnalysis.formatImageUrl(uploadId, props.minPitch, props.maxPitch)
      : AudioAnalysis.formatImageUrl(uploadId, props.minPitch, props.maxPitch, state.minAudioTime, state.maxAudioTime);
  
    if (state.imageUrl !== newImageUrl || state.minPitch !== props.minPitch || state.maxPitch !== props.maxPitch) {
      return {
        imageUrl: newImageUrl,
        minPitch: props.minPitch,
        maxPitch: props.maxPitch,
      };
    }
  
    return null;
  }

  constructor(props: AudioAnalysisProps) {
    super(props);

    this.state = {
      typeOfBeat: "Melody",
      selectedFolderName: "Uploads",
      speakerName: this.props.speakers[this.props.speakerIndex].speakerName,
      word: this.props.speakers[this.props.speakerIndex].word,
      wordTranslation: this.props.speakers[this.props.speakerIndex].wordTranslation,
      showImgMenu: false,
      imgMenuX: -1,
      imgMenuY: -1,
      isAudioImageLoaded: false,
      soundLength: -1,
      selectionInterval: "Letter",
      imageUrl: AudioAnalysis.formatImageUrl(
        this.getSpeaker().uploadId,
        this.props.minPitch,
        this.props.maxPitch),
      audioUrl: AudioAnalysis.formatAudioUrl(this.getSpeaker().uploadId),
      imageUrlStack: [],
      audioEditVersion: 0,
      minSelectX: -1,
      maxSelectX: -1,
      minPitch: this.props.minPitch,
      maxPitch: this.props.maxPitch,
      minAudioX: DEFAULT.MIN_IMAGE_XPERC * DEFAULT.AUDIO_IMG_WIDTH,
      maxAudioX: DEFAULT.MAX_IMAGE_XPERC * DEFAULT.AUDIO_IMG_WIDTH,
      beats: [],
      minAudioTime: 0.0,
      maxAudioTime: -1.0,
      audioImgWidth: (DEFAULT.MAX_IMAGE_XPERC - DEFAULT.MIN_IMAGE_XPERC)
        * DEFAULT.AUDIO_IMG_WIDTH,
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
    this.toggleTypeOfBeat = this.toggleTypeOfBeat.bind(this);
    
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

    const imageUrl = AudioAnalysis.formatImageUrl(
      uploadId,
      this.props.minPitch,
      this.props.maxPitch);

    const audioUrl = AudioAnalysis.formatAudioUrl(uploadId);

    fetch(`/api/audio/${uploadId}/duration`, request)
      .then((response) => response.json())
      .then(function (data: any) {
        controller.setState({
          imageUrl,
          audioUrl,
          soundLength: data.duration,
          maxAudioTime: data.duration,
        });
      });
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
      }).catch(function (error: any) {
        // return;
      });
    } else {
      await this.setState({
        selectedFolderName: uploadId,
      });
      this.props.parentCallBack(this.state.selectedFolderName);
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

    const newAudioUrl = AudioAnalysis.formatAudioUrl(
      this.getSpeaker().uploadId,
      ts[0],
      ts[1]
    );

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

      const newAudioUrl = AudioAnalysis.formatAudioUrl(
        this.getSpeaker().uploadId,
        letter.t0,
        letter.t1
      );

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

  addPitch(pitch: number, letter: string, ts: number[], isManualPitch: boolean = false, isWordSep: boolean = false, isContour: boolean = false, pitchRange: number[] = null) {
    if (!isWordSep) {
      if (pitch < this.props.minPitch || pitch > this.props.maxPitch) {
        // the pitch outside the bounds of the window, omit it
        return;
      }
    }

    if (ts[0] === ts[1]) {
      // add buffer to avoid adding a very narrow box to Target Pitch
      ts[0] = Math.max(ts[0] - 0.001, 0);
      ts[1] = Math.min(ts[1] + 0.001, this.state.soundLength);
    }

    const newLetter: Letter = {
      t0: ts[0],
      t1: ts[1],
      pitch,
      syllable: DEFAULT.SYLLABLE_TEXT,
      isManualPitch,
      isWordSep,
      isContour
    };
    if (isContour && pitchRange != null) {
      newLetter.contourGroupRange = pitchRange;
    }

    this.props.addLetter(this.props.speakerIndex, newLetter);
    this.state.closeImgSelectionCallback();
  }

  imageIntervalSelected(
    leftX: number,
    rightX: number,
    manualPitch?: number,
    isWordSep: boolean = false,
    tsOverride?: number[]) {
    const ts = tsOverride || this.imageIntervalToTimeInterval(leftX, rightX);

    if (manualPitch !== undefined) {
      this.addPitch(manualPitch, DEFAULT.SYLLABLE_TEXT, ts, true);
      return;
    }

    if (isWordSep) {
      this.addPitch(-1, DEFAULT.SEPARATOR_TEXT, ts, false, true);
      return;
    }

    fetch(`/api/audio/${this.getSpeaker().uploadId}/pitch/avg`
      + "?t0=" + ts[0]
      + "&t1=" + ts[1]
      + "&max-pitch=" + this.props.maxPitch
      + "&min-pitch=" + this.props.minPitch, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
        // this.setState({activeWordIndex: 0});
        // this.setState({words: new StaticWordSyallableData().getData(
        //      parseFloat(this.props.match.params.numSyllables), 
        //      parseFloat(this.props.location.search.slice(-1)))});
        // this.getPreviousRecordings();
        // this.resetSamplePitch();
        // this.resetSlider(this.state.activeWordIndex);
        // this.toggleChanged("showRedDot", false);",
      },
    })
      .then((response) => response.json())
      .then((data) => this.addPitch(data.avg_pitch, DEFAULT.SYLLABLE_TEXT, ts, false),
      );
  }

  pitchArtRangeClicked() {
    const ts = this.imageIntervalToTimeInterval(this.state.minSelectX, this.state.maxSelectX);

    fetch(`/api/audio/${this.getSpeaker().uploadId}/pitch/range`
      + "?max-pitch="
      + this.props.maxPitch
      + "&min-pitch=" + this.props.minPitch
      + "&t0=" + ts[0]
      + "&t1=" + ts[1], {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      }
    })
      .then((response) => response.json())
      .then((data) => (data as PitchRangeDTO).pitches.map((item) => this.addPitch(item[1],
        DEFAULT.SYLLABLE_TEXT,
        [item[0], item[0]], false, false, true, ts)),
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
    this.props.setLetterPitch(this.props.speakerIndex, index, newPitch);
  }

  manualPitchArtClicked() {
    let manualPitch: number | undefined;
    let isValidNumber = false;

    while (!isValidNumber) {
      const msg = `Enter pitch value between ${this.props.minPitch.toFixed(2)}Hz `
        + `and ${this.props.maxPitch.toFixed(2)}Hz`;

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
            undefined,
            undefined,
            [t0, t1]);
          return;
        } catch {
          // do nothing
        }
      }

      manualPitch = parseFloat(manualPitchStr);

      isValidNumber = !isNaN(manualPitch);

      if (!isValidNumber) {
        NotificationManager.error("Invalid frequency, expected a number");
        continue;
      }

      isValidNumber = !(manualPitch < this.props.minPitch || manualPitch > this.props.maxPitch);
      if (!isValidNumber) {
        const errorMsg
          = `${manualPitch}Hz is not between between ${this.props.minPitch.toFixed(2)}Hz `
          + `and ${this.props.maxPitch.toFixed(2)}Hz`;
        NotificationManager.error(errorMsg);
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

    this.setState({ [name]: value } as any);
  }

  applyPitchRange(minPitch: number, maxPitch: number) {

    const newUrl = AudioAnalysis.formatImageUrl(
      this.getSpeaker().uploadId,
      minPitch,
      maxPitch,
      this.state.minAudioTime,
      this.state.maxAudioTime);

    this.state.closeImgSelectionCallback();

    this.setState({
      imageUrl: newUrl,
      isAudioImageLoaded: false,
      minPitch,
      maxPitch,
      audioEditVersion: this.state.audioEditVersion + 1,
    });

    this.props.updateAudioPitch(this.props.speakerIndex, minPitch, maxPitch);
  }

  showAllClicked() {

    const newUrl = this.state.imageUrlStack.pop();


    const urlObj = new URL(newUrl, window.location.origin);

    const tmin = parseFloat(urlObj.searchParams.get('tmin'));
    const tmax = parseFloat(urlObj.searchParams.get('tmax'));

    console.log('tmin:', tmin);
    console.log('tmax:', tmax);

    const newAudioUrl = AudioAnalysis.formatAudioUrl(
      this.getSpeaker().uploadId,
      tmin,
      tmax);

    this.state.closeImgSelectionCallback();

    this.setState({
      imageUrl: newUrl,
      audioUrl: newAudioUrl,
      isAudioImageLoaded: false,
      audioEditVersion: this.state.audioEditVersion + 1,
      minAudioTime: tmin,
      maxAudioTime: tmax,
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

    const newImageUrl = AudioAnalysis.formatImageUrl(
      this.getSpeaker().uploadId,
      this.props.minPitch,
      this.props.maxPitch,
      config.minAudioTime,
      config.maxAudioTime);

    this.state.closeImgSelectionCallback();

    this.state.imageUrlStack.push(this.state.imageUrl);

    this.setState({
      imageUrl: newImageUrl,
      audioUrl: config.audioUrl,
      isAudioImageLoaded: false,
      audioEditVersion: this.state.audioEditVersion + 1,
      minAudioTime: config.minAudioTime,
      maxAudioTime: config.maxAudioTime,
    });
  }

  completeZoomOut = () => {
    if (this.state.imageUrlStack.length === 0) return;
    while (this.state.imageUrlStack.length > 1) {
      this.state.imageUrlStack.pop();
    }
    this.showAllClicked();
  }

  renderSpeakerControl = () => {
    const isLastSpeaker = this.props.speakerIndex === this.props.speakers.length - 1;
    const isFirstSpeaker = this.props.speakerIndex === 0;

    return (
      <>
        <SpeakerControl
          speakerIndex={this.props.speakerIndex}
          addSpeaker={this.props.addSpeaker}
          removeSpeaker={() => this.props.removeSpeaker(this.props.speakerIndex)}
          canAddSpeaker={isLastSpeaker && this.props.speakerIndex < (DEFAULT.SPEAKER_LIMIT - 1)}
          canRemoveSpeaker={!isFirstSpeaker} />
        <button className="complete-zoomout waves-effect waves-light btn globalbtn"
          disabled={this.state.imageUrlStack.length === 0}
          onClick={this.completeZoomOut}>
          Complete Zoom Out
        </button>
      </>
    );
  }

  showImgMenu = (imgMenuX: number, imgMenuY: number) => {
    this.setState({ imgMenuX, imgMenuY });
  }

  maybeRenderImgMenu = () => {
    if (this.state.imgMenuX !== -1 && this.state.imgMenuY !== -1) {
      const isSelectionActive = this.state.minSelectX !== -1
        && this.state.maxSelectX !== -1;

      const isAllShown = this.state.minAudioTime === 0
        && this.state.maxAudioTime === this.state.soundLength;

      const config = this.getAudioConfigForSelection(
        this.state.minSelectX,
        this.state.maxSelectX);

      const isSoundLengthLarge = (config.maxAudioTime - config.minAudioTime > 0.05);


      return (
        <AudioAnalysisImageMenu
          imgMenuX={this.state.imgMenuX}
          imgMenuY={this.state.imgMenuY}
          isSelectionActive={isSelectionActive}
          isAllShown={isAllShown}
          splitWord={this.wordSplitClicked}
          intervalSelected={this.selectionIntervalClicked}
          newManualPitch={this.manualPitchArtClicked}
          newAvgPitch={this.averagePitchArtClicked}
          newRangePitch={this.pitchArtRangeClicked}
          showAllAudio={this.showAllClicked}
          isSoundLengthLarge={isSoundLengthLarge}
          onClick={() => this.showImgMenu(-1, -1)}
        />
      );
    }
  }

  onSubmitSpeakerName = (event: any) => {
    event.preventDefault();
    const { speakerName, word, wordTranslation } = this.props.speakers[this.props.speakerIndex];
    this.props.setSpeakerName(this.props.speakerIndex, speakerName);
    this.props.setWord(this.props.speakerIndex, word);
    this.props.setWordTranslation(this.props.speakerIndex, wordTranslation);
  }

  onChange = (event: any) => {
    if (event.target.name === "speakerName") {
      this.props.setSpeakerName(this.props.speakerIndex, event.target.value);
    } else if (event.target.name === "word") {
      this.props.setWord(this.props.speakerIndex, event.target.value);
    } else if (event.target.name === "wordTranslation") {
      this.props.setWordTranslation(this.props.speakerIndex, event.target.value);
    }

    this.setState({ [event.target.name]: event.target.value });
  };

  static formatBeatsUrl() {
    return "http://localhost:5000/api/audio/spectrogram/beats/aakiiwa.wav.png/image";
  }

  // toggleTypeOfBeat() {
  //   const newTypeOfBeat = this.state.typeOfBeat === "Melody" ? "Rhythm" : "Melody";
  //   const uploadId = this.getSpeaker().uploadId;
  
  //   if (!uploadId) {
  //     console.error("No upload ID found. Cannot toggle type of beat.");
  //     return;
  //   }
  
  //   if (newTypeOfBeat === "Rhythm") {
  //     var rhythmUrl = `http://localhost:5000/api/audio/spectrogram/beats/${uploadId}.png/image?timestamp=${new Date().getTime()}`;;
  
  //     this.setState({ isAudioImageLoaded: false });
  //     fetch(rhythmUrl)
  //       .then((response) => {
  //         if (!response.ok) {
  //           throw new Error(`HTTP error! Status: ${response.status}`);
  //         }
  //         console.log("Rhythm spectrogram fetched successfully:", rhythmUrl);
  //         return rhythmUrl; // Pass the URL directly
  //       })
  //       .then((url) => {
  //         this.setState({
  //           typeOfBeat: newTypeOfBeat,
  //           imageUrl: rhythmUrl ,
  //           isAudioImageLoaded: true,
  //           audioEditVersion: this.state.audioEditVersion + 1, // Force re-render
  //         }, () => {
  //           console.log("State updated for Rhythm:", this.state);
  //         });
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching rhythm spectrogram:", error);
  //         this.setState({ isAudioImageLoaded: true });
  //       });
  //   } else {
  //     const melodyUrl = AudioAnalysis.formatImageUrl(
  //       uploadId,
  //       this.props.minPitch,
  //       this.props.maxPitch,
  //       this.state.minAudioTime,
  //       this.state.maxAudioTime
  //     );
  
  //     this.setState({
  //       typeOfBeat: newTypeOfBeat,
  //       imageUrl: melodyUrl,
  //       isAudioImageLoaded: true,
  //       audioEditVersion: this.state.audioEditVersion + 1, // Force re-render
  //     }, () => {
  //       console.log("State updated for Melody:", this.state);
  //     });
  //   }
  // }
  // toggleTypeOfBeat = () => {
  //   const newTypeOfBeat = this.state.typeOfBeat === "Melody" ? "Rhythm" : "Melody";
  //   const newImageUrl = newTypeOfBeat === "Rhythm"
  //     ? "http://localhost:5000/api/audio/spectrogram/beats/test.png"
  //     : AudioAnalysis.formatImageUrl(
  //         this.getSpeaker().uploadId,
  //         this.props.minPitch,
  //         this.props.maxPitch,
  //         this.state.minAudioTime,
  //         this.state.maxAudioTime
  //       );
  
  //   this.setState(
  //     {
  //       typeOfBeat: newTypeOfBeat,
  //       imageUrl: newImageUrl,
  //       manualImageUrlOverride: true, // Signal manual update
  //       audioEditVersion: this.state.audioEditVersion + 1,
  //     },
  //     () => {
  //       console.log("State after toggleTypeOfBeat:", this.state);
  //     }
  //   );
  // };
  toggleTypeOfBeat = () => {
    const newTypeOfBeat = this.state.typeOfBeat === "Melody" ? "Rhythm" : "Melody";
    const uploadId = this.getSpeaker().uploadId;
  
    if (!uploadId) {
      console.error("No upload ID found. Cannot toggle type of beat.");
      return;
    }
  
    if (newTypeOfBeat === "Rhythm") {
      const rhythmUrl = `http://localhost:5000/api/audio/spectrogram/beats/${uploadId}.png/image?timestamp=${new Date().getTime()}`;
      this.setState({ isAudioImageLoaded: false, manualImageUrlOverride: true });
  
      fetch(rhythmUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json(); // Parse JSON response
        })
        .then((data) => {
          const { image_binary, beats } = data;
  
          // Construct the image source from Base64 binary
          const imageSrc = `data:image/png;base64,${image_binary}`;
  
          this.setState(
            {
              typeOfBeat: newTypeOfBeat,
              imageUrl: imageSrc, // Use the constructed Base64 image
              beats: beats || [], // Populate beats from the response
              isAudioImageLoaded: true,
              audioEditVersion: this.state.audioEditVersion + 1,
            },
            () => {
              console.log("State updated for Rhythm:", this.state);
            }
          );
        })
        .catch((error) => {
          console.error("Error fetching rhythm spectrogram:", error);
          this.setState({ isAudioImageLoaded: true });
        });
    } else {
      const melodyUrl = AudioAnalysis.formatImageUrl(
        uploadId,
        this.props.minPitch,
        this.props.maxPitch,
        this.state.minAudioTime,
        this.state.maxAudioTime
      );
  
      this.setState(
        {
          typeOfBeat: newTypeOfBeat,
          imageUrl: melodyUrl,
          beats: [], // Clear beats for Melody
          isAudioImageLoaded: true,
          audioEditVersion: this.state.audioEditVersion + 1,
        },
        () => {
          console.log("State updated for Melody:", this.state);
        }
      );
    }
  };
  updateBeat = (index: number, newTime: number) => {
    const updatedBeats = [...this.state.beats];
    updatedBeats[index] = newTime;
  
    this.setState({ beats: updatedBeats }, () => {
      console.log("Beats updated:", this.state.beats);
    });
  };
  render() {
    const { typeOfBeat } = this.state;
    const uploadId = this.getSpeaker().uploadId;
    const { speakerName, word, wordTranslation } = this.props.speakers[this.props.speakerIndex];
  
    if (speakerName === undefined) {
      this.props.setSpeakerName(this.props.speakerIndex, "Speaker");
    }
    if (word === undefined) {
      this.props.setWord(this.props.speakerIndex, "Word");
    }
    if (wordTranslation === undefined) {
      this.props.setWordTranslation(this.props.speakerIndex, "WordTranslation");
    }
  
    const isInvalid = speakerName === "";
  
    let nonAudioImg;
    if (!uploadId) {
      nonAudioImg = <AudioImgDefault />;
    } else if (!this.state.isAudioImageLoaded) {
      nonAudioImg = <AudioImgLoading />;
    }
  
    return (
      <div className="AudioAnalysis">
        <div className="row">
          <div className="AudioAnalysis-speaker metilda-audio-analysis-controls-list col s5">
            <h6 className="metilda-control-header">Speaker {this.props.speakerIndex + 1}</h6>
            <UploadAudio
              initFileName={uploadId}
              setUploadId={this.setUploadId}
              userFiles={this.props.files}
              firebase={this.props.firebase}
            />
            <PitchRange
              initMinPitch={this.props.minPitch}
              initMaxPitch={this.props.maxPitch}
              applyPitchRange={this.applyPitchRange}
            />
            {this.renderSpeakerControl()}
            <button
              className="waves-effect waves-light btn globalbtn"
              onClick={this.toggleTypeOfBeat}

            >
              {`Switch to ${this.state.typeOfBeat === "Melody" ? "Rhythm" : "Melody"}`}
              
      
            </button>
          </div>
          <div className="AudioAnalysis-analysis metilda-audio-analysis col s7">
            <div className="metilda-audio-analysis-image-container">
              {nonAudioImg}
              {this.maybeRenderImgMenu()}
              {uploadId && (
               <AudioImg
               key={this.state.imageUrl}
               uploadId={uploadId}
               speakerIndex={this.props.speakerIndex}
               src={this.state.imageUrl}
               ref="audioImage"
               imageWidth={DEFAULT.AUDIO_IMG_WIDTH}
               xminPerc={DEFAULT.MIN_IMAGE_XPERC}
               xmaxPerc={DEFAULT.MAX_IMAGE_XPERC}
               audioIntervalSelected={this.audioIntervalSelected}
               audioIntervalSelectionCanceled={this.audioIntervalSelectionCanceled}
               onAudioImageLoaded={this.onAudioImageLoaded}
               showImgMenu={this.showImgMenu}
               minAudioX={this.state.minAudioX}
               maxAudioX={this.state.maxAudioX}
               minAudioTime={this.state.minAudioTime}
               maxAudioTime={this.state.maxAudioTime}
               beats={this.state.typeOfBeat === "Rhythm" ? this.state.beats : []} // Pass beats
               tmin={this.state.minAudioTime} // Pass tmin
               tmax={this.state.maxAudioTime} // Pass tmax
               spectrogramWidth={DEFAULT.AUDIO_IMG_WIDTH} // Pass width of spectrogram
               onBeatMove={this.updateBeat} // Update beat positions on drag
               typeOfBeat={this.state.typeOfBeat} // Pass typeOfBeat
             />
              )}
            </div>
            {uploadId && <PlayerBar key={this.state.audioUrl} audioUrl={this.state.audioUrl} />}
            <TargetPitchBar
              letters={this.props.speakers}
              files={this.props.files}
              minAudioX={this.state.minAudioX}
              maxAudioX={this.state.maxAudioX}
              minAudioTime={this.state.minAudioTime}
              maxAudioTime={this.state.maxAudioTime}
              targetPitchSelected={this.targetPitchSelected}
              speakerIndex={this.props.speakerIndex}
              firebase={this.props.firebase}
              typeOfBeat={typeOfBeat}
            />
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
  addSpeaker: () => dispatch(addSpeaker()),
  removeSpeaker: (speakerIndex: number) => dispatch(removeSpeaker(speakerIndex)),
  setSpeakerName: (speakerIndex: number, speakerName: string) => dispatch(setSpeakerName(speakerIndex, speakerName)),
  setWord: (speakerIndex: number, word: string) => dispatch(setWord(speakerIndex, word)),
  setWordTranslation: (speakerIndex: number, wordTranslation: string) => dispatch(setWordTranslation(speakerIndex, wordTranslation)),
  setWordTime: (speakerIndex: number, time: number) => dispatch(setWordTime(speakerIndex, time)),
  setUploadId: (speakerIndex: number, uploadId: string, fileIndex: number) => dispatch(setUploadId(speakerIndex, uploadId, fileIndex)),
  addLetter: (speakerIndex: number, newLetter: Letter) => dispatch(addLetter(speakerIndex, newLetter)),
  resetLetters: (speakerIndex: number) => dispatch(resetLetters(speakerIndex)),
  setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) =>
    dispatch(setLetterPitch(speakerIndex, letterIndex, newPitch))
});

export default connect(mapStateToProps, mapDispatchToProps)(AudioAnalysis);
