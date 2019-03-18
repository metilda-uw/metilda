import * as React from 'react';

interface Props {}

class AudioImgDefault extends React.Component<Props> {
    constructor(props: Props) {
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