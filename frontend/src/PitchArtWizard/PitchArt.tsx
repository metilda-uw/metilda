import * as React from "react";
import './PitchArt.css';
import PitchArtDrawingWindow from "./PitchArtDrawingWindow";

interface Letter {
    // TODO: replace with actual implementation
}

interface Props {
    width: number,
    height: number
    minPitch: number
    maxPitch: number
    uploadId: number
    manualPitchChange: number
    maxPitchIndex: number
    showAccentPitch: boolean
    showSyllableText: boolean
    showVerticallyCentered: boolean
    showPitchArtLines: boolean
    showLargeCircles: boolean
    letters: Array<Letter>
}


class PitchArt extends React.Component<Props> {
    hiddenRef?: PitchArtDrawingWindow;
    visibleRef?: PitchArtDrawingWindow;

    constructor(props: Props) {
        super(props);

        this.saveImage = this.saveImage.bind(this);
        this.playPitchArt = this.playPitchArt.bind(this);
        this.createPitchArt = this.createPitchArt.bind(this);
    }

    saveImage() {
        this.hiddenRef!.saveImage();
    }

    playPitchArt() {
        this.visibleRef!.playPitchArt();
    }

    createPitchArt(isVisible: boolean, refName: string) {
        return (<PitchArtDrawingWindow
                        //ref={node => { this[refName] = node}}
                        isVisible={isVisible}
                        width={this.props.width}
                        height={this.props.height}
                        minPitch={this.props.minPitch}
                        maxPitch={this.props.maxPitch}
                        uploadId={this.props.uploadId}
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
        // TODO: Check that this new ref lookup works
        let visiblePitchArt = this.createPitchArt(true, 'visibleRef');
        this.visibleRef = visiblePitchArt.props.ref;

        let hiddenPitchArt = this.createPitchArt(false, 'hiddenRef');
        this.hiddenRef = hiddenPitchArt.props.ref;

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