import * as React from 'react';
import './WordSyllableReview.css';
import {MetildaWord} from "./types";
import update from "immutability-helper";
import {RouteComponentProps} from "react-router";
import {Letter} from "../../types/types";

interface MatchParams  {
    numSyllables: string
}

interface Props extends RouteComponentProps<MatchParams> {}

interface State {
    activeWordIndex: number;
    words: Array<MetildaWord>
}

class WordSyllableReview extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            activeWordIndex: -1,
            words: [
                {
                    text: "Onni"
                },
                {
                    text: "Isska"
                },
                {
                    text: "Kayiis"
                }
            ]
        };
    }

    wordClicked = (index: number) => {
        this.setState({activeWordIndex: index});
    };

    render() {
        return (
            <div>
                <ol className="metilda-breadcrumb-list">
                   <li className="metilda-breadcrumb-list-item">
                        Blackfoot Syllables
                   </li>
                    <li className="metilda-breadcrumb-list-item">
                        >
                    </li>
                    <li className="metilda-breadcrumb-list-item">
                        {this.props.match.params.numSyllables} Syllables
                    </li>
                </ol>
                <div id="metilda-syllable-view">
                    <div className="row">
                        <div className="col s4">
                            <ul className="collection">
                                {
                                    this.state.words.map((word, index) =>
                                        <li key={"metilda-word-" + index}
                                            className={"collection-item " + (index == this.state.activeWordIndex ? "active": "")}
                                            onClick={() => (this.wordClicked(index))}>
                                            {word.text}
                                        </li>
                                    )
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default WordSyllableReview;