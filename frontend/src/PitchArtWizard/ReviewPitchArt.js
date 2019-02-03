import React, {Component} from 'react';
import queryString from 'query-string';
import PitchArt from "./PitchArt";
import "./ReviewPitchArt.css"

class ReviewPitchArt extends React.Component {
    state = {};

    constructor(props) {
        super(props);
        let urlMap = queryString.parse(this.props.location.search);

        this.state = {
            pitches: urlMap["p"].map(parseFloat)
        };
    }

    render() {
        return (
            <div>
                <div className="wizard-header">
                    <h3>Pitch Art Wizard</h3>
                    <h4>Review Pitch Art (step 3/3)</h4>
                </div>
                <div className="pitch-art-container">
                    <PitchArt width={700}
                              height={500}
                              pitches={this.state.pitches}/>
                </div>
            </div>
        )
    }
}

export default ReviewPitchArt;