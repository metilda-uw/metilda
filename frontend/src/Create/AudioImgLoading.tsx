import * as React from "react";

class AudioImgLoading extends React.Component {
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
        );
    }
}

export default AudioImgLoading;
