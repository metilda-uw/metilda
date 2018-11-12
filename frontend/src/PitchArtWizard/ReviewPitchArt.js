import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import queryString from 'query-string';
import PitchArt from "./PitchArt";
import "./ReviewPitchArt.css"

class ReviewPitchArt extends React.Component {
    state = {};

    constructor(props) {
        super(props);
        let urlMap = queryString.parse(this.props.location.search);

        this.state = {
            times: urlMap["t"].map(parseFloat),
            pitches: urlMap["p"].map(parseFloat)
        };

        console.log(this.state);
    }

    componentDidMount() {
       console.log();
    }

    render() {
        return (
            <div>
                <div className="wizard-header">
                    <h3>Pitch Art Wizard</h3>
                    <h4>Review Pitch Art (step 4/4)</h4>
                </div>
                <div className="pitch-art-container">
                    <PitchArt width={700}
                              height={500}
                              pitches={[85, 107, 68, 59]}/>
                </div>
            </div>
        )
    }
}

export default ReviewPitchArt;