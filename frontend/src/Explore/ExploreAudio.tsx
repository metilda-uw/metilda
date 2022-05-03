import * as React from "react";
import { withAuthorization } from "../Session";
import Header from "../Layout/Header";
import Select from "react-select";
import UploadAudio from "../Create/UploadAudio";
import ReactFileReader from "react-file-reader"

import "./ExploreAudio.css"
import PlayerBar from "../PitchArtWizard/AudioViewer/PlayerBar";

export interface ExploreAudioProps {
    firebase: any;
}

interface State {
}

export class ExploreAudio extends React.Component<ExploreAudioProps, State> {
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
            
                <div className="container m-t-16">
                    <p>"Hi.  This is the Explore Page where you can use Machine Learning to explore words."</p>
                    <div className="row m-b-16">
                        <div className="col s5">
                            <Select
                                className="fileOptions"
                                placeholder="Select Sound File"
                                options={files}/>
                        </div>
                        <div className="col s5">
                            <Select
                                className="modelOptions"
                                placeholder="Select Sound Type"
                                options={options}/>
                        <div className="col s2">
                            <button className="waves-effect waves-light btn globalbtn" onClick={this.getResults}>Get Results</button>
                        </div>
                    </div>        
                        </div>
                        <div className="section">
                        <div className="row">
                            <div className="col s4">
                                <p>Found selected sound in:</p>
                            </div>
                            <div className="col s8">
                                <PlayerBar audioUrl="http://sound.com" /></div>              
                            </div>
                        </div>
                        
                    </div>
                </div>
              
        );
    }
}
const authCondition = (authUser: any) => !!authUser;
export default (withAuthorization(authCondition)(ExploreAudio as any));
