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
import { withAuthorization } from "../Session";
import Header from "../Layout/Header";
import StudentsInfo from "./StudentsInfo";
import wordSyllableService from "./services/WordSyllables";

interface State {
    viewStudentsClicked: boolean;
    isTeacher: boolean;
}
interface Props extends RouteComponentProps {
    firebase: any;
}

class WordSyllableCategories extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            viewStudentsClicked: false,
            isTeacher: false
        };
      }

    async componentDidMount() {
        const roles = ["Teacher", "Admin"];
        roles.forEach(async (role: any) => {
            const query = "?user-role=" + role;
            const response = await fetch(`/api/get-user-with-verified-role/${this.props.firebase.auth.currentUser.email}` + query, {
                method: "GET",
                headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                }
              });
            const body = await response.json();
            if (body.result != null && body.result.length > 0) {
                this.setState({
                  isTeacher: true
                });
              }
          });
      }

    handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const name = event.currentTarget.name;
        const value = event.currentTarget.value;
        this.setState({[name]: parseFloat(value)} as any);
    }

    getNumSyllables = (): number => {
        const values = queryString.parse(this.props.location.search);
        const numSyllables = values.numSyllables as string;

        if (!numSyllables) {
            if (this.props.location.pathname === "/learn/words/syllables") {
                return 2;
            } else {
                return parseFloat(this.props.location.pathname.slice(-1));
            }
        }

        return parseFloat(numSyllables);
    }

    imageSrcList = () => {
        const numSyllables: number = this.getNumSyllables();

        wordSyllableService.getWordsBySyllableCount(numSyllables)
            .then(res => console.log(res.data));

        const bruh = "./images/Pitch Art - 21-01.jpg";

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

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>, nextContext: any): boolean {

        const numSyllables = this.getNumSyllables();
        const valuesNext = queryString.parse(nextProps.location.search);
        const numSyllablesNext = parseFloat(valuesNext.numSyllables as string);

        if (this.props.location.pathname === "/learn/words/syllables") { // WordSyllableCategories component
            if (nextProps.location.search.slice(0, -1) === "?accentIndex=") { // when user clicks picth art image
                return false;  // when pitch art is selected, stop re-render WordSyllableCategories component
            } else if (numSyllables !== numSyllablesNext) { 
                // when user clicks different "Number of syllables" radio button
                return true;   // re-render pitch art images
            }
        }
       
        if (this.props.location.search.slice(0, -1) === "?accentIndex=") {    
            if (nextProps.location.search.slice(0, -1) === "?accentIndex=") { 
                return false;                                                 
            }                                                                 
        }
        this.resetSize();                   
        return true;
    }

    displayStudents = async () => {
        this.setState({
            viewStudentsClicked: true
        });
     }

    studentsInfoBackButtonClicked = () => {
        this.setState({
            viewStudentsClicked: false
        });
      }
    
    resetSize = () => {
        for (let i = 0; i < this.imageSrcList().length; i++) {
            document.getElementById("pitchArt" + this.getNumSyllables() + i)!.className = "pitch-art-img-list-item-smaller";
        }
    }

    enlargeSize = (numSyllables: number, index: number, length: number) => {
        this.resetSize();
        document.getElementById("pitchArt" + numSyllables + index)!.className = "pitch-art-img-list-item";
    }

    render() {
        const numSyllables = this.getNumSyllables();
        return (
            <div>
                <Header/>
                {this.state.isTeacher && <button onClick={this.displayStudents} className="ViewStudentsRecordings waves-effect waves-light btn globalbtn">
                        View Students
                </button>}
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
                                    <Link key={index}
                                    to={"/learn/words/syllables/" + numSyllables + "?accentIndex=" + index}>
                                        <img src={item}
                                             key={"pitch-art-img-list-item-" + index}
                                             className="pitch-art-img-list-item-smaller"
                                             id = {"pitchArt" + numSyllables + index}
                                             onClick={() => this.enlargeSize
                                             (numSyllables, index, this.imageSrcList().length)}
                                        />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            <StudentsInfo showStudentsInfo={this.state.viewStudentsClicked}
            studentsInfoBackButtonClicked={this.studentsInfoBackButtonClicked}/>
            </div>
        );
    }
}
const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(WordSyllableCategories as any);
