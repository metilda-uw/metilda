import * as React from "react";
import { withAuthorization } from "../Session";
import Header from "../Layout/Header";
import Select from "react-select";
import ReactFileReader from "react-file-reader"

import "./explore.css";

export interface ExploreContainerProps {
    firebase: any;
}

interface State {
}

export class ExploreContainer extends React.Component<ExploreContainerProps, State> {
    constructor(props: ExploreContainerProps) {
        super(props);

        this.state = {

        };
    }


    fileSelected() {
        console.log("File Selected");
    }

    render () {

        // https://react-select.com/home
        const options = [
            { value: 'vowel', label: 'Vowel' },
            { value: 'consonant', label: 'Consonant' }
        ]
        
        return (
            <div>
                <Header/>
            
                <div style={{width: '300px'}}>
                    <Select 
                    className="selectOptions"
                    options={options}/>
                    <button>Get Results</button>
                </div>
                <div style={{width: '300px'}}>
                    <ReactFileReader fileTypes={[".wav"]} multipleFiles={false} handleFiles={this.fileSelected}>
                    <button className="UploadFile waves-effect waves-light btn globalbtn">
                        <i className="material-icons right">
                            cloud_upload
                        </i>
                        Select Test File
                    </button>
                </ReactFileReader>
                </div>



                
                <p>"This is the Explore Page where you can use Machine Learning to explore words."</p>
            
            </div>
            
        );
    }
}

const authCondition = (authUser: any) => !!authUser;
export default (withAuthorization(authCondition)(ExploreContainer as any));
