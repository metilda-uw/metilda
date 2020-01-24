import * as React from "react";
import {createRef} from "react";
import {Letter, Speaker} from "../../types/types";
import "./PitchArt.css";
import PitchArtDrawingWindow from "./PitchArtDrawingWindow";

interface Props {
    width: number;
    height: number;
    minPitch: number;
    maxPitch: number;
    uploadId: string;
    setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) => void;
    showAccentPitch: boolean;
    showSyllableText: boolean;
    showVerticallyCentered: boolean;
    showPitchArtLines: boolean;
    showLargeCircles: boolean;
    showTimeNormalization: boolean;
    showPitchScale: boolean;
    showPerceptualScale: boolean;
    showPitchArtImageColor: boolean;
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

    playPitchArt() {
        this.visibleRef.current!.playPitchArt();
    }

    createPitchArt(isVisible: boolean) {
        return (<PitchArtDrawingWindow
                        ref={isVisible ? this.visibleRef : this.hiddenRef}
                        showArtDesign={!isVisible}
                        showDynamicContent={isVisible}
                        width={this.props.width}
                        height={this.props.height}
                        minPitch={this.props.minPitch}
                        maxPitch={this.props.maxPitch}
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
                        showPrevPitchValueLists={false}
                        speakers={this.props.speakers}
                        firebase={this.props.firebase}/>);
    }

    render() {
        const visiblePitchArt = this.createPitchArt(true);
        const hiddenPitchArt = this.createPitchArt(false);

        return (
            <div>
                <div>
                    {visiblePitchArt}
                </div>
                <div className="hide">
                    {hiddenPitchArt}
                </div>
                <div id="metilda-pitch-art-btn-container">
                    <button className="waves-effect waves-light btn metilda-pitch-art-btn"
                            disabled={this.props.speakers.length !== 1 || this.props.speakers[0].letters.length === 0}
                            onClick={this.playPitchArt}>
                        <i className="material-icons right">
                            play_circle_filled
                        </i>
                        Play Tones
                    </button>
                    <button className="waves-effect waves-light btn metilda-pitch-art-btn"
                            disabled={this.props.speakers.length === 0}
                            onClick={this.saveImage}>
                        <i className="material-icons right">
                            cloud_upload
                        </i>
                        Save Image
                    </button>
                    <button className="waves-effect waves-light btn metilda-pitch-art-btn"
                            disabled={this.props.speakers.length === 0}
                            onClick={this.downloadImage}>
                        Download Image
                        <i className="material-icons right">
                            file_download
                        </i>
                    </button>
                </div>
            </div>
        );
    }
}

export default PitchArt;
