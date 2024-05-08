import "./LearnNew.css";

import React, { useContext, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { useDocumentData } from "react-firebase-hooks/firestore";

import FirebaseContext from "../Firebase/context";

import Header from "../Components/header/Header";

import PitchArtDrawingWindow from "../PitchArtWizard/PitchArtViewer/PitchArtDrawingWindow";
import PitchRange from "../PitchArtWizard/AudioViewer/PitchRange";
import PitchArtPrevPitchValueToggle from "../Learn/PitchArtPrevPitchValueToggle";

import {
  PitchRangeDTO,
  RawPitchValue,
} from "../PitchArtWizard/PitchArtViewer/types";

import Recorder from "recorder-js";

export default function LearnNew() {
  const params = useParams();
  const collection = params['type'];
  const id = params['id'];

  const firebase = useContext(FirebaseContext);
  const [showPrevPitchValueLists, setShowPrevPitchValueLists] = useState(false);
  const [userPitchValueLists, setUserPitchValueLlists] = useState([]);

  const [minPitch, setMinPitch] = useState(75.0);
  const [maxPitch, setMaxPitch] = useState(500.0);

  const [isRecording, setIsRecording] = useState(false);

  const _audioImgWidth = useRef(653);
  const _defaultMinAnalysisPitch = useRef(75);
  const _defaultMaxAnalysisPitch = useRef(500);
  const pitchArtRef = useRef<any>();

  const [word, loading, error] = useDocumentData(
    firebase.firestore.doc(collection + "/" + id),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  let recorder: any;

  let speakers = [];
  speakers.push(word);

  const applyPitchRange = (minPitch: number, maxPitch: number) => {
    setMinPitch(minPitch);
    setMaxPitch(maxPitch);
  };

  const toggleRecord = async () => {
    const audioClass =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    const audioContext = new audioClass();

    if (recorder == null) {
      recorder = new Recorder(audioContext);
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => recorder.init(stream).then(() => recorder.start()))
        .catch((err) => console.error("Unable to initiate recording", err));
      setIsRecording(true);
    } else {
      //const controller = this;
      const result = await recorder.stop();
      const formData = new FormData();
      formData.append("file", result.blob);
      const response = await fetch(
        `/api/upload/pitch/range?min-pitch=30.0&max-pitch=300.0`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        }
      );
      const data = await response.json();
      const pitchValues: RawPitchValue[] = (data as PitchRangeDTO).pitches.map(
        (item) =>
          ({ t0: item[0], t1: item[0], pitch: item[1] } as RawPitchValue)
      );
      // controller.recorder = null;
      // controller.setState({
      //   userPitchValueLists: controller.state.userPitchValueLists.concat([
      //     pitchValues,
      //   ]),
      //   isRecording: false,
      // });
      const url = URL.createObjectURL(result.blob);
      // const audio = new Audio(url);
      // const recording = await audio.play();

      // setState({
      //   showRecordingConfirmationModal: true,
      //   recordingResult: result,
      // });
    }
  };

  const playPitchArt = () => {
    pitchArtRef.current!.playPitchArt();
  };

  return (
    <div>
      <div className="metilda-page-learn">
        <Header />
        <h6 className="metilda-control-header">Learn</h6>
        <div className="row">
          <div className="col s4">
            <div className="metilda-pitch-art-container-control-list">
              <PitchRange
                initMinPitch={minPitch}
                initMaxPitch={maxPitch}
                applyPitchRange={applyPitchRange}
              />
            </div>
            <h6 className="metilda-control-header">Previous Recordings</h6>
            {/* {this.renderPreviousRecordings()} */}
            <h6 className="metilda-control-header">Pitch Art</h6>
            {/* <div className="metilda-pitch-art-container-control-list col s12">
              <PitchArtPrevPitchValueToggle
                handleInputChange={this.handleInputChange}
                showPrevPitchValueLists={this.state.showPrevPitchValueLists}
              />
            </div> */}
            <div className="row metilda-pitch-art-container-control-toggle-list">
              {/* <PitchArtToggle
              label="Show Sample Pitch Tracking"
              inputName="showRedDot"
              isSelected={this.state.showRedDot}
              offText="Hide"
              onText="Show"
              onChange={this.toggleChanged}
            /> */}
            </div>
            <div className="col metilda-pitch-art-container-control-toggle-list">
              {/* <Typography
              align="left"
              color={"textPrimary"}
              id="discrete-slider-small-steps"
              gutterBottom
            >
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
                onChange={(event, value) =>
                  this.onSliderChangePitch(value as number)
                }
                value={this.state.pitchValue}
              />
            </ThemeProvider>
            <Typography
              align="left"
              color={"textPrimary"}
              id="discrete-slider-small-steps"
              gutterBottom
            >
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
                onChange={(event, value) =>
                  this.onSliderChangeSpeed(value as number)
                }
                value={this.state.speedValue}
              />
            </ThemeProvider> */}
            </div>
          </div>
          {/* {this.state.isLoadingPitchResults && spinner()} */}
          <div className="col s8">
            <div className="metilda-syllable-pitch-art">
              {word && (
                <PitchArtDrawingWindow
                  ref={pitchArtRef}
                  showArtDesign={true}
                  showDynamicContent={true}
                  width={653}
                  height={600}
                  minPitch={75}
                  maxPitch={500}
                  // minTime={0}
                  // maxTime={2.0}
                  fileName={word["uploadId"]}
                  setLetterPitch={(x, y, z) => null}
                  showAccentPitch={true}
                  showSyllableText={true}
                  showVerticallyCentered={true}
                  showPitchArtLines={true}
                  showTimeNormalization={false}
                  showPitchScale={false}
                  showPerceptualScale={true}
                  showLargeCircles={true}
                  showPitchArtImageColor={true}
                  showMetildaWatermark={false}
                  showPrevPitchValueLists={showPrevPitchValueLists}
                  speakers={speakers}
                  rawPitchValueLists={userPitchValueLists}
                  firebase={firebase}
                />
              )}
              {/* <PlayerBar
              audioUrl={AudioAnalysis.formatAudioUrl(
                this.state.words[this.state.activeWordIndex].uploadId,
                this.minPitchArtTime(),
                this.maxPitchArtTime()
              )}
            /> */}
              <div className="pitch-art-controls-container">
                <button
                  className="waves-effect waves-light btn metilda-btn align-left globalbtn"
                  // onClick={this.clearPrevious}
                  // disabled={
                  //   this.state.isRecording ||
                  //   this.state.userPitchValueLists.length === 0
                  // }
                >
                  Clear
                </button>
                <div className="pitch-art-btn-container">
                  <button
                    className="waves-effect waves-light btn metilda-btn globalbtn"
                    onClick={toggleRecord}
                    //   disabled={this.state.isLoadingPitchResults}
                  >
                    {!isRecording ? "Start Record" : "Stop Record"}
                    <i className="material-icons right">record_voice_over</i>
                  </button>
                  <button
                    className="waves-effect waves-light btn metilda-btn globalbtn"
                    onClick={playPitchArt}
                    // disabled={this.state.isRecording}
                  >
                    <i className="material-icons right">play_circle_filled</i>
                    Play Tones
                  </button>
                  <button
                    className="waves-effect waves-light btn metilda-btn globalbtn"
                    //   onClick={this.saveImageforLearn}
                    //   disabled={this.state.isRecording}
                  >
                    <i className="material-icons right">cloud_upload</i>
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
