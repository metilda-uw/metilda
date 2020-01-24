import React, {createRef} from "react";
import {withAuthorization} from "../Session";
import "./AnalysisForMyFiles.scss";

export interface AnalysesForMyFilesProps {
  firebase: any;
  showAnalyses: boolean;
  analysesBackButtonClicked: any;
  analysesForSelectedFile: any[];
  selectedFileName: string;
}

interface State {
  isLoading: boolean;
}

export class AnalysesForMyFiles extends React.Component < AnalysesForMyFilesProps, State > {
  constructor(props: AnalysesForMyFilesProps) {
    super(props);

    this.state = {
      isLoading: false
    };
  }

  renderAnalysisData() {
    return this.props.analysesForSelectedFile.map((analysis, index) => {
      return (
        <tr key={index} className="analysisData">
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
    const headerNames = ["Analysis Name", "Analysis Letters", "Created At"];
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
      : ""} AnalysisForMyFiles`;
    return(<div className={className}>
    <button className="BackButton waves-effect waves-light btn" onClick={this.props.analysesBackButtonClicked}>
                    <i className="material-icons right">arrow_back</i>
                  Back
    </button>
    <h1 id="analysisTitle">Analysis for File: {this.props.selectedFileName}</h1>
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

export default withAuthorization(authCondition)(AnalysesForMyFiles as any) as any;
