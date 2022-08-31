import "./PitchArt.css";

import * as React from "react";
import { createRef } from "react";
import { Letter, Speaker } from "../../types/types";

import PitchArtDrawingWindow from "./PitchArtDrawingWindow";

import SaveAnalysisFirestore from "../../Components/create/SaveAnalysisFirestore";

interface Props {
  width: number;
  height: number;
  minPitch: number;
  maxPitch: number;
  minTime: number;
  maxTime: number;
  uploadId: string;
  setLetterPitch: (
    speakerIndex: number,
    letterIndex: number,
    newPitch: number
  ) => void;
  showAccentPitch: boolean;
  showSyllableText: boolean;
  showVerticallyCentered: boolean;
  showPitchArtLines: boolean;
  showLargeCircles: boolean;
  showTimeNormalization: boolean;
  showPitchScale: boolean;
  showPerceptualScale: boolean;
  showPitchArtImageColor: boolean;
  showMetildaWatermark: boolean;
  speakers: Speaker[];
  firebase: any;
}

class PitchArt extends React.Component<Props> {
  private hiddenRef = createRef<any>();
  private visibleRef = createRef<any>();

  constructor(props: Props) {
    super(props);

    this.saveImage = this.saveImage.bind(this);
    this.downloadImage = this.downloadImage.bind(this);
    this.saveThumbnail = this.saveThumbnail.bind(this);
    this.playPitchArt = this.playPitchArt.bind(this);
    this.createPitchArt = this.createPitchArt.bind(this);
  }

  saveImage() {
    if (this.props.showPitchArtImageColor) {
      this.hiddenRef.current!.saveImage();
    } else {
      this.visibleRef.current!.saveImage();
    }
  }

  downloadImage() {
    if (this.props.showPitchArtImageColor) {
      this.hiddenRef.current!.downloadImage();
    } else {
      this.visibleRef.current!.downloadImage();
    }
  }

  saveThumbnail(id: string) {
    if (this.props.showPitchArtImageColor) {
      this.hiddenRef.current!.uploadImageWithId(id);
    } else {
      this.visibleRef.current!.uploadImageWithId(id);
    }
  }

  playPitchArt() {
    this.visibleRef.current!.playPitchArt();
  }

  createPitchArt(isVisible: boolean) {
    return (
      <PitchArtDrawingWindow
        ref={isVisible ? this.visibleRef : this.hiddenRef}
        showArtDesign={!isVisible}
        showDynamicContent={isVisible}
        width={this.props.width}
        height={this.props.height}
        minPitch={this.props.minPitch}
        maxPitch={this.props.maxPitch}
        minTime={this.props.minTime}
        maxTime={this.props.maxTime}
        fileName={this.props.uploadId}
        setLetterPitch={this.props.setLetterPitch}
        showAccentPitch={this.props.showAccentPitch}
        showSyllableText={this.props.showSyllableText}
        showVerticallyCentered={this.props.showVerticallyCentered}
        showPitchArtLines={this.props.showPitchArtLines}
        showLargeCircles={this.props.showLargeCircles}
        showTimeNormalization={this.props.showTimeNormalization}
        showPitchScale={this.props.showPitchScale}
        showPerceptualScale={this.props.showPerceptualScale}
        showPitchArtImageColor={this.props.showPitchArtImageColor}
        showMetildaWatermark={this.props.showMetildaWatermark}
        showPrevPitchValueLists={false}
        speakers={this.props.speakers}
        firebase={this.props.firebase}
      />
    );
  }

  render() {
    const visiblePitchArt = this.createPitchArt(true);
    const hiddenPitchArt = this.createPitchArt(false);

    return (
      <div>
        <div>{visiblePitchArt}</div>
        <div className="hide">{hiddenPitchArt}</div>
        <div id="metilda-pitch-art-btn-container">
          <button
            className="waves-effect waves-light btn globalbtn metilda-pitch-art-btn"
            disabled={
              this.props.speakers.length !== 1 ||
              this.props.speakers[0].letters.length === 0
            }
            onClick={this.playPitchArt}
          >
            <i className="material-icons right">play_circle_filled</i>
            Play Tones
          </button>
          <button
            className="waves-effect waves-light btn globalbtn metilda-pitch-art-btn"
            disabled={this.props.speakers.length === 0}
            onClick={this.saveImage}
          >
            <i className="material-icons right">cloud_upload</i>
            Save Image
          </button>
          <button
            className="waves-effect waves-light btn globalbtn metilda-pitch-art-btn"
            disabled={this.props.speakers.length === 0}
            onClick={this.downloadImage}
          >
            Download Image
            <i className="material-icons right">file_download</i>
          </button>
        </div>
        <SaveAnalysisFirestore
          analysis={this.props.speakers}
          saveThumbnail={this.saveThumbnail}
        ></SaveAnalysisFirestore>
      </div>
    );
  }
}

export default PitchArt;
