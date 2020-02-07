import React, {createRef} from "react";
import { withAuthorization } from "../Session";
import "./MyFiles.scss";
import Header from "../Layout/Header";
import ImagesForMyFiles from "./ImagesForMyFiles";
import {spinner} from "../Utils/LoadingSpinner";

export interface MyFilesProps {
  firebase: any;
}

interface State {
  files: any[];
  isLoading: boolean;
  checked: boolean;
  checkAll: boolean;
  isGetImagesClicked: boolean;
  isGetAnalysesClicked: boolean;
  fileIdSelectedForAnalyses: number;
  analysesForSelectedFile: any[];
  selectedFileName: string;
  imagesForSelectedFile: any[];
  selectedFileId: number | null;
}

interface FileEntity {
    id: number;
    name: string;
    size: string;
    createdAt: any;
    path: string;
    checked: boolean;
}

export class MyFiles extends React.Component<MyFilesProps, State> {

private downloadRef = createRef<HTMLAnchorElement>();
  constructor(props: MyFilesProps) {
      super(props);

      this.state = {
          files: [],
          isLoading: false,
          checked: false,
          checkAll: false,
          isGetImagesClicked: false,
          isGetAnalysesClicked: false,
          fileIdSelectedForAnalyses: 0,
          analysesForSelectedFile: [],
          selectedFileName: "",
          imagesForSelectedFile: [],
          selectedFileId: null,
      };
  }
  componentDidMount() {
      this.getUserFiles();
  }

  getUserFiles = async () => {
      this.setState({
          isLoading: true
      });
      // Get files of a user
      const currentUserId = this.props.firebase.auth.currentUser.email;
      const response = await fetch(`api/get-files/${currentUserId}`
      + "?file-type=Upload", {
      method: "GET",
      headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
      },
        });
      const body = await response.json();
      const updatedFiles: FileEntity[] = [];
      body.result.map((item: any) => {
            updatedFiles.push(
                {
                    id: item[0],
                    name: item[1],
                    size: item[3],
                    createdAt: item[5],
                    path: item[2],
                    checked: false
                }
            );
          });
      this.setState({
              files: updatedFiles,
              isLoading: false
          });
 }

handleCheckAll = () => {
    this.setState({
        checkAll: !this.state.checkAll } , () => {
            const updatedFiles = [...this.state.files];
            updatedFiles.map((file) =>
            file.checked = this.state.checkAll);
            this.setState({
                files: updatedFiles
            });
  });
}

handleCheckboxChange = (event: any) => {
    const index = Number(event.target.value);
    const checked = event.target.checked;
    const updatedFiles = [...this.state.files];
    updatedFiles[index].checked = checked;
    this.setState({
        files: updatedFiles }, () => {
            const uncheckedFiles = this.state.files.filter((file) => !file.checked);
            this.setState({
                  checkAll: uncheckedFiles.length === 0 ? true : false
             });
        });
}

handleGetImages = (fileId: number, fileName: string) => {
    this.setState({
        isGetImagesClicked: true,
        selectedFileName: fileName,
        selectedFileId: fileId
    });
}

renderTableHeader() {
    const headerNames = ["File Name", "File Size", "Created At", "Images for file"];
    const headers = [];
    headers.push(<th key="checkBoxHeader">
    {<label><input type="checkbox" onChange={this.handleCheckAll} checked={this.state.checkAll}/><span/>
    </label>}
    </th>);
    for (let i = 0; i < headerNames.length; i++) {
          headers.push(<th key={i}>{headerNames[i].toUpperCase()}</th>);
      }
    return headers;
  }

renderTableData() {
    return this.state.files.map((file, index) => {
        return (
        <tr key={index}>
           <td><label><input type="checkbox" checked={file.checked} onChange={this.handleCheckboxChange}
           value={index}/><span/></label></td>
           <td>{file.name}</td>
           <td>{(file.size / 1024).toFixed(2)} KB</td>
           <td>{file.createdAt}</td>
           <td>
                <button className="DeleteFile waves-effect waves-light btn" title="Get images for the file"
                 onClick={() => (this.handleGetImages(file.id, file.name))}>
                    <i className="material-icons right">image</i>
                    Get Images
                </button>
            </td>
        </tr>
     );
  });
}

deleteFiles = async () => {
    const uncheckedFiles = [];
    for (const file of this.state.files) {
        if (file.checked) {
            // Delete file from cloud
            const filePath = file.path;
            const storageRef = this.props.firebase.uploadFile();
            const fileRef = storageRef.child(filePath);
            const responseFromCloud = await fileRef.delete();
            // Delete file from DB
            const formData = new FormData();
            formData.append("file_id", file.id);
            const response = await fetch(`/api/delete-file`, {
            method: "POST",
            headers: {
                Accept: "application/json"
            },
            body: formData
        });
            const body = await response.json();
        } else {
            uncheckedFiles.push(file);
        }
    }
    this.setState({
        files: uncheckedFiles
    });
}

downloadFiles = async () => {
    for (const file of this.state.files) {
        if (file.checked) {
            // Download file from cloud
            const filePath = file.path;
            const storageRef = this.props.firebase.uploadFile();
            const url = await storageRef.child(filePath).getDownloadURL();
            const response = await fetch(url);
            const data = await response.blob();
            this.downloadRef.current!.href =  URL.createObjectURL(data);
            this.downloadRef.current!.download = file.name;
            this.downloadRef.current!.click();
        }
    }
}

imagesBackButtonClicked = () => {
    this.setState({
        isGetImagesClicked: false
    });
  }

analysesBackButtonClicked = () => {
    this.setState({
        isGetAnalysesClicked: false
    });
  }

render() {
    const { isLoading } = this.state;
    return (
            <div className="myFilesContainer">
            <div className="one">
            <div>
               <Header/>
               {isLoading && spinner()}
              <h1 id="myFilesTitle">My Files </h1>
              <p><i><b>Note:</b> Select checkboxes for files and click on 'Download Files' or
              'Delete Files' button at the bottom of the page to download or delete files. </i></p><br/>
              <table id="myFiles">
                 <tbody>
                 <tr>{this.renderTableHeader()}</tr>
                    {this.renderTableData()}
                 </tbody>
              </table>
            </div>
            <div className="myFilesButtonContainer">
            <button className="DownloadFile waves-effect waves-light btn" onClick={this.downloadFiles}>
                      <i className="material-icons right">file_download</i>
                      Download Files
            </button>
            <button className="DeleteFile waves-effect waves-light btn" onClick={this.deleteFiles}>
                      <i className="material-icons right">delete</i>
                      Delete Files
            </button>
            </div>
            <a className="hide" ref={this.downloadRef} target="_blank">
                      Hidden Download Link
            </a>
            </div>
            <ImagesForMyFiles showImages={this.state.isGetImagesClicked}
            imagesBackButtonClicked={this.imagesBackButtonClicked}
            fileId={this.state.selectedFileId}
            fileName={this.state.selectedFileName}/>
            </div>
        );
  }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(MyFiles as any);
