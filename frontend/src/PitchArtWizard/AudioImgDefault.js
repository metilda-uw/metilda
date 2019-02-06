import React, {Component} from 'react';
import styles from "./TranscribeAudio.css";

class AudioImgDefault extends React.Component {
    state = {};

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="metilda-audio-analysis-image-default">
                <p>Choose an audio file to begin</p>
            </div>
        )
    }
}

export default AudioImgDefault;