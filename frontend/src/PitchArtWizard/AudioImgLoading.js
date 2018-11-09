import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import styles from "./TranscribeAudio.css";

class AudioImgLoading extends React.Component {
    state = {};

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="metilda-audio-analysis-image-loading">
                <div className="preloader-wrapper big active">
                    <div className="spinner-layer spinner-blue-only">
                        <div className="circle-clipper left">
                            <div className="circle"></div>
                        </div>
                        <div className="gap-patch">
                            <div className="circle"></div>
                        </div>
                        <div className="circle-clipper right">
                            <div className="circle"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default AudioImgLoading;