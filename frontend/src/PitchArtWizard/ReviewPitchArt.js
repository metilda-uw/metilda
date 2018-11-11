import React, {Component} from 'react';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';

class ReviewPitchArt extends React.Component {
    state = {};

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className="wizard-header">
                    <h3>Pitch Art Wizard</h3>
                    <h4>Review Pitch Art (step 4/4)</h4>
                </div>
            </div>
        )
    }
}

export default ReviewPitchArt;