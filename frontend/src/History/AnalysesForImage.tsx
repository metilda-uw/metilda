import React, {createRef} from "react";
import {withAuthorization} from "../Session";
import "./AnalysesForImage.scss";
import {spinner} from "../Utils/LoadingSpinner";

export interface AnalysesForImageProps {
  firebase: any;
  showAnalyses: boolean;
  analysesBackButtonClicked: any;
  analysesForSelectedImage: any[];
  imageName: string;
  imageId: number;
}

interface AnalysisEntity {
  name: string;
  createdAt: any;
  data: any;
}

interface State {
  isLoading: boolean;
  analyses: AnalysisEntity[];
}

export class AnalysesForImage extends React.Component < AnalysesForImageProps, State > {
  constructor(props: AnalysesForImageProps) {
    super(props);

    this.state = {
      isLoading: false,
      analyses: []
    };
  }
  async componentWillReceiveProps(nextProps: AnalysesForImageProps) {
    const {imageId} = this.props;
    if (nextProps.imageId !== imageId) {
      this.setState({
        analyses: [],
        isLoading: true,
      });

      const response = await fetch(`/api/get-analyses-for-image/${nextProps.imageId.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      const body = await response.json();
      const storageRef = this.props.firebase.uploadFile();
      body.result.forEach(async (analysis: any) => {
        const analysisName = analysis[1];
        const analysisPath = analysis[2];
        const analysisCreatedAt = analysis[4];
        const url = await storageRef.child(analysisPath).getDownloadURL();
        const dataResponse = await fetch(url);
        const analysisData = await dataResponse.json();
        const newAnalysis = {name: analysisName, createdAt: analysisCreatedAt, data: analysisData};
        this.setState({
          analyses: [...this.state.analyses, newAnalysis]
        });
      });

      this.setState({
        isLoading: false,
      });
    }
  }

  renderAnalysisData() {
    return this.state.analyses.map((analysis, index) => {
      return (
        <tr key={index} className="analysisData">
           <td>{analysis.data.uploadId}</td>
           <td>{analysis.name}</td>
           <td>{analysis.data.letters.map((item: any, i: any) => {
             return<div className="analysisLetters">
               <ul>
                 <b> Letter {i + 1}</b>
                 <li>t0: {item.t0}</li>
                 <li>t1: {item.t1}</li>
                 <li>pitch: {item.pitch}</li>
                 <li>syllable: {item.syllable}</li>
                 <li>isManualPitch: {item.isManualPitch.toString()}</li>
                 <li>isWordSep: {item.isWordSep.toString()}</li>
               </ul>
             </div>;
           })}</td>
           <td>{analysis.createdAt}</td>
        </tr>
     );
  });
  }

  renderAnalysisHeader() {
    const headerNames = ["File Name", "Analysis Name", "Analysis Letters", "Created At"];
    const headers = [];
    for (let i = 0; i < headerNames.length; i++) {
          headers.push(<th key={i}>{headerNames[i].toUpperCase()}</th>);
      }
    return headers;
  }

  render() {
    const {isLoading} = this.state;
    const {showAnalyses} = this.props;
    const className = `${showAnalyses
      ? "transition"
      : ""} AnalysisForImage`;
    return(
    <div className={className}>
    {isLoading && spinner()}
    <button className="BackButton waves-effect waves-light btn globalbtn"
    onClick={this.props.analysesBackButtonClicked}>
                    <i className="material-icons right">arrow_back</i>
      Back
    </button>
    <h1 id="analysisTitle">Analysis for Image: {this.props.imageName}</h1>
    <div>
    <table id="analysisTable">
      <tbody>
        <tr>{this.renderAnalysisHeader()}</tr>
          {this.renderAnalysisData()}
      </tbody>
    </table>
    </div>
    </div>);
  }
}

const authCondition = (authUser: any) => !!authUser;

export default withAuthorization(authCondition)(AnalysesForImage as any) as any;
