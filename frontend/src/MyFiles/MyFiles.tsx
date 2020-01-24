import React, {createRef} from "react";
import { withAuthorization } from "../Session";
import "./MyFiles.scss";
import Header from "../Layout/Header";
import ImagesForMyFiles from "./ImagesForMyFiles";
import AnalysesForMyFiles from "./AnalysesForMyFiles";

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
}

interface FileEntity {
    id: number;
    name: string;
    size: string;
    createdAt: any;
    path: string;
    checked: boolean;
}

interface AnalysisEntity {
    name: string;
    createdAt: any;
    data: any;
  }

interface ImageEntity {
    name: string;
    createdAt: any;
    imageUrl: any;
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
          imagesForSelectedFile: []
      };
  }
  componentDidMount() {
      this.getUserFiles();
  }

  getUserFiles = () => {
      // Get files of a user
      const currentUserId = this.props.firebase.auth.currentUser.email;

      fetch(`api/get-files/${currentUserId}`
      + "?file-type=Upload", {
      method: "GET",
      headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
      },
  })
      .then((response) => response.json())
      .then((data) => {
        const updatedFiles: FileEntity[] = [];
        data.result.map((item: any) => {
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
              files: updatedFiles
          });
      });
 }
renderTableHeader() {
  const headerNames = ["File Name", "File Size", "Created At", "Images for file", "Analyses for file"];
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

handleGetImages = async (fileId: number, fileName: string) => {
    const response = await fetch(`/api/get-analyses-for-file/${fileId.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
    const body = await response.json();
    const updatedImages: ImageEntity[] = [];
    for (const analysis of body.result) {
        const analysisId = analysis[0];
        const imageResponse = await fetch(`/api/get-image-for-analysis/${analysisId.toString()}`, {
            method: "GET",
            headers: {
              Accept: "application/json"
            }
          });

        const imageBody = await imageResponse.json();
        const storageRef = this.props.firebase.uploadFile();
        for (const image of imageBody.result) {
            const imageUrl = await storageRef.child(image[2]).getDownloadURL();
            const dataResponse = await fetch(imageUrl);
            updatedImages.push(
                {
                    name: image[1],
                    createdAt: image[4],
                    imageUrl
                }
            );
          }
        }
    this.setState({
        isGetImagesClicked: true,
        imagesForSelectedFile: updatedImages,
        selectedFileName: fileName
    });
}

handleGetAnalyses = async (fileId: number, fileName: string) => {
    const response = await fetch(`/api/get-analyses-for-file/${fileId.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
    const body = await response.json();
    const updatedAnalyses: AnalysisEntity[] = [];
    for (const analysis of body.result) {
    const analysisName = analysis[1];
    const analysisPath = analysis[2];
    const analysisCreatedAt = analysis[4];
    const storageRef = this.props.firebase.uploadFile();
    const url = await storageRef.child(analysisPath).getDownloadURL();
    const dataResponse = await fetch(url);
    const analysisData = await dataResponse.json();
    updatedAnalyses.push(
        {
            name: analysisName,
            createdAt: analysisCreatedAt,
            data: analysisData
        });
    }
    this.setState({
        isGetAnalysesClicked: true,
        analysesForSelectedFile: updatedAnalyses,
        selectedFileName: fileName
    });
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
                <button className="DeleteFile waves-effect waves-light btn"
                 onClick={() => (this.handleGetImages(file.id, file.name))}>
                    <i className="material-icons right">image</i>
                    Get Images
                </button>
            </td>
            <td>
                <button className="DeleteFile waves-effect waves-light btn"
                onClick={() => (this.handleGetAnalyses(file.id, file.name))}>
                    <i className="material-icons right">note</i>
                    Get Analysis
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
            const response = await fetch(`/api/delete-file/`, {
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
            <h1 id="myFilesTitle">My Files </h1>
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
          imagesForSelectedFile={this.state.imagesForSelectedFile}
          selectedFileName={this.state.selectedFileName}/>
          <AnalysesForMyFiles showAnalyses={this.state.isGetAnalysesClicked}
          analysesBackButtonClicked={this.analysesBackButtonClicked}
          analysesForSelectedFile={this.state.analysesForSelectedFile}
          selectedFileName={this.state.selectedFileName}/>
          </div>
      );
  }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(MyFiles as any);
