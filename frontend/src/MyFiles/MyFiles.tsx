import React, { createRef } from "react";
import { NotificationManager } from "react-notifications";
import { AddFolder, MoveToFolder } from "../Create/ImportUtils";
import Header from "../Layout/Header";
import { withAuthorization } from "../Session";
import { spinner } from "../Utils/LoadingSpinner";
import EafsForMyFiles from "./EafsForMyFiles";
import ImagesForMyFiles from "./ImagesForMyFiles";
import "./MyFiles.scss";

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
  isGetEafsClicked: boolean;
  isGetSubFolderClicked: boolean;
  fileIdSelectedForAnalyses: number;
  analysesForSelectedFile: any[];
  selectedFileName: string;
  selectedFolderName: string;
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
    type: string;
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
          isGetEafsClicked: false,
          isGetSubFolderClicked: false,
          fileIdSelectedForAnalyses: 0,
          analysesForSelectedFile: [],
          selectedFileName: "",
          selectedFolderName: "Uploads",
          imagesForSelectedFile: [],
          selectedFileId: null,
      };
  }

  componentDidMount() {
      this.getUserFiles();
  }

  getUserFiles = async () => {
      try {
      this.setState({
          isLoading: true
      });
      // Get files of a user
      const currentUserId = this.props.firebase.auth.currentUser.email;
      const folderName = this.state.selectedFolderName;
      const response = await fetch(`api/get-files-and-folders/${currentUserId}/${folderName}?file-type1=Folder&file-type2=Upload`, {
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
                    checked: false,
                    type: item[4],
                }
            );
          });
      this.setState({
              files: updatedFiles,
              isLoading: false
          });
        } catch (ex) {
            console.log(ex);
          }
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

handleGetEafs = (fileId: number, fileName: string) => {
    this.setState({
        isGetEafsClicked: true,
        selectedFileName: fileName,
        selectedFileId: fileId
    });
}

renderTableHeader() {
    const headerNames = ["File Name", "File Size", "Created At", "Images for file", "ELAN Annotation files"];
    const headers = [];
    headers.push(<th key="checkBoxHeader">
    {<label><input className="checkBoxForAllFiles" type="checkbox"
    onChange={this.handleCheckAll} checked={this.state.checkAll}/><span/>
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
            {file.type === "Upload" &&
           <td><label><input className="checkBoxForFile"type="checkbox"
           checked={file.checked} onChange={this.handleCheckboxChange}
           value={index}/><span/></label></td>
            }
            {file.type === "Folder" &&
           <td><i className="material-icons left">folder</i></td>
            }
           <td>{file.name}</td>
           <td>
                {file.type === "Upload" &&
                   <p id="sizeParagraph"> {(file.size / 1024).toFixed(2)} KB</p>
                }
                {file.type === "Folder" &&
                <p id="sizeParagraph">-</p>
                }
            </td>
           <td>{file.createdAt}</td>
           <td>
                {file.type === "Upload" &&
                <button className="GetImages waves-effect waves-light btn globalbtn" title="Get images for the file"
                 onClick={() => (this.handleGetImages(file.id, file.name))}>
                    <i className="material-icons right">image</i>
                    Get Images
                </button>
                }
                {file.type === "Folder" &&
                <button className="OpenFolder waves-effect waves-light btn globalbtn"
                onClick={() => (this.openFolder(file))}>
                   <i className="material-icons right">folder_open</i>
                   Open Folder
                </button>
                }
            </td>
            <td>
                {file.type === "Upload" &&
                <button className="GetImages waves-effect waves-light btn globalbtn" title="Get EAFs for the file"
                 onClick={() => (this.handleGetEafs(file.id, file.name))}>
                     <i className="material-icons right">insert_drive_file</i>
                    Get EAFs
                </button>
                }
                {file.type === "Folder" &&
                <button className="MoveToFolder waves-effect waves-light btn globalbtn" title="Move selected audio files to folder"
                onClick={() => (this.handleMoveFiles(file))}>
                   <i className="material-icons right">add_box</i>
                   Move to Folder
                </button>
                }
            </td>
        </tr>
     );
  });
}

openFolder = async (file: FileEntity) => {
    const newFolderName = file.name;
    await this.setState({
        selectedFolderName: newFolderName,
        isGetSubFolderClicked: true,
        selectedFileId: file.id,
    });
    await this.getUserFiles();
}

handleMoveFiles = async (folder: FileEntity) => {
    const uncheckedFiles = [];
    const newFolderName = folder.name;
    try {
    for (const file of this.state.files) {
        if (file.checked) {
            // Download file from cloud
            const filePath = file.path;
            const storageRef = this.props.firebase.uploadFile();
            const url = await storageRef.child(filePath).getDownloadURL();
            const response = await fetch(url);
            const fileData = await response.blob();
            // update file path
            const newFilePath = filePath.replace("/Uploads/", "/Uploads/" + newFolderName + "/");
            MoveToFolder(file.id, newFilePath, fileData, this.props.firebase);
            await this.deleteFile(file);
        } else {
            uncheckedFiles.push(file);
        }
    }
    await this.setState({
        files: uncheckedFiles
    });
    } catch (ex) {
        console.log(ex);
    }
}

deleteFile = async (file: FileEntity) => {
    try {
        // Delete file from cloud
        const filePath = file.path;
        const storageRef = this.props.firebase.uploadFile();
        const fileRef = storageRef.child(filePath);
        await fileRef.delete();
    } catch (ex) {
        console.log(ex);
    }
}

deleteFiles = async () => {
    const uncheckedFiles = [];
    try {
    for (const file of this.state.files) {
        if (file.checked && file.type !== "Folder") {
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
    NotificationManager.success("Deleted files successfully");
    this.setState({
        files: uncheckedFiles
    });
} catch (ex) {
    console.log(ex);
  }
}

downloadFiles = async () => {
    try {
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
    } catch (ex) {
        console.log(ex);
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

eafsBackButtonClicked = () => {
    this.setState({
        isGetEafsClicked: false
    });
}

subFolderBackButtonClicked = async () => {
    await this.setState({
        isGetSubFolderClicked: false,
        selectedFolderName: "Uploads",
        selectedFileId: null,
    });
    await this.getUserFiles();
}

addSubfolder = async () => {
    const folderName = prompt("Enter name of the subfolder: ", "untitled folder");
    await AddFolder(folderName, this.props.firebase);
    await this.getUserFiles();
}

deleteFolder = async () => {
    const isOk: boolean = confirm("The content of the folder will be deleted. Are you sure you want to delete folder?");

    if ( isOk ) {
        try {
            // Delete folder from cloud and DB
            if (this.state.selectedFileId !== null ) {
                const formData = new FormData();
                formData.append("file_id", this.state.selectedFileId.toString());
                await fetch(`/api/delete-folder`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                });
            }
            const storageRef = this.props.firebase.uploadFile();
            const uid = this.props.firebase.auth.currentUser.email;
            for (const file of this.state.files) {
                const fileRef = storageRef.child(file.path);
                await fileRef.delete();
                const formData = new FormData();
                formData.append("file_id", file.id);
                await fetch(`/api/delete-folder`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                });
            }
            const path = uid + "/Uploads/" + this.state.selectedFolderName + "/.ignore";
            const fRef = storageRef.child(path);
            const response = await fRef.delete();
            this.subFolderBackButtonClicked();
        } catch (ex) {
            console.log(ex);
        }
    }
}

render() {
    const { isLoading } = this.state;
    return (
            <div className="myFilesContainer">
            <div className="one">
                <Header/>
                {isLoading && spinner()}
                {!this.state.isGetSubFolderClicked &&
                    <button className="AddSubfolder waves-effect waves-light btn globalbtn" onClick={this.addSubfolder}>
                        <i className="material-icons right">create_new_folder</i>
                        Add Subfolder
                    </button>
                }
                {this.state.isGetSubFolderClicked &&
                    <div>
                    <button className="FolderBackButton waves-effect waves-light btn globalbtn" onClick=
                    {this.subFolderBackButtonClicked}>
                        <i className="material-icons right">arrow_back</i>
                        Back
                    </button>
                    <button className="DeleteFolder waves-effect waves-light btn globalbtn" onClick=
                    {() => this.deleteFolder()}>
                        <i className="material-icons right">delete</i>
                        Delete {this.state.selectedFolderName}
                    </button>
                    </div>
                }
                {this.state.files.length > 0 &&
                <div>
                {this.state.isGetSubFolderClicked &&
                    <h1 id="myFilesTitle">My Files: {this.state.selectedFolderName}</h1>
                }
                {!this.state.isGetSubFolderClicked &&
                    <h1 id="myFilesTitle">My Files</h1>
                }
                <p>
                    <i>
                        <b>Note:</b>
                        1) Select checkboxes for files and click on 'Download Files' or 'Delete Files' button at the
                         bottom of the page to download or delete files. <br/>
                        2) Select checkboxes for files and click on the corrosponding 'Move to Folder' button to move
                         those selected files to that subfolder.
                    </i>
                </p><br/>
                <table id="myFiles">
                    <tbody>
                        <tr>{this.renderTableHeader()}</tr>
                        {this.renderTableData()}
                    </tbody>
                </table>
                <div className="myFilesButtonContainer">
                    <button className="DownloadFile waves-effect waves-light btn globalbtn" onClick=
                    {this.downloadFiles}>
                        <i className="material-icons right">file_download</i>
                        Download Files
                    </button>
                    <button className="DeleteFile waves-effect waves-light btn globalbtn" onClick
                    ={this.deleteFiles}>
                        <i className="material-icons right">delete</i>
                        Delete Files
                    </button>
                </div>
                <a className="hide" ref={this.downloadRef} target="_blank">
                    Hidden Download Link
                </a>
                </div>}
                {this.state.files.length === 0 &&
                <div>
                    <p id="noAudioFilesMessage">No audio files found!</p>
                </div>
                }
            </div>
            <ImagesForMyFiles showImages={this.state.isGetImagesClicked}
            imagesBackButtonClicked={this.imagesBackButtonClicked}
            fileId={this.state.selectedFileId}
            fileName={this.state.selectedFileName}/>
            <EafsForMyFiles showEafs={this.state.isGetEafsClicked}
            eafsBackButtonClicked={this.eafsBackButtonClicked}
            fileId={this.state.selectedFileId}
            fileName={this.state.selectedFileName}/>
        </div>
        );
    }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(MyFiles as any);
