
import React from "react";
import { withAuthorization } from "../Session";
import Header from '../components/header/Header';
import Select from "react-select";
import PlayerBar from "../PitchArtWizard/AudioViewer/PlayerBar";
import UploadAudio from "../Create/UploadAudio";
import ReactFileReader from "react-file-reader";

import "./AudioClassifier.scss";

export interface ExploreAudioProps {
    firebase: any;
}

interface State {
}

export class AudioClassifier extends React.Component<ExploreAudioProps, State> {
    constructor(props: ExploreAudioProps) {
        super(props);

        this.state = {
        };
    }

    fileSelected() {
        console.log("File Selected");
    }

    getResults() {
        console.log("Get Results");
    }


    render () {

        const files = [{value: 'TestFile.wav', label: 'TestFile.wav'}];

        const options = [
            { value: 'vowelconsonant', label: 'Vowel/Consonant' },
            { value: 'other', label: 'Other...' },
        ]
        
        return (
            <div>
                <Header/>
                <div className="metilda-exploreaudio-content">
                    <h3> MeTILDA - Audio Classifier </h3>
                    
                    <div className="paragraph">
                    <p>This automated audio classifier is powered by Machine Learning technologies and allows you to identify specified sounds within an audio file.</p>
                    <br />
                    </div>


                    <h5> Classifier: </h5>
                    <div className="metilda-exploreaudio-select-audio row">
                        <div className="metilda-exploreaudio-select-sound col s12">
                            <Select
                                className="metilda-exploreaudio-select-file-options"
                                placeholder="Select audio file..."
                                options={files}/>

                            <div className="metilda-explore-playerbar col s15">
                                <PlayerBar audioUrl="http://sound.com" />
                            </div>    

                            
                        </div>
                    </div>
                    <div className="row">
                       <div className="metilda-explore-review">
                           
                       <Select
                                className="metilda-exploreaudio-select-sound-options"
                                placeholder="Select sound to classify..."
                                options={options}
                            />
                        <button className="metilda-exploreaudio-results waves-effect waves-light btn globalbtn" onClick={this.getResults}>Predict!</button>
                            
                       </div>   
                                 
                    </div>
                        
                </div>
             </div> 
        );
    }
}
const authCondition = (authUser: any) => !!authUser;
export default (withAuthorization(authCondition)(AudioClassifier as any));