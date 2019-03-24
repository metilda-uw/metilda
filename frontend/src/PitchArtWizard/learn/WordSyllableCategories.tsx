import * as React from "react";
import "./WordSyllableCategories.css";
import {ChangeEvent, SyntheticEvent} from "react";

interface Props {

}

interface State {
    numSyllables: number
}

export default class WordSyllableCategories extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            numSyllables: 2
        };
    }

    handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        let name = event.currentTarget.name;
        let value = event.currentTarget.value;
        this.setState({[name]: parseFloat(value)} as any);
    };

    render() {
        return (
            <div>
                <div className="metilda-page-header">
                    <h5>
                        Blackfoot Words
                    </h5>
                </div>
                <div className="metilda-page-content">
                    <div className="row">
                        <div className="col s4">
                            <div id="syllable-selection" className="col s12">
                                <p className="inline-btns-label">Number of syllables</p>
                                <div className="inline-btns">
                                    <p>
                                        <label>
                                            <input name="numSyllables"
                                                   type="radio"
                                                   value="2"
                                                   onChange={this.handleInputChange}
                                                   checked={this.state.numSyllables === 2}/>
                                            <span>2</span>
                                        </label>
                                    </p>
                                    <p>
                                        <label>
                                            <input name="numSyllables"
                                                   type="radio"
                                                   value="3"
                                                   onChange={this.handleInputChange}
                                                   checked={this.state.numSyllables === 3}/>
                                            <span>3</span>
                                        </label>
                                    </p>
                                    <p>
                                        <label>
                                            <input name="numSyllables"
                                                   type="radio"
                                                   value="4"
                                                   onChange={this.handleInputChange}
                                                   checked={this.state.numSyllables === 4}/>
                                            <span>4</span>
                                        </label>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}