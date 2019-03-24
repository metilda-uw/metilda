import * as React from "react";
import "./WordSyllableCategories.css";
import {ChangeEvent, SyntheticEvent} from "react";
import pitchArt21 from "./images/Pitch Art - 21-01.jpg";
import pitchArt22 from "./images/Pitch Art - 22-01.jpg";
import pitchArt31 from "./images/Pitch Art - 31-01.jpg";
import pitchArt32 from "./images/Pitch Art - 32-01.jpg";
import pitchArt33 from "./images/Pitch Art - 33-01.jpg";
import pitchArt41 from "./images/Pitch Art - 41-01.jpg";
import pitchArt42 from "./images/Pitch Art - 42-01.jpg";
import pitchArt43 from "./images/Pitch Art - 43-01.jpg";

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

    imageSrcList = () => {
        switch (this.state.numSyllables) {
            case 2:
                return [pitchArt21, pitchArt22];
            case 3:
                return [pitchArt31, pitchArt32, pitchArt33];
            case 4:
                return [pitchArt41, pitchArt42, pitchArt43];
            default:
                return [];
        }
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
                    <div className="row">
                        <div className="col s6">
                            <div className="col s12 pitch-art-img-list">
                                { this.imageSrcList().map((item, index) =>
                                    <img src={item}
                                         key={"pitch-art-img-list-item-" + index}
                                         className="pitch-art-img-list-item"/>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}