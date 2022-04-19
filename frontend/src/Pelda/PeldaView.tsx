import * as React from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import {AppState} from "../store";
import {setLetterPitch} from "../store/audio/actions";
import {AudioAction} from "../store/audio/types";
import {Speaker} from "../types/types";
import PeldaAudioAnalysis from "./PeldaAudioAnalysis";
import { withAuthorization } from "../Session";
import "../Create/CreatePitchArt.css";
import Header from "../Layout/Header";
import {uploadAudio, uploadEaf} from "../Create/ImportUtils";
import {spinner} from "../Utils/LoadingSpinner";
import ReactGA from "react-ga";
import ReactFileReader from "react-file-reader";
import {NotificationManager} from "react-notifications";
import "./PeldaView.css";

export interface PeldaViewProps {
  speakers: Speaker[];
  setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) => void;
  firebase: any;
}

interface State {
  files: any[];
  selectedFolderName: string;
  isLoading: boolean;
  energy: any;
  voicedFrames: any;
  pitchValueAtTime: any;
  pitchValueInFrame: any;
  lowFrequency: any;
  highFrequency: any;
  minIntensity: any;
  maxIntensity: any;
  meanIntensity: any;
  noOfFrames: any;
  noOfFormants: any;
  formantValueAtTime: any;
  minHarmonicity: any;
  maxHarmonicity: any;
  harmonicityValueAtTime: any;
  noOfPeriods: any;
  noOfPoints: any;
  localJitter: any;
  tier1Value: any;
  tier2Value: any;
  tier3Value: any;
  tier4Value: any;
  tier5Value: any;
  tier6Value: any;
  soundLength: number;
  minAudioTime: number;
  maxAudioTime: number;
  selectStartTime: number;
  selectEndTime: number;
}

export class PeldaView extends React.Component<PeldaViewProps, State> {
constructor(props: PeldaViewProps) {
    super(props);
    this.state = {
  files: [],
  selectedFolderName: "Uploads",
  isLoading: false,
  energy: null,
  voicedFrames: null,
  pitchValueAtTime: null,
  pitchValueInFrame: null,
  lowFrequency: null,
  highFrequency: null,
  minIntensity: null,
  maxIntensity: null,
  meanIntensity: null,
  noOfFrames: null,
  noOfFormants: null,
  formantValueAtTime: null,
  minHarmonicity: null,
  maxHarmonicity: null,
  harmonicityValueAtTime: null,
  noOfPeriods: null,
  noOfPoints: null,
  localJitter: null,
  tier1Value: "",
  tier2Value: "",
  tier3Value: "",
  tier4Value: "",
  tier5Value: "",
  tier6Value: "",
  soundLength: -1.0,
  minAudioTime: 0.0,
  maxAudioTime: 0.0,
  selectStartTime: -1.0,
  selectEndTime: -1.0,
};
}

componentDidMount() {
    this.getUserFiles();
}

callBackSelectionInterval = (childSoundLength: number, childMinAudioTime: number, childMaxAudioTime: number,
                             childSelectStartTime: number, childSelectEndTime: number,
                             childSelectedFolderName: string ) => {
  this.setState ({
  soundLength: childSoundLength,
  minAudioTime: childMinAudioTime,
  maxAudioTime: childMaxAudioTime,
  selectStartTime: childSelectStartTime,
  selectEndTime: childSelectEndTime,
  selectedFolderName: childSelectedFolderName,
  });

  if (this.state.selectedFolderName !== "Uploads") {
    this.getUserFiles();
  }

  const eafTimeInterval = document.getElementById("eaf-interval");
  const eafStartTimeElement = document.getElementById("eaf-start-time");
  const eafEndTimeElement = document.getElementById("eaf-end-time");

  if (eafTimeInterval !== null && eafStartTimeElement !== null && eafEndTimeElement !== null) {
    eafTimeInterval.setAttribute("class", "hidden");
    eafStartTimeElement.setAttribute("class", "hidden");
    eafEndTimeElement.setAttribute("class", "hidden");
  }
}

callBackEafTierData = async (isTier1Enabled: boolean, tier1text: string, isTier2Enabled: boolean, tier2text: string,
                             isTier3Enabled: boolean, tier3text: string, isTier4Enabled: boolean, tier4text: string,
                             isTier5Enabled: boolean, tier5text: string, isTier6Enabled: boolean, tier6text: string,
                             startTime: number, endTime: number) => {
  const element = document.getElementById("elan-annotation");

  if (element !== null) {
    element.setAttribute("class", "unhidden");
  }

  if ((this.state.tier1Value !== "") || (this.state.tier2Value !== "") ||
    (this.state.tier3Value !== "") || (this.state.tier4Value !== "") ||
    (this.state.tier5Value !== "") || (this.state.tier6Value !== "")) {
    const isOk: boolean = window.confirm("The existing content of tiers will be lost. Are you sure you want to view eaf file data?");

    if ( isOk ) {
    await this.setState({
      tier1Value: tier1text,
      tier2Value: tier2text,
      tier3Value: tier3text,
      tier4Value: tier4text,
      tier5Value: tier5text,
      tier6Value: tier6text,
    });

    const eafTimeInterval = document.getElementById("eaf-interval");
    const eafStartTimeElement = document.getElementById("eaf-start-time");
    const eafEndTimeElement = document.getElementById("eaf-end-time");

    if (eafTimeInterval !== null && eafStartTimeElement !== null && eafEndTimeElement !== null) {
        eafStartTimeElement.innerText = "EAF start time: " + startTime.toFixed(1);
        eafEndTimeElement.innerText = "EAF end time: " + endTime.toFixed(1);

        const timeInterval = document.getElementById("selection-interval");
        const startTimeElement = document.getElementById("select-start-time");
        const endTimeElement = document.getElementById("select-end-time");

        if (timeInterval !== null && startTimeElement !== null && endTimeElement !== null) {
            timeInterval.setAttribute("class", "hidden");
            startTimeElement.setAttribute("class", "hidden");
            endTimeElement.setAttribute("class", "hidden");
        }

        eafTimeInterval.setAttribute("class", "unhidden");
        eafStartTimeElement.setAttribute("class", "unhidden");
        eafEndTimeElement.setAttribute("class", "unhidden");
    }

    const elementTier1 = document.getElementById("tier1label");
    if (elementTier1 !== null) {
      const textbox1 = document.getElementById("textbox1");
      if (isTier1Enabled && textbox1 != null) {
      elementTier1.setAttribute("class", "unhidden");
      textbox1.focus();
      } else {
      elementTier1.setAttribute("class", "hidden");
      }
    }

    const elementTier2 = document.getElementById("tier2label");
    if (elementTier2 !== null) {
      const textbox2 = document.getElementById("textbox2");
      if (isTier2Enabled && textbox2 != null) {
      elementTier2.setAttribute("class", "unhidden");
      textbox2.focus();
      } else {
      elementTier2.setAttribute("class", "hidden");
      }
    }

    const elementTier3 = document.getElementById("tier3label");
    if (elementTier3 !== null) {
      const textbox3 = document.getElementById("textbox3");
      if (isTier3Enabled && textbox3 != null) {
      elementTier3.setAttribute("class", "unhidden");
      textbox3.focus();
      } else {
      elementTier3.setAttribute("class", "hidden");
      }
    }

    const elementTier4 = document.getElementById("tier4label");
    if (elementTier4 !== null) {
      const textbox4 = document.getElementById("textbox4");
      if (isTier4Enabled && textbox4 != null) {
      elementTier4.setAttribute("class", "unhidden");
      textbox4.focus();
      } else {
      elementTier4.setAttribute("class", "hidden");
      }
    }

    const elementTier5 = document.getElementById("tier5label");
    if (elementTier5 !== null) {
      const textbox5 = document.getElementById("textbox5");
      if (isTier5Enabled && textbox5 != null) {
      elementTier5.setAttribute("class", "unhidden");
      textbox5.focus();
      } else {
      elementTier5.setAttribute("class", "hidden");
      }
    }

    const elementTier6 = document.getElementById("tier6label");
    if (elementTier6 !== null) {
      const textbox6 = document.getElementById("textbox6");
      if (isTier6Enabled && textbox6 != null) {
      elementTier6.setAttribute("class", "unhidden");
      textbox6.focus();
      } else {
      elementTier6.setAttribute("class", "hidden");
      }
    }
    } else {
    NotificationManager.info("Please save your exisiting annotation details!!");
    }
  } else {
    await this.setState({
    tier1Value: tier1text,
    tier2Value: tier2text,
    tier3Value: tier3text,
    tier4Value: tier4text,
    tier5Value: tier5text,
    tier6Value: tier6text,
    });

    const eafTimeInterval = document.getElementById("eaf-interval");
    const eafStartTimeElement = document.getElementById("eaf-start-time");
    const eafEndTimeElement = document.getElementById("eaf-end-time");

    if (eafTimeInterval !== null && eafStartTimeElement !== null && eafEndTimeElement !== null) {
        eafStartTimeElement.innerText = "EAF start time: " + startTime.toFixed(1);
        eafEndTimeElement.innerText = "EAF end time: " + endTime.toFixed(1);

        const timeInterval = document.getElementById("selection-interval");
        const startTimeElement = document.getElementById("select-start-time");
        const endTimeElement = document.getElementById("select-end-time");

        if (timeInterval !== null && startTimeElement !== null && endTimeElement !== null) {
            timeInterval.setAttribute("class", "hidden");
            startTimeElement.setAttribute("class", "hidden");
            endTimeElement.setAttribute("class", "hidden");
        }

        eafTimeInterval.setAttribute("class", "unhidden");
        eafStartTimeElement.setAttribute("class", "unhidden");
        eafEndTimeElement.setAttribute("class", "unhidden");
    }

    const elementTier1 = document.getElementById("tier1label");
    if (elementTier1 !== null) {
    const textbox1 = document.getElementById("textbox1");
    if (isTier1Enabled && textbox1 != null) {
      elementTier1.setAttribute("class", "unhidden");
      textbox1.focus();
    } else {
      elementTier1.setAttribute("class", "hidden");
    }
    }

    const elementTier2 = document.getElementById("tier2label");
    if (elementTier2 !== null) {
    const textbox2 = document.getElementById("textbox2");
    if (isTier2Enabled && textbox2 != null) {
      elementTier2.setAttribute("class", "unhidden");
      textbox2.focus();
    } else {
      elementTier2.setAttribute("class", "hidden");
    }
    }

    const elementTier3 = document.getElementById("tier3label");
    if (elementTier3 !== null) {
    const textbox3 = document.getElementById("textbox3");
    if (isTier3Enabled && textbox3 != null) {
      elementTier3.setAttribute("class", "unhidden");
      textbox3.focus();
    } else {
      elementTier3.setAttribute("class", "hidden");
    }
    }

    const elementTier4 = document.getElementById("tier4label");
    if (elementTier4 !== null) {
    const textbox4 = document.getElementById("textbox4");
    if (isTier4Enabled && textbox4 != null) {
      elementTier4.setAttribute("class", "unhidden");
      textbox4.focus();
    } else {
      elementTier4.setAttribute("class", "hidden");
    }
    }

    const elementTier5 = document.getElementById("tier5label");
    if (elementTier5 !== null) {
    const textbox5 = document.getElementById("textbox5");
    if (isTier5Enabled && textbox5 != null) {
      elementTier5.setAttribute("class", "unhidden");
      textbox5.focus();
    } else {
      elementTier5.setAttribute("class", "hidden");
    }
    }

    const elementTier6 = document.getElementById("tier6label");
    if (elementTier6 !== null) {
    const textbox6 = document.getElementById("textbox6");
    if (isTier6Enabled && textbox6 != null) {
      elementTier6.setAttribute("class", "unhidden");
      textbox6.focus();
    } else {
      elementTier6.setAttribute("class", "hidden");
    }
    }
  }
  }

  renderSpeakers = () => {
  const index = 0;
  return (
                <PeldaAudioAnalysis speakerIndex={index} key={`audio-analysis-${index}-${this.props.speakers[index].uploadId}`}
    firebase={this.props.firebase} files={this.state.files} parentCallBack={this.callBackSelectionInterval}
    eafTierDataCallBack={this.callBackEafTierData} />
  );
  }

    getUserFiles = () => {
        // Get files of a user
        const currentUserId = this.props.firebase.auth.currentUser.email;
        fetch(`api/get-files-and-folders/${currentUserId}/${this.state.selectedFolderName}`
        + "?file-type1=Folder&file-type2=Upload", {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => this.setState({
    files: data.result.map((item: any) => item)
  }));
    }

    fileSelected = async (files: any) => {
        this.setState({
            isLoading: true,
        });
        try {
    await uploadAudio(files, this.props.firebase);
    this.getUserFiles();
    ReactGA.event({
                category: "Upload File",
                action: "User pressed Upload File button"
      });
        } catch (ex) {
            console.log(ex);
        }
        this.setState({
            isLoading: false,
        });
    }

  getBounds() {
  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  fetch(`/get-bounds/${this.props.speakers[0].uploadId}`, request)
  .then((response) => response.json())
  .then((data) =>
    this.setState({
    soundLength: data.end,
    minAudioTime: data.min,
    maxAudioTime: data.max,
    })
  ).catch(console.log);
  }

  getEnergy() {
  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  fetch(`/get-energy/${this.props.speakers[0].uploadId}`, request)
  .then((response) => response.json())
  .then((data) =>
    this.setState({
    energy: data.energy,
    }))
  .then(() =>
    alert("Energy: " + this.state.energy)
  ).catch(console.log);
  }

  countVoicedFrames() {
  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  fetch(`/pitch/count-voiced-frames/${this.props.speakers[0].uploadId}`, request)
  .then((response) => response.json())
  .then((data) =>
    this.setState({
    voicedFrames: data.voicedFrames,
    }))
  .then(() =>
    alert(this.state.voicedFrames)
  ).catch(console.log);
  }

  getPitchValueAtTime() {
  const time = prompt("Enter Time(s): ", "0.5");

  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  if (time !== null) {
    fetch(`/pitch/value-at-time/${this.props.speakers[0].uploadId}/${time}`, request)
    .then((response) => response.json())
    .then((data) =>
    this.setState({
      pitchValueAtTime: data.pitchValueAtTime,
    }))
    .then(() =>
    alert(this.state.pitchValueAtTime)
    ).catch(console.log);
  }
  }

  getPitchValueInFrame() {
  const frame = prompt("Enter Frame Number: ", "50");

  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  if (frame !== null) {
    fetch(`/pitch/value-in-frame/${this.props.speakers[0].uploadId}/${frame}`, request)
    .then((response) => response.json())
    .then((data) =>
    this.setState({
      pitchValueInFrame: data.pitchValueInFrame,
    }))
    .then(() =>
    alert(this.state.pitchValueInFrame)
    ).catch(console.log);
  }
  }

  getLowestFrequency() {
  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  fetch(`/spectrum/get-bounds/${this.props.speakers[0].uploadId}`, request)
  .then((response) => response.json())
  .then((data) =>
    this.setState({
    lowFrequency: data.lowFrequency,
    }))
  .then(() =>
    alert("Lowest Frequency: " + this.state.lowFrequency + " Hz")
  ).catch(console.log);
  }

  getHighestFrequency() {
  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  fetch(`/spectrum/get-bounds/${this.props.speakers[0].uploadId}`, request)
  .then((response) => response.json())
  .then((data) =>
    this.setState({
    highFrequency: data.highFrequency,
    }))
  .then(() =>
    alert("Highest Frequency: " + this.state.highFrequency + " Hz")
  ).catch(console.log);
  }

  getMinimumIntensity() {
  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  fetch(`/intensity/get-bounds/${this.props.speakers[0].uploadId}`, request)
  .then((response) => response.json())
  .then((data) =>
    this.setState({
    minIntensity: data.minIntensity,
    }))
  .then(() =>
    alert("Minimum Intensity: " + this.state.minIntensity + " dB")
  ).catch(console.log);
  }

  getMaximumIntensity() {
  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  fetch(`/intensity/get-bounds/${this.props.speakers[0].uploadId}`, request)
  .then((response) => response.json())
  .then((data) =>
    this.setState({
    maxIntensity: data.maxIntensity,
    }))
  .then(() =>
    alert("Maximum Intensity: " + this.state.maxIntensity + " dB")
  ).catch(console.log);
  }

  getMeanIntensity() {
  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  fetch(`/intensity/get-bounds/${this.props.speakers[0].uploadId}`, request)
  .then((response) => response.json())
  .then((data) =>
    this.setState({
    meanIntensity: data.meanIntensity,
    }))
  .then(() =>
    alert("Mean Intensity: " + this.state.meanIntensity + " dB")
  ).catch(console.log);
  }

  getNoOfFrames() {
  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  fetch(`/formant/number-of-frames/${this.props.speakers[0].uploadId}`, request)
  .then((response) => response.json())
  .then((data) =>
    this.setState({
    noOfFrames: data.noOfFrames,
    }))
  .then(() =>
    alert(this.state.noOfFrames)
  ).catch(console.log);
  }

  getNoOfFormants() {
  const frame = prompt("Enter Frame Number: ", "50");

  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  if (frame !== null) {
    fetch(`/formant/number-of-formants/${this.props.speakers[0].uploadId}/${frame}`, request)
    .then((response) => response.json())
    .then((data) =>
    this.setState({
      noOfFormants: data.noOfFormants,
    }))
    .then(() =>
    alert(this.state.noOfFormants)
    ).catch(console.log);
  }
  }

  getFormantFrequencyAtTime() {
  const formant = prompt("Enter Formant Number: ", "1");
  const time = prompt("Enter Time(s): ", "0.5");

  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  if (formant !== null && time !== null) {
    fetch(`/formant/value-at-time/${this.props.speakers[0].uploadId}/${formant}/${time}`, request)
    .then((response) => response.json())
    .then((data) =>
    this.setState({
      formantValueAtTime: data.formantValueAtTime,
    }))
    .then(() =>
    alert(this.state.formantValueAtTime)
    ).catch(console.log);
  }
  }

  getMinimumHarmonicity() {
  const startTime = prompt("Enter Start Time(s): ", "0.0");
  const endTime = prompt("Enter End Time(s): ", "0.0");

  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  if (startTime !== null && endTime !== null) {
    fetch(`/harmonicity/get-min/${this.props.speakers[0].uploadId}/${startTime}/${endTime}`, request)
    .then((response) => response.json())
    .then((data) =>
    this.setState({
      minHarmonicity: data.minHarmonicity,
    }))
    .then(() =>
    alert(this.state.minHarmonicity)
    ).catch(console.log);
  }
  }

  getMaximumHarmonicity() {
  const startTime = prompt("Enter Start Time(s): ", "0.0");
  const endTime = prompt("Enter End Time(s): ", "0.0");

  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  if (startTime !== null && endTime !== null) {
    fetch(`/harmonicity/get-max/${this.props.speakers[0].uploadId}/${startTime}/${endTime}`, request)
    .then((response) => response.json())
    .then((data) =>
    this.setState({
      maxHarmonicity: data.maxHarmonicity,
    }))
    .then(() =>
    alert(this.state.maxHarmonicity)
    ).catch(console.log);
  }
  }

  getHarmonicityValueAtTime() {
  const time = prompt("Enter Time(s): ", "0.5");

  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  if (time !== null) {
    fetch(`/harmonicity/value-at-time/${this.props.speakers[0].uploadId}/${time}`, request)
    .then((response) => response.json())
    .then((data) =>
    this.setState({
      harmonicityValueAtTime: data.harmonicityValueAtTime,
    }))
    .then(() =>
    alert(this.state.harmonicityValueAtTime)
    ).catch(console.log);
  }
  }

  getNoOfPeriods() {
  const startTime = prompt("Enter Start Time(s): ", "0.0");
  const endTime = prompt("Enter End Time(s): ", "0.0");

  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  if (startTime !== null && endTime !== null) {
    fetch(`/pointprocess/number-of-periods/${this.props.speakers[0].uploadId}/${startTime}/${endTime}`, request)
    .then((response) => response.json())
    .then((data) =>
    this.setState({
      noOfPeriods: data.noOfPeriods,
    }))
    .then(() =>
    alert(this.state.noOfPeriods)
    ).catch(console.log);
  }
  }

  getNoOfPoints() {
  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  fetch(`/pointprocess/number-of-points/${this.props.speakers[0].uploadId}`, request)
  .then((response) => response.json())
  .then((data) =>
    this.setState({
    noOfPoints: data.noOfPoints,
    }))
  .then(() =>
    alert(this.state.noOfPoints)
  ).catch(console.log);
  }

  getJitter() {
  const startTime = prompt("Enter Start Time(s): ", "0.0");
  const endTime = prompt("Enter End Time(s): ", "0.0");

  const request: RequestInit = {
    method: "GET",
    headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    }
  };

  if (startTime !== null && endTime !== null) {
    fetch(`/pointprocess/get-jitter/${this.props.speakers[0].uploadId}/${startTime}/${endTime}`, request)
    .then((response) => response.json())
    .then((data) =>
    this.setState({
      localJitter: data.localJitter,
    }))
    .then(() =>
    alert(this.state.localJitter)
    ).catch(console.log);
  }
  }

  addTiers() {
  if (this.props.speakers[0].uploadId !== null && this.props.speakers[0].uploadId !== "") {
    if ((this.state.selectEndTime - this.state.selectStartTime) >= 1 ) {
    const element = document.getElementById("elan-annotation");
    const timeInterval = document.getElementById("selection-interval");

    if (element !== null && timeInterval !== null) {
      element.setAttribute("class", "unhidden");
      timeInterval.setAttribute("class", "unhidden");

      const elementTier1 = document.getElementById("tier1label");
      const elementTier2 = document.getElementById("tier2label");
      const elementTier3 = document.getElementById("tier3label");
      const elementTier4 = document.getElementById("tier4label");
      const elementTier5 = document.getElementById("tier5label");
      const elementTier6 = document.getElementById("tier6label");

      if (elementTier1 !== null && elementTier1.getAttribute("class") === "hidden") {
      elementTier1.setAttribute("class", "unhidden");
      const textbox1 = document.getElementById("textbox1");
      if (textbox1 !== null) {
        textbox1.focus();
      }
      } else if (elementTier2 !== null && elementTier2.getAttribute("class") === "hidden") {
      elementTier2.setAttribute("class", "unhidden");
      const textbox2 = document.getElementById("textbox2");
      if (textbox2 !== null) {
        textbox2.focus();
      }
      } else if (elementTier3 !== null && elementTier3.getAttribute("class") === "hidden") {
      elementTier3.setAttribute("class", "unhidden");
      const textbox3 = document.getElementById("textbox3");
      if (textbox3 !== null) {
        textbox3.focus();
      }
      } else if (elementTier4 !== null && elementTier4.getAttribute("class") === "hidden") {
      elementTier4.setAttribute("class", "unhidden");
      const textbox4 = document.getElementById("textbox4");
      if (textbox4 !== null) {
        textbox4.focus();
      }
      } else if (elementTier5 !== null && elementTier5.getAttribute("class") === "hidden") {
      elementTier5.setAttribute("class", "unhidden");
      const textbox5 = document.getElementById("textbox5");
      if (textbox5 !== null) {
        textbox5.focus();
      }
      } else if (elementTier6 !== null && elementTier6.getAttribute("class") === "hidden") {
      elementTier6.setAttribute("class", "unhidden");
      const textbox6 = document.getElementById("textbox6");
      if (textbox6 !== null) {
        textbox6.focus();
      }
      } else {
      NotificationManager.info("Only 6 tiers are allowed!");
      }
    }
    } else {
    NotificationManager.info("Please select a time window of atleast 1 second to add annotation details!");
    }
  }
  }

  removeTiers = async (event: any) => {
  const element = document.getElementById("elan-annotation");
  const elementTier1 = document.getElementById("tier1label");
  const elementTier2 = document.getElementById("tier2label");
  const elementTier3 = document.getElementById("tier3label");
  const elementTier4 = document.getElementById("tier4label");
  const elementTier5 = document.getElementById("tier5label");
  const elementTier6 = document.getElementById("tier6label");

  if (element !== null && element.getAttribute("class") !== "hidden") {
    if ((this.state.tier1Value !== "") || (this.state.tier2Value !== "") ||
    (this.state.tier3Value !== "") || (this.state.tier4Value !== "") ||
    (this.state.tier5Value !== "") || (this.state.tier6Value !== "")) {
    const isOk: boolean = window.confirm("The content of tiers will be lost." + 
                                "Are you sure you want to remove all tiers?");

    if ( isOk ) {
      if (element !== null) {
      element.setAttribute("class", "hidden");

      if (elementTier1 !== null) {
        elementTier1.setAttribute("class", "hidden");
      }
      if (elementTier2 !== null) {
        elementTier2.setAttribute("class", "hidden");
      }
      if (elementTier3 !== null) {
        elementTier3.setAttribute("class", "hidden");
      }
      if (elementTier4 !== null) {
        elementTier4.setAttribute("class", "hidden");
      }
      if (elementTier5 !== null) {
        elementTier5.setAttribute("class", "hidden");
      }
      if (elementTier6 !== null) {
        elementTier6.setAttribute("class", "hidden");
      }

      await this.setState({
        tier1Value: "",
        tier2Value: "",
        tier3Value: "",
        tier4Value: "",
        tier5Value: "",
        tier6Value: "",
      });
      }
    }
    } else {
    const isOk: boolean = window.confirm("Are you sure you want to remove all tiers?");

    if ( isOk ) {
      if (element !== null) {
      element.setAttribute("class", "hidden");

      if (elementTier1 !== null) {
        elementTier1.setAttribute("class", "hidden");
      }
      if (elementTier2 !== null) {
        elementTier2.setAttribute("class", "hidden");
      }
      if (elementTier3 !== null) {
        elementTier3.setAttribute("class", "hidden");
      }
      if (elementTier4 !== null) {
        elementTier4.setAttribute("class", "hidden");
      }
      if (elementTier5 !== null) {
        elementTier5.setAttribute("class", "hidden");
      }
      if (elementTier6 !== null) {
        elementTier6.setAttribute("class", "hidden");
      }
      }
    }
    }
  }
  }

  removeTier = async (event: any) => {
  const buttonId = event.target.id;
  if (buttonId === "removeTier1") {
    let isTextboxEmpty: string = "";

    if (this.state.tier1Value !== "") {
    isTextboxEmpty = "Tier 1 content will be lost. ";
    }

    const isOk: boolean = window.confirm(isTextboxEmpty + "Are you sure you want to remove Tier 1?");

    if ( isOk ) {
    const element = document.getElementById("tier1label");
    if (element !== null) {
      element.setAttribute("class", "hidden");
      await this.setState ({
      tier1Value: "",
      });
    }
    }
  }

  if (buttonId === "removeTier2") {
    let isTextboxEmpty: string = "";

    if (this.state.tier2Value !== "") {
    isTextboxEmpty = "Tier 2 content will be lost. ";
    }

    const isOk: boolean = window.confirm(isTextboxEmpty + "Are you sure you want to remove Tier 2?");

    if ( isOk ) {
    const element = document.getElementById("tier2label");
    if (element !== null) {
      element.setAttribute("class", "hidden");
      await this.setState ({
      tier2Value: "",
      });
    }
    }
  }

  if (buttonId === "removeTier3") {
    let isTextboxEmpty: string = "";

    if (this.state.tier3Value !== "") {
    isTextboxEmpty = "Tier 3 content will be lost. ";
    }

    const isOk: boolean = window.confirm(isTextboxEmpty + "Are you sure you want to remove Tier 3?");

    if ( isOk ) {
    const element = document.getElementById("tier3label");
    if (element !== null) {
      element.setAttribute("class", "hidden");
      await this.setState ({
      tier3Value: "",
      });
    }
    }
  }

  if (buttonId === "removeTier4") {
    let isTextboxEmpty: string = "";

    if (this.state.tier4Value !== "") {
    isTextboxEmpty = "Tier 4 content will be lost. ";
    }

    const isOk: boolean = window.confirm(isTextboxEmpty + "Are you sure you want to remove Tier 4?");

    if ( isOk ) {
    const element = document.getElementById("tier4label");
    if (element !== null) {
      element.setAttribute("class", "hidden");
      await this.setState ({
      tier4Value: "",
      });
    }
    }
  }

  if (buttonId === "removeTier5") {
    let isTextboxEmpty: string = "";

    if (this.state.tier5Value !== "") {
    isTextboxEmpty = "Tier 5 content will be lost. ";
    }

    const isOk: boolean = window.confirm(isTextboxEmpty + "Are you sure you want to remove Tier 5?");

    if ( isOk ) {
    const element = document.getElementById("tier5label");
    if (element !== null) {
      element.setAttribute("class", "hidden");
      await this.setState ({
      tier5Value: "",
      });
    }
    }
  }

  if (buttonId === "removeTier6") {
    let isTextboxEmpty: string = "";

    if (this.state.tier6Value !== "") {
    isTextboxEmpty = "Tier 6 content will be lost. ";
    }

    const isOk: boolean = window.confirm(isTextboxEmpty + "Are you sure you want to remove Tier 6?");

    if ( isOk ) {
    const element = document.getElementById("tier6label");
    if (element !== null) {
      element.setAttribute("class", "hidden");
      await this.setState ({
      tier6Value: "",
      });
    }
    }
  }
  }

  handleTierValue = async (event: any) => {
  const tierId = event.target.id;
  const value = event.target.value;
  if (tierId === "textbox1") {
    await this.setState({
    tier1Value: value,
    });
  }

  if (tierId === "textbox2") {
    await this.setState({
    tier2Value: value,
    });
  }

  if (tierId === "textbox3") {
    await this.setState({
    tier3Value: value,
    });
  }

  if (tierId === "textbox4") {
    await this.setState({
    tier4Value: value,
    });
  }

  if (tierId === "textbox5") {
    await this.setState({
    tier5Value: value,
    });
  }

  if (tierId === "textbox6") {
    await this.setState({
    tier6Value: value,
    });
  }
  }

  saveAnnotations() {
  if ((this.state.selectEndTime - this.state.selectStartTime) >= 1) {
    if (this.state.tier1Value !== "" || this.state.tier2Value !== "" || this.state.tier3Value !== "" ||
    this.state.tier4Value !== "" || this.state.tier5Value !== "" || this.state.tier6Value !== "") {
    const element = document.getElementById("elan-annotation");
    let tiersValue: string = "";

    if (element !== null && element.getAttribute("class") === "unhidden") {
      const elementTier1 = document.getElementById("tier1label");
      const elementTier2 = document.getElementById("tier2label");
      const elementTier3 = document.getElementById("tier3label");
      const elementTier4 = document.getElementById("tier4label");
      const elementTier5 = document.getElementById("tier5label");
      const elementTier6 = document.getElementById("tier6label");

      if (elementTier1 !== null && elementTier1.getAttribute("class") === "unhidden") {
      if (this.state.tier1Value !== "") {
        tiersValue += ("\nTier 1: " + this.state.tier1Value);
      } else {
        NotificationManager.info("Tier1 content cannot be empty. Please either enter the content or remove the tier!");
        return;
      }
      }

      if (elementTier2 !== null && elementTier2.getAttribute("class") === "unhidden") {
      if (this.state.tier2Value !== "") {
        tiersValue += ("\nTier 2: " + this.state.tier2Value);
      } else {
        NotificationManager.info("Tier2 content cannot be empty. Please either enter the content or remove the tier!");
        return;
      }
      }

      if (elementTier3 !== null && elementTier3.getAttribute("class") === "unhidden") {
      if (this.state.tier3Value !== "") {
        tiersValue += ("\nTier 3: " + this.state.tier3Value);
      } else {
        NotificationManager.info("Tier3 content cannot be empty. Please either enter the content or remove the tier!");
        return;
      }
      }

      if (elementTier4 !== null && elementTier4.getAttribute("class") === "unhidden") {
      if (this.state.tier4Value !== "") {
        tiersValue += ("\nTier 4: " + this.state.tier4Value);
      } else {
        NotificationManager.info("Tier4 content cannot be empty. Please either enter the content or remove the tier!");
        return;
      }
      }

      if (elementTier5 !== null && elementTier5.getAttribute("class") === "unhidden") {
      if (this.state.tier5Value !== "") {
        tiersValue += ("\nTier 5: " + this.state.tier5Value);
      } else {
        NotificationManager.info("Tier5 content cannot be empty. Please either enter the content or remove the tier!");
        return;
      }
      }

      if (elementTier6 !== null && elementTier6.getAttribute("class") === "unhidden") {
      if (this.state.tier6Value !== "") {
        tiersValue += ("\nTier 6: " + this.state.tier6Value);
      } else {
        NotificationManager.info("Tier6 content cannot be empty. Please either enter the content or remove the tier!");
        return;
      }
      }
    }

    const isOk: boolean = window.confirm("The following are the annotation details: " + tiersValue + "\nDo you want to proceed to save an eaf file?");

    if ( isOk ) {
      const eafFileName = prompt("Enter name for EAF: ", "testeaf.eaf");

      const request: RequestInit = {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      }
      };

      if (eafFileName !== null && (this.state.tier1Value !== "" || this.state.tier2Value !== "" ||
      this.state.tier3Value !== "" || this.state.tier4Value !== "" || this.state.tier5Value !== "" ||
      this.state.tier6Value !== "")) {
      let tier1text = this.state.tier1Value;
      let tier2text = this.state.tier2Value;
      let tier3text = this.state.tier3Value;
      let tier4text = this.state.tier4Value;
      let tier5text = this.state.tier5Value;
      let tier6text = this.state.tier6Value;

      if (tier1text === "") {
        tier1text = "EMPTY";
      }
      if (tier2text === "") {
        tier2text = "EMPTY";
      }
      if (tier3text === "") {
        tier3text = "EMPTY";
      }
      if (tier4text === "") {
        tier4text = "EMPTY";
      }
      if (tier5text === "") {
        tier5text = "EMPTY";
      }
      if (tier6text === "") {
        tier6text = "EMPTY";
      }

      fetch(`/annotation/${eafFileName}/${this.props.speakers[0].uploadId}/${this.state.selectStartTime}/${this.state.selectEndTime}/${tier1text}/${tier2text}/${tier3text}/${tier4text}/${tier5text}/${tier6text}`, request)
      .then((response) => response.text())
      .then((eafData) => {
        uploadEaf(eafFileName, this.props.speakers.map((item) => item.fileIndex), eafData, this.props.firebase); }
      ).catch(console.log);
      }
    }
    }
  } else {
    NotificationManager.info("Please select a time window of atleast 1 second to add annotation details!");
  }
  }

  folderBackButtonClicked = async () => {
  await this.setState({
    selectedFolderName: "Uploads",
  });
  this.getUserFiles();
  }

    render() {
  const { isLoading } = this.state;
  if (this.props.speakers[0].uploadId !== null &&
    this.props.speakers[0].uploadId !== "" &&
    this.state.soundLength <= 0 ) {
    this.getBounds();
  }
  return (
            <div>
              <Header/>
              {isLoading && spinner()}
              <div className="peldaview">
                  <ReactFileReader fileTypes={[".wav", ".mp3", ".mpeg"]} multipleFiles={false}
                  handleFiles={this.fileSelected}>
                      <button className="UploadPeldaFile waves-effect waves-light btn globalbtn">
                          <i className="material-icons right">
                              cloud_upload
                          </i>
                          Upload Audio File to cloud
                      </button>
                  </ReactFileReader>
      <div className="metilda-page-content">
      <div id="button-drop-down-image-side-by-side">
        <div id="pelda-drop-down-back-button">
        {this.state.selectedFolderName === "Uploads" &&
        <button className="audioBackButtonDisabled"  disabled={true}>
          <i className="material-icons">arrow_back</i>
        </button>
        }
        {this.state.selectedFolderName !== "Uploads" &&
        <button className="audioBackButton" onClick={() => this.folderBackButtonClicked()}>
          <i className="material-icons">arrow_back</i>
        </button>
        }
        </div>
        <div id="drop-down-and-image">
        {this.renderSpeakers()}
        </div>
      </div>

      <div id="audioLength">
        <p>Audio Time Duration:</p>
        {this.state.soundLength > 0 &&
        <p id="audio-length-label">{this.state.soundLength.toFixed(5)} s</p>
        }
                  </div>
                   <div className="leftMenuBar">
        <div className="menu">
        <button className="mainmenu"> Sound </button>
        <div className="drop-content">
          <button onClick={() => this.getEnergy()}> Get energy </button>
        </div>
        </div> <br /> <br />

        <div className="menu">
           <button className="mainmenu"> Pitch </button>
           <div className="drop-content">
           <button onClick={() => this.countVoicedFrames()}> Count voiced frames </button>
           <button onClick={() => this.getPitchValueAtTime()}> Get value at time </button>
           <button onClick={() => this.getPitchValueInFrame()}> Get value in frame </button>
           </div>
        </div> <br /> <br />

        <div className="menu">
           <button className="mainmenu">Spectrum</button>
           <div className="drop-content">
           <button onClick={() => this.getLowestFrequency()}> Get lowest frequency </button>
           <button onClick={() => this.getHighestFrequency()}> Get highest frequency </button>
           </div>
        </div> <br /> <br />

        <div className="menu">
           <button className="mainmenu"> Intensity </button>
           <div className="drop-content">
           <button onClick={() => this.getMinimumIntensity()}> Get minimum intensity </button>
           <button onClick={() => this.getMaximumIntensity()}> Get maximum intensity </button>
           <button onClick={() => this.getMeanIntensity()}> Get mean intensity </button>
           </div>
        </div> <br /> <br />

        <div className="menu">
           <button className="mainmenu"> Formant </button>
           <div className="drop-content">
           <button onClick={() => this.getNoOfFrames()}> Get number of frames </button>
           <button onClick={() => this.getNoOfFormants()}> Get numbers of formants </button>
           <button onClick={() => this.getFormantFrequencyAtTime()}> Get value at time </button>
           </div>
        </div> <br /> <br />

        <div className="menu">
           <button className="mainmenu"> Harmonicity </button>
           <div className="drop-content">
           <button onClick={() => this.getMinimumHarmonicity()}> Get minimum </button>
           <button onClick={() => this.getMaximumHarmonicity()}> Get maximum </button>
           <button onClick={() => this.getHarmonicityValueAtTime()}> Get value at time </button>
           </div>
        </div> <br /> <br />

        <div className="menu">
           <button className="mainmenu"> PointProcess </button>
           <div className="drop-content">
           <button onClick={() => this.getNoOfPeriods()} > Get number of periods </button>
           <button onClick={() => this.getNoOfPoints()} > Get number of points </button>
           <button onClick={() => this.getJitter()} > Get jitter (local) </button>
           </div>
        </div> <br /> <br />

        <div className="menu">
           <button className="mainmenu"> ELAN Annotation </button>
           <div className="drop-content">
          <button onClick={() => this.addTiers()}  id="addButton" className="addtier"> Add a Tier </button>
          <button onClick={(e) => this.removeTiers(e)}  id="removeButton" className="removetier">
              Remove all Tiers
          </button>
          <button onClick={() => this.saveAnnotations()}  id="saveannotationbutton" className= "saveannotation">
              Save Annotation
          </button>
           </div>
        </div> <br /> <br />
      </div>

      {this.state.selectStartTime >= 0 && this.state.selectEndTime >= 0 &&
      (this.state.selectEndTime - this.state.selectStartTime) > 0 &&
      <div id="selection-interval" className="unhidden">
        <p id="select-start-time" className="unhidden">
          Start Time: {this.state.selectStartTime.toFixed(1)}
        </p>
        <p id="select-end-time" className="unhidden">
          End Time: {this.state.selectEndTime.toFixed(1)}
        </p>
      </div>
      }

      <div id="eaf-interval" className="unhidden">
        <p id="eaf-start-time" className="unhidden">
        </p>
        <p id="eaf-end-time" className="unhidden">
        </p>
      </div>

      <div id="elan-annotation" className="hidden">
        <div id="tier1label" className="hidden">
          <p>Tier 1: <input id="textbox1" onChange={(e) => this.handleTierValue(e)} value={this.state.tier1Value}
          placeholder="E.g. orthographic transcription [blackfoot text]" />
          <button className="DeleteFile waves-effect waves-light btn globalbtn"
          id="removeTier1" onClick={this.removeTier} >
          <i className="material-icons right">delete</i>Delete Tier 1</button></p>
        </div>

        <div id="tier2label" className="hidden">
          <p>Tier 2: <input id="textbox2" onChange={(e) => this.handleTierValue(e)} value={this.state.tier2Value}
          placeholder="E.g. free translation [english text]" />
          <button className="DeleteFile waves-effect waves-light btn globalbtn"
          id="removeTier2" onClick={this.removeTier}>
          <i className="material-icons right">delete</i>Delete Tier 2</button></p>
        </div>

        <div id="tier3label" className="hidden">
          <p>Tier 3: <input id="textbox3" onChange={(e) => this.handleTierValue(e)} value={this.state.tier3Value}
          placeholder="E.g. additional information" />
          <button className="DeleteFile waves-effect waves-light btn globalbtn"
          id="removeTier3" onClick={this.removeTier}>
          <i className="material-icons right">delete</i>Delete Tier 3</button></p>
        </div>

        <div id="tier4label" className="hidden">
          <p>Tier 4: <input id="textbox4" onChange={(e) => this.handleTierValue(e)} value={this.state.tier4Value}
          placeholder="E.g. additional information" />
          <button className="DeleteFile waves-effect waves-light btn globalbtn"
          id="removeTier4" onClick={this.removeTier}>
          <i className="material-icons right">delete</i>Delete Tier 4</button></p>
        </div>

        <div id="tier5label" className="hidden">
          <p>Tier 5: <input id="textbox5" onChange={(e) => this.handleTierValue(e)} value={this.state.tier5Value}
          placeholder="E.g. additional information" />
          <button className="DeleteFile waves-effect waves-light btn globalbtn"
          id="removeTier5" onClick={this.removeTier}>
          <i className="material-icons right">delete</i>Delete Tier 5</button></p>
        </div>

        <div id="tier6label" className="hidden">
          <p>Tier 6: <input id="textbox6" onChange={(e) => this.handleTierValue(e)} value={this.state.tier6Value}
          placeholder="E.g. additional information" />
          <button className="DeleteFile waves-effect waves-light btn globalbtn"
          id="removeTier6" onClick={this.removeTier}>
          <i className="material-icons right">delete</i>Delete Tier 6</button></p>
        </div>
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
    setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) =>
        dispatch(setLetterPitch(speakerIndex, letterIndex, newPitch)),
});

const authCondition = (authUser: any) => !!authUser;
export default connect(mapStateToProps, mapDispatchToProps)(withAuthorization(authCondition)(PeldaView as any));
