import React, {createRef} from "react";
import {withAuthorization} from "../Session";
import "./AnalysesForImage.scss";
import {spinner} from "../Utils/LoadingSpinner";
import { IconButton } from "@material-ui/core";
import InfoIcon from '@material-ui/icons/Info';
import Modal from "react-modal";

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
  windowWidth: number;
  infoOpenID: string | null;
}

export class AnalysesForImage extends React.Component < AnalysesForImageProps, State > {
  customStyles = {
    overlay: {
      position: "fixed",
      zIndex: 1000
    },
    content: {
      margin: 0,
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };
  constructor(props: AnalysesForImageProps) {
    super(props);

    this.state = {
      isLoading: false,
      analyses: [],
      windowWidth: window.innerWidth,
      infoOpenID: null,
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

  componentDidMount(): void {
    window.addEventListener("resize", this.setWindowWidth)
  }

  setWindowWidth = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  handleInfoClick = (id : any) => {
    this.setState({infoOpenID : id}) 
  }

  handleInfoClose = () => {
    this.setState({infoOpenID : null}) 
  }

  renderAnalysisData() {
    const { windowWidth } = this.state
    return this.state.analyses.map((analysis, index) => {
      return (
        <tr key={index} className="analysisData">
          <td>{analysis.data.uploadId}</td>
          <td>{analysis.name}</td>
          {(windowWidth >= 600) ? (
            <>
              <td>{analysis.data.letters.map((item: any, i: any) => {
                return (<div className="analysisLetters">
                  <ul>
                    <b> Letter {i + 1}</b>
                    <li>t0: {item.t0}</li>
                    <li>t1: {item.t1}</li>
                    <li>pitch: {item.pitch}</li>
                    <li>syllable: {item.syllable}</li>
                    <li>isManualPitch: {item.isManualPitch.toString()}</li>
                    <li>isWordSep: {item.isWordSep.toString()}</li>
                  </ul>
                </div>);
              })}</td>
              <td>{analysis.createdAt}</td>
            </>
          ) : (<td>
            <IconButton onClick={() => this.handleInfoClick(analysis.data.uploadId)}><InfoIcon /></IconButton>
            <Modal
              isOpen={(this.state.infoOpenID === analysis.data.uploadId)}
              onRequestClose={this.handleInfoClose}
              style={this.customStyles}
              appElement={document.getElementById("root") || undefined}
            >
              <div>Analysis Letters:</div>
              <div>{analysis.data.letters.map((item: any, i: any) => {
                return (<div className="analysisLetters">
                  <ul>
                    <b> Letter {i + 1}</b>
                    <li>t0: {item.t0}</li>
                    <li>t1: {item.t1}</li>
                    <li>pitch: {item.pitch}</li>
                    <li>syllable: {item.syllable}</li>
                    <li>isManualPitch: {item.isManualPitch.toString()}</li>
                    <li>isWordSep: {item.isWordSep.toString()}</li>
                  </ul>
                </div>);
              })}</div>
              <div>Created At:</div>
              <div>{analysis.createdAt}</div>
            </Modal>
          </td>)}
        </tr>
      );
    });
  }

  renderAnalysisHeader() {
    const {windowWidth} = this.state
    const headerNames = (windowWidth >= 600) ? [
      "File Name",
      "Analysis Name",
      "Analysis Letters",
      "Created At"
    ] : [
      "File Name",
      "Analysis Name",
      "Info" 
    ];
    const headers = [];
    for (let i = 0; i < headerNames.length; i++) {
          headers.push(<th key={i}>{headerNames[i].toUpperCase()}</th>);
      }
    return headers;
  }

  render() {
    const {isLoading, windowWidth} = this.state;
    const {showAnalyses} = this.props;
    const className = `${showAnalyses
      ? "transition"
      : ""} AnalysisForImage`;
    return(
      <div className={className}>
        {isLoading && spinner()}
        <button className="BackButton waves-effect waves-light btn globalbtn"
          onClick={this.props.analysesBackButtonClicked}
          style={{
            position: (windowWidth < 600) ? 'relative' : 'absolute',
            top: (windowWidth < 600) ? '25px' : '40px',
            left: (windowWidth < 600) ? '0px' : '40px'
          }}>
          <i className="material-icons right">arrow_back</i>
          Back
        </button>
        {(windowWidth < 600) ? (
          <h2 id="analysisTitle">Analysis for Image: {this.props.imageName}</h2>
        ) : (
          <h1 id="analysisTitle">Analysis for Image: {this.props.imageName}</h1>
        )}
        <div>
          <table id="analysisTable">
            <tbody>
              <tr>{this.renderAnalysisHeader()}</tr>
              {this.renderAnalysisData()}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

const authCondition = (authUser: any) => !!authUser;

export default withAuthorization(authCondition)(AnalysesForImage as any) as any;
