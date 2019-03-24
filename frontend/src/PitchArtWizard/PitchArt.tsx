import * as React from "react";
import './PitchArt.css';
import PitchArtDrawingWindow from "./PitchArtDrawingWindow";
import {Letter} from "../types/types";
import {createRef} from "react";


interface Props {
    width: number,
    height: number
    minPitch: number
    maxPitch: number
    uploadId: string
    manualPitchChange: (index: number, newPitch: number) => void,
    maxPitchIndex: number
    showAccentPitch: boolean
    showSyllableText: boolean
    showVerticallyCentered: boolean
    showPitchArtLines: boolean
    showLargeCircles: boolean
    letters: Array<Letter>
}


class PitchArt extends React.Component<Props> {
    private hiddenRef = createRef<PitchArtDrawingWindow>();
    private visibleRef = createRef<PitchArtDrawingWindow>();

    constructor(props: Props) {
        super(props);

        this.saveImage = this.saveImage.bind(this);
        this.playPitchArt = this.playPitchArt.bind(this);
        this.createPitchArt = this.createPitchArt.bind(this);
    }

    saveImage() {
        this.hiddenRef.current!.saveImage();
    }

    playPitchArt() {
        this.visibleRef.current!.playPitchArt();
    }

    createPitchArt(isVisible: boolean) {
        return (<PitchArtDrawingWindow
                        ref={isVisible ? this.visibleRef : this.hiddenRef}
                        isVisible={isVisible}
                        width={this.props.width}
                        height={this.props.height}
                        minPitch={this.props.minPitch}
                        maxPitch={this.props.maxPitch}
                        fileName={this.props.uploadId}
                        manualPitchChange={this.props.manualPitchChange}
                        maxPitchIndex={this.props.maxPitchIndex}
                        showAccentPitch={this.props.showAccentPitch}
                        showSyllableText={this.props.showSyllableText}
                        showVerticallyCentered={this.props.showVerticallyCentered}
                        showPitchArtLines={this.props.showPitchArtLines}
                        showLargeCircles={this.props.showLargeCircles}
                        letters={this.props.letters}/>);
    }

    render() {
        let visiblePitchArt = this.createPitchArt(true);
        let hiddenPitchArt = this.createPitchArt(false);

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
                            disabled={this.props.letters.length === 0}
                            onClick={this.playPitchArt}>
                        Play
                    </button>
                    <button className="waves-effect waves-light btn metilda-pitch-art-btn"
                            disabled={this.props.letters.length === 0}
                            onClick={this.saveImage}>
                        Save Image
                    </button>
                </div>
            </div>
        )
    }
}

export default PitchArt;