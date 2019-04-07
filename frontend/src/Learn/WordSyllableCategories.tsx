import * as queryString from "query-string";
import * as React from "react";
import {ChangeEvent} from "react";
import {Link, RouteComponentProps} from "react-router-dom";
import pitchArt21 from "./images/Pitch Art - 21-01.jpg";
import pitchArt22 from "./images/Pitch Art - 22-01.jpg";
import pitchArt31 from "./images/Pitch Art - 31-01.jpg";
import pitchArt32 from "./images/Pitch Art - 32-01.jpg";
import pitchArt33 from "./images/Pitch Art - 33-01.jpg";
import pitchArt41 from "./images/Pitch Art - 41-01.jpg";
import pitchArt42 from "./images/Pitch Art - 42-01.jpg";
import pitchArt43 from "./images/Pitch Art - 43-01.jpg";
import "./WordSyllableCategories.css";

export default class WordSyllableCategories extends React.Component<RouteComponentProps> {

    handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const name = event.currentTarget.name;
        const value = event.currentTarget.value;
        this.setState({[name]: parseFloat(value)} as any);
    }

    getNumSyllables = (): number => {
        const values = queryString.parse(this.props.location.search);
        const numSyllables = values.numSyllables as string;

        if (!numSyllables) {
            return 2;
        }

        return parseFloat(numSyllables);
    }

    imageSrcList = () => {
        switch (this.getNumSyllables()) {
            case 2:
                return [pitchArt21, pitchArt22];
            case 3:
                return [pitchArt31, pitchArt32, pitchArt33];
            case 4:
                return [pitchArt41, pitchArt42, pitchArt43];
            default:
                return [];
        }
    }

    render() {
        const numSyllables = this.getNumSyllables();
        return (
            <div>
                <div className="metilda-page-header">
                    <h5>
                        Blackfoot Words
                    </h5>
                </div>
                <div className="metilda-page-content">
                    <div className="row syllable-selection-row">
                        <div className="col s4">
                            <div id="syllable-selection" className="col s12">
                                <p className="inline-btns-label">Number of syllables</p>
                                <div className="inline-btns">
                                    <Link to="/learn/words/syllables?numSyllables=2">
                                        <p>
                                            <label>
                                                <input name="numSyllables"
                                                       type="radio"
                                                       value="2"
                                                       onChange={this.handleInputChange}
                                                       checked={numSyllables === 2}/>
                                                <span>2</span>
                                            </label>
                                        </p>
                                    </Link>
                                    <Link to="/learn/words/syllables?numSyllables=3">
                                        <p>
                                            <label>
                                                <input name="numSyllables"
                                                       type="radio"
                                                       value="3"
                                                       onChange={this.handleInputChange}
                                                       checked={numSyllables === 3}/>
                                                <span>3</span>
                                            </label>
                                        </p>
                                    </Link>
                                    <Link to="/learn/words/syllables?numSyllables=4">
                                        <p>
                                            <label>
                                                <input name="numSyllables"
                                                       type="radio"
                                                       value="4"
                                                       onChange={this.handleInputChange}
                                                       checked={numSyllables === 4}/>
                                                <span>4</span>
                                            </label>
                                        </p>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s6">
                            <div className="col s12 pitch-art-img-list">
                                {this.imageSrcList().map((item, index) =>
                                    <Link to={"/learn/words/syllables/" + numSyllables + "?accentIndex=" + index}>
                                        <img src={item}
                                             key={"pitch-art-img-list-item-" + index}
                                             className="pitch-art-img-list-item"/>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
