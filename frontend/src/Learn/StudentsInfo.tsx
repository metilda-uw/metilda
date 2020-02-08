import React from "react";
import {withAuthorization} from "../Session";
import {spinner} from "../Utils/LoadingSpinner";
import StudentRecordings from "./StudentRecordings";
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
}

interface StudentEntity {
  name: string;
  email: string;
  lastLogin: any;
}

export class StudentsInfo extends React.Component <StudentsInfoProps, State> {
  constructor(props: StudentsInfoProps) {
    super(props);

    this.state = {
      isLoading: false,
      students: [],
      selectedStudentName: "",
      selectedStudentEmail: "",
      isViewRecordingsClicked: false
    };
  }

  async componentDidMount() {
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
    const headerNames = ["Student Name", "Student email", "Last login" , "Student recordings"];
    const headers = [];
    for (let i = 0; i < headerNames.length; i++) {
          headers.push(<th key={i}>{headerNames[i].toUpperCase()}</th>);
      }
    return headers;
  }

  renderTableData() {
    return this.state.students.map((student, index) => {
        return (
        <tr key={index}>
           <td>{student.name}</td>
           <td>{student.email}</td>
           <td>{student.lastLogin}</td>
           <td>
                <button className="DeleteFile waves-effect waves-light btn globalbtn" title="Get images for the file"
                 onClick={() => (this.getStudentRecordings(student.name, student.email))}>
                    <i className="material-icons right">image</i>
                    View Recordings
                </button>
            </td>
        </tr>
     );
  });
}

  render() {
    const {isLoading} = this.state;
    const {showStudentsInfo} = this.props;
    const className = `${showStudentsInfo
      ? "transition"
      : ""} StudentsInfo`;
    return (
      <div className={className}>
          {isLoading && spinner()}
          <button className="BackButton waves-effect waves-light btn globalbtn"
          onClick={this.props.studentsInfoBackButtonClicked}>
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
