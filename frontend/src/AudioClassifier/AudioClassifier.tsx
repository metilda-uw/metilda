
import React from "react";
import { withAuthorization } from "../Session";
import Header from '../components/header/Header';
// import Select from "react-select";
// import PlayerBar from "../PitchArtWizard/AudioViewer/PlayerBar";
// import UploadAudio from "../Create/UploadAudio";
// import ReactFileReader from "react-file-reader";
import axios from "axios"

import "./AudioClassifier.scss";

export interface ExploreAudioProps {
    firebase: any;
}

interface State {

    type: String
}

export class AudioClassifier extends React.Component<ExploreAudioProps, State> {
    constructor(props: ExploreAudioProps) {
        super(props);

        this.state = {
            type: ""
        };

        //this.updateState=this.updateState.bind(this)
    }


    uploadFile = async (e) => {
        const file = e.target.files[0];
        if (file != null) {
            const data = new FormData();
            data.append('file', file);

            axios.post(
                '/api/audio/classifier'
                , data).then((response) => {
                    console.log(response)
                    if (response.data.success === true) {
                        if (response.data.consonant === true) {
                            this.setState({ type: "Consonant" })
                        } else {
                            this.setState({ type: "Vowel" })
                        }
                    } else {
                        this.setState({ type: "Undetermined" })
                    }
                })

            //    fetch('/api/audio/classifier',
            //     {
            //       method: 'post',
            //       body: data,
            //     }
            //   ).then((response)=>{console.log(response)}).then((data)=>{console.log(data)}).catch((error)=>{console.log(error)});


        }
    };


    // fileSelected() {
    //     console.log("File Selected");
    // }

    // getResults() {
    //     console.log("Get Results");
    // }


    render() {



        return (
            <div>
                <Header />
                <div className="metilda-exploreaudio-content">
                    <h3> MeTILDA - Audio Classifier </h3>

                    <div className="paragraph">
                        <p>This automated audio classifier is powered by Deep Learning technologies and allows you to identify specified sounds within an audio file.</p>
                        <br />
                    </div>


                    <h5> Vowel/Consonant Classifier: </h5>


                    <div className="metilda-explore-review" style = {{ display : "flex",
                        alignItems : "center",
                        justifyContent : "center",
                        flexDirection : "column"}}>
                                 <div>{this.state.type === "" ? `Please upload a .wav file` : this.state.type === "Undetermined" ? `Could not determine the type, please try a different file`: `This is a ${this.state.type}`}</div>
                        <br></br> 
                        <input type="file" onChange={this.uploadFile}>
                        </input>
                        {/* <button className="metilda-exploreaudio-results waves-effect waves-light btn globalbtn">Predict!</button> */}
                   <br></br>
                   <br></br>
                   <br></br>
                        <p> Warning: Note that because our deep learning model has an 88% score accuracy,
                            <br>
                            </br>there is 12 % chance misclassiffication.</p>

                    </div>

                </div>
            </div>
        );
    }
}
const authCondition = (authUser: any) => !!authUser;
export default (withAuthorization(authCondition)(AudioClassifier as any));