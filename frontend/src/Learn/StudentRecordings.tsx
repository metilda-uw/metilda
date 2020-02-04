import React from "react";
import {withAuthorization} from "../Session";
import {spinner} from "../Utils/LoadingSpinner";
import "./StudentRecordings.scss";
import {controls, Media, Player} from "react-media-player";

const {PlayPause, SeekBar} = controls;

export interface StudentRecordingsProps {
  showStudentRecordings: boolean;
  studentRecordingsBackButtonClicked: any;
  studentName: string;
  studentUid: string;
  firebase: any;
}

interface State {
  isLoading: boolean;
  studentRecordings: RecordingEntity[];
  students: StudentEntity[];
  selectedStudentName: string;
}

interface StudentEntity {
  name: string;
  email: string;
  lastLogin: any;
}

interface RecordingEntity {
  recordingWordName: string;
  recordings: any[];
}

export class StudentRecordings extends React.Component <StudentRecordingsProps, State> {
  constructor(props: StudentRecordingsProps) {
    super(props);

    this.state = {
      isLoading: false,
      studentRecordings: [],
      students: [],
      selectedStudentName: ""
    };
  }

  async componentWillReceiveProps(nextProps: StudentRecordingsProps) {
    const {studentName} = this.props;
    if (nextProps.studentName !== studentName) {
      this.setState({
        studentRecordings: [],
        isLoading: true,
      });
      const storageRef = this.props.firebase.uploadFile();
      const fileRef = storageRef.child(nextProps.studentUid + "/Recordings/");
      const response = await fileRef.listAll();
      response.prefixes.forEach(async (folderRef: any) => {
        const recordingPath = folderRef.location.path.split("/");
        const recordingWordName = recordingPath[recordingPath.length - 1];
        const itemRefResponse = await folderRef.listAll();
        const recordings = await Promise.all(itemRefResponse.items.map(async (itemRef: any) => {
            const recordingUrl = await itemRef.getDownloadURL();
            return recordingUrl;
          }));
        const newRecording = {recordingWordName, recordings};
        this.setState({
               studentRecordings: [...this.state.studentRecordings, newRecording]
             });
          });
      this.setState({
        isLoading: false,
      });
    }
  }

 renderTableHeader() {
    const headerNames = ["Recording Word Name", "Recordings"];
    const headers = [];
    for (let i = 0; i < headerNames.length; i++) {
          headers.push(<th key={i}>{headerNames[i].toUpperCase()}</th>);
      }
    return headers;
  }

  renderTableData() {
    return this.state.studentRecordings.map((recording, index) => {
        return (
        <tr key={index}>
           <td>{recording.recordingWordName}</td>
           <td>
             {recording.recordings.map((recordingItem, indexItem) => {
               return (
               <Media key={indexItem}>
               <div className="media">
                   <div className="media-player">
                       <Player src={recordingItem} vendor="audio"/>
                   </div>
                   <div className="media-controls metilda-control-container">
                       <div className="metilda-student-recordings-image-col-1">
                           <PlayPause/>
                       </div>
                       <div className="metilda-student-recordings-image-col-2">
                           <SeekBar className="no-border"/>
                       </div>
                   </div>
               </div>
               </Media>);
             })
             }
           </td>
        </tr>
     );
  });
}

  render() {
    console.log(this.state.studentRecordings);
    const {isLoading} = this.state;
    const {showStudentRecordings} = this.props;
    const className = `${showStudentRecordings
      ? "transition"
      : ""} StudentRecordings`;
    return (
      <div className={className}>
          {isLoading && spinner()}
          <button className="BackButton waves-effect waves-light btn"
          onClick={this.props.studentRecordingsBackButtonClicked}>
            <i className="material-icons right">arrow_back</i>
              Back
          </button>
          <h1 id="myFilesTitle">Recordings of {this.props.studentName} </h1>
            <table id="studentRecordings">
              <tbody>
                <tr>{this.renderTableHeader()}</tr>
                  {this.renderTableData()}
              </tbody>
            </table>
      </div>
    );
  }
}

const authCondition = (authUser: any) => !!authUser;

export default withAuthorization(authCondition)(StudentRecordings as any)as any;
