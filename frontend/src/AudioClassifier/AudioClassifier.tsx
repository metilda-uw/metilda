


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

        // https://react-select.com/home
        const options = [
            { value: 'vowel', label: 'Vowel' },
            { value: 'consonant', label: 'Consonant' },
            { value: 'h-sound', label: 'H-Sound' }
        ]

        const files = [{value: 'TestFile.wav', label: 'TestFile.wav'}];
        
        return (
            <div>
                <Header/>
                <div className="metilda-page-content">
                    <p>"This is the Explore Page where you can use Machine Learning to explore words."</p>
                    <div className="metilda-content-explore-select-options row">
                        <div className="metilda-explore-select-sound col s12">
                            <Select
                                className="metilda-explore-select-sound-elements file-options"
                                placeholder="Select Sound File"
                                options={files}/>

                            <Select
                                className="metilda-explore-select-sound-elements sound-options"
                                placeholder="Select Sound Type"
                                options={options}
                            />
                            <button className="metilda-explore-select-sound-elements waves-effect waves-light btn globalbtn" onClick={this.getResults}>Get Results</button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="metilda-explore-review">
                            <div className="metilda-explore-results col s4">
                                <p>Found selected sound in:</p>
                                <p>file1.wav</p>
                                <p>file2.wav</p>
                            </div>
                            <div className="metilda-explore-playerbar col s8">
                                <PlayerBar audioUrl="http://sound.com" />
                            </div> 
                        </div>             
                    </div>
                        
                </div>
             </div> 
        );
    }
}
const authCondition = (authUser: any) => !!authUser;
export default (withAuthorization(authCondition)(AudioClassifier as any));