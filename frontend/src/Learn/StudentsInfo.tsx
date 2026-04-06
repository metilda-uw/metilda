import React from "react";
import {withAuthorization} from "../Session";
import {spinner} from "../Utils/LoadingSpinner";
import StudentRecordings from "./StudentRecordings";
import Modal from "react-modal";
import "./StudentsInfo.scss";

export interface StudentsInfoProps {
  showStudentsInfo: boolean;
  studentsInfoBackButtonClicked: any;
  firebase: any;
}

interface State {
  isLoading: boolean;
  students: StudentEntity[];
  selectedStudentName: string;
  selectedStudentEmail: string;
  isViewRecordingsClicked: boolean;
  windowWidth: number;
  infoOpenID: string | null
}

interface StudentEntity {
  name: string;
  email: string;
  lastLogin: any;
}

export class StudentsInfo extends React.Component <StudentsInfoProps, State> {
  customStyles = {
    overlay: {
      position: "fixed",
      zIndex: 100
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
  constructor(props: StudentsInfoProps) {
    super(props);

    this.state = {
      isLoading: false,
      students: [],
      selectedStudentName: "",
      selectedStudentEmail: "",
      isViewRecordingsClicked: false,
      windowWidth: window.innerWidth,
      infoOpenID: null
    };
  }

  async componentDidMount() {
      window.addEventListener("resize", this.setWindowWidth)
      const response = await fetch(`/api/get-all-students`, {
            method: "GET",
            headers: {
              Accept: "application/json"
            }
          });
      const body = await response.json();
      const updatedStudents: StudentEntity[] = [];
      body.result.map((item: any) => {
            updatedStudents.push(
                  {
                      name: item[0],
                      email: item[1],
                      lastLogin: item[2]
                  }
              );
            });
      this.setState({
            students: updatedStudents
        });
  }

  setWindowWidth = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  getStudentRecordings(selectedStudentName: string, selectedStudentEmail: string) {
    this.setState({
      isViewRecordingsClicked: true,
      selectedStudentName,
      selectedStudentEmail
    });
  }

  studentsRecordingsBackButtonClicked = () => {
    this.setState({
      isViewRecordingsClicked: false
    });
  }

 renderTableHeader() {
    const {windowWidth} = this.state
    const headerNames = (windowWidth >= 600) ? [
      "Student Name", 
      "Student email", 
      "Last login", 
      "Student recordings"
    ] : [
      "Student Name",
      "Recordings/Info"
    ];
    const headers = [];
    for (let i = 0; i < headerNames.length; i++) {
          headers.push(<th key={i}>{headerNames[i].toUpperCase()}</th>);
      }
    return headers;
  }

  handleInfoClick = (student) => {
    this.setState({infoOpenID: student.name})
  }

  handleInfoClose = () => {
    this.setState({infoOpenID: null})
  }

  renderTableData() {
    const {windowWidth} = this.state
    return this.state.students.map((student, index) => {
        return (
        <tr key={index}>
           <td>{student.name}</td>
           {(windowWidth >= 600) ? <td>{student.email}</td> : <></>}
           {(windowWidth >= 600) ? <td>{student.lastLogin}</td> : <></>}
           <td>
                <button className="DeleteFile waves-effect waves-light btn globalbtn" title="Get images for the file"
                 onClick={() => (this.getStudentRecordings(student.name, student.email))}>
                    {(windowWidth >= 600) ? <i className="material-icons right">image</i> : <></>}
                    View Recordings
                </button>
                {(windowWidth < 600) ? (
                <>
                <button className="waves-effect waves-light btn globalbtn"
                  onClick={() => (this.handleInfoClick(student))}
                >
                    Info
                </button>
                <Modal
                  isOpen = {(this.state.infoOpenID === student.name)}
                  onRequestClose={this.handleInfoClose}
                  style={this.customStyles}
                  appElement={document.getElementById("root") || undefined}
                >
                  <div>Student Name: {student.name}</div>
                  <div>Email: {student.email}</div>
                  <div>Last Login: {student.lastLogin}</div>
                </Modal>
                </>
                ) : (<></>)}
            </td>
        </tr>
     );
  });
}

  render() {
    const {isLoading, windowWidth} = this.state;
    const {showStudentsInfo} = this.props;
    const className = `${showStudentsInfo
      ? "transition"
      : ""} StudentsInfo`;
    return (
      <div className={className}>
          {isLoading && spinner()}
          <button className="BackButton waves-effect waves-light btn globalbtn"
          onClick={this.props.studentsInfoBackButtonClicked}
          style={{ position: (windowWidth < 600) ? 'static' : 'absolute' }}
          >
            <i className="material-icons right">arrow_back</i>
              Back
          </button>
          <h1 id="myFilesTitle">Students enrolled </h1>
            <table id="myFiles">
              <tbody>
                <tr>{this.renderTableHeader()}</tr>
                  {this.renderTableData()}
              </tbody>
            </table>
        <StudentRecordings showStudentRecordings={this.state.isViewRecordingsClicked}
        studentRecordingsBackButtonClicked={this.studentsRecordingsBackButtonClicked}
        studentName={this.state.selectedStudentName}
        studentUid={this.state.selectedStudentEmail}/>
      </div>
    );
  }
}

const authCondition = (authUser: any) => !!authUser;

export default withAuthorization(authCondition)(StudentsInfo as any)as any;
