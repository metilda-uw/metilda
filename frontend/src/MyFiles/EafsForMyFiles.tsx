import React, {createRef} from "react";
import {withAuthorization} from "../Session";
import "./EafsForMyFiles.scss";
import {spinner} from "../Utils/LoadingSpinner";

export interface EafsForMyFilesProps {
  firebase: any;
  showEafs: boolean;
  eafsBackButtonClicked: any;
  fileName: string;
  fileId: number;
}

interface EafEntity {
  name: string;
  path: string;
  createdAt: any;
  key: number;
  checked: boolean;
}

interface State {
  isLoading: boolean;
  isEafClicked: boolean;
  checkedEaf: boolean;
  checkAllEaf: boolean;
  eafs: EafEntity[];
  selectedEafName: string;
  selectedEafId: number | null;
}

export class EafsForMyFiles extends React.Component < EafsForMyFilesProps,
State > {
  private downloadRef = createRef<HTMLAnchorElement>();
  constructor(props: EafsForMyFilesProps) {
    super(props);

    this.state = {
      isLoading: false,
      isEafClicked: false,
      checkedEaf: false,
      checkAllEaf: false,
      eafs: [],
      selectedEafName: "",
      selectedEafId: null
    };
  }

  async componentWillReceiveProps(nextProps: EafsForMyFilesProps) {
    const {fileId} = this.props;
    if (nextProps.fileId !== null && nextProps.fileId !== fileId) {
      this.setState({
        eafs: [],
        isLoading: true,
      });
      const response = await fetch(`/api/get-eafs-for-files/${nextProps.fileId.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      const eafInfo = await response.json();
      eafInfo.result.forEach(async (eaf: any) => {
          const newEaf = {key: eaf[0], name: eaf[1], path: eaf[2], createdAt: eaf[4], checked: false};
          this.setState({
            eafs: [...this.state.eafs, newEaf]
          });
      });
      this.setState({
        isLoading: false,
      });
    }
  }

  getAnalysesForImage = async (eafId: number, eafName: string) => {
    this.setState({
        isEafClicked: true,
        selectedEafName: eafName,
        selectedEafId: eafId
      });
  }

  eafBackButtonClicked = () => {
    this.setState({
        isEafClicked: false
    });
  }

  handleCheckAllEaf = () => {
    this.setState({
      checkAllEaf: !this.state.checkAllEaf } , () => {
        const updatedEafFiles = [...this.state.eafs];
        updatedEafFiles.map((eaf) =>
          eaf.checked = this.state.checkAllEaf);
        this.setState({
            eafs: updatedEafFiles
          });
        });
  }

  handleCheckboxChangeEaf = (event: any) => {
    const index = Number(event.target.value);
    const checked = event.target.checked;
    const updatedEafFiles = [...this.state.eafs];
    updatedEafFiles[index].checked = checked;
    this.setState({
        eafs: updatedEafFiles }, () => {
            const uncheckedFiles = this.state.eafs.filter((eaf) => !eaf.checked);
            this.setState({
                  checkAllEaf: uncheckedFiles.length === 0 ? true : false
             });
        });
  }

  renderEafHeader() {
    const headerNames = ["File Name", "Created At", "View File Content"];
    const headers = [];
    headers.push(<th key="checkBoxHeader">
    {<label><input className="checkBoxForAllFiles" type="checkbox"
    onChange={this.handleCheckAllEaf} checked={this.state.checkAllEaf}/><span/>
    </label>}
    </th>);
    for (let i = 0; i < headerNames.length; i++) {
          headers.push(<th key={i}>{headerNames[i].toUpperCase()}</th>);
      }
    return headers;
  }

  renderEafData() {
    return this.state.eafs.map((eaf, index) => {
      return (
      <tr key={index}>
         <td><label><input className="checkBoxForFile" type="checkbox"
         checked={eaf.checked} onChange={this.handleCheckboxChangeEaf}
         value={index}/><span/></label></td>
         <td>{eaf.name}</td>
         <td>{eaf.createdAt}</td>
          <td>
              <button className="GetImages waves-effect waves-light btn globalbtn" title="Get EAFs for the file"
               onClick={() => this.viewEaf(eaf)}>
                  <i className="material-icons right">insert_drive_file</i>
                  View EAF
              </button>
          </td>
        </tr>
      );
    });
  }

  deleteEafFiles = async () => {
    const uncheckedFiles = [];
    try {
      for (const eaf of this.state.eafs) {
        if (eaf.checked) {
            // Delete file from cloud
            const filePath = eaf.path;
            const storageRef = this.props.firebase.uploadFile();
            const fileRef = storageRef.child(filePath);
            await fileRef.delete();
            // Delete file from DB
            const formData = new FormData();
            formData.append("eaf_id", eaf.key.toString());
            const response = await fetch(`/api/delete-eaf-file`, {
            method: "POST",
            headers: {
                Accept: "application/json"
            },
            body: formData
        });
            const body = await response.json();
        } else {
            uncheckedFiles.push(eaf);
        }
      }
      this.setState({
        eafs: uncheckedFiles
      });
    } catch (ex) {
      console.log(ex);
    }
  }

  downloadEafFiles = async () => {
    try {
      for (const eaf of this.state.eafs) {
        if (eaf.checked) {
          // Download file from cloud
          const filePath = eaf.path;
          const storageRef = this.props.firebase.uploadFile();
          const url = await storageRef.child(filePath).getDownloadURL();
          const response = await fetch(url);
          const data = await response.blob();
          this.downloadRef.current!.href =  URL.createObjectURL(data);
          this.downloadRef.current!.download = eaf.name;
          this.downloadRef.current!.click();
        }
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  viewEaf = async (eaf: EafEntity) => {
    let eafData: string = "";
    try {
      // Download file from cloud
      const storageRef = this.props.firebase.uploadFile();
      const url = await storageRef.child(eaf.path).getDownloadURL();
      await fetch(url)
        .then((response) => response.text())
        .then((data) => {
            eafData = data;
      });
    } catch (ex) {
      console.log(ex);
    }
    const element = document.getElementById("eafDataContainer");
    if (element !== null) {
      element.setAttribute("class", "unhide");
      const titleElement = document.getElementById("eafFileTitle");
      if (titleElement !== null) {
        titleElement.innerText = "File: " + eaf.name;
        const dataElement = document.getElementById("eafContent");
        if (dataElement != null ) {
          dataElement.innerText = eafData;
        }
      }
    }
  }

  closeEafFile() {
    const element = document.getElementById("eafDataContainer");
    if (element !== null) {
      element.setAttribute("class", "hide");
    }
  }

  render() {
    const {isLoading} = this.state;
    const {showEafs} = this.props;
    const className = `${showEafs
      ? "transition"
      : ""} EafsForMyFiles`;
    return (
      <div className={className}>
        {isLoading && spinner()}
        <button className="BackButton waves-effect waves-light btn globalbtn"
        onClick={this.props.eafsBackButtonClicked}>
          <i className="material-icons right">arrow_back</i>
          Back
        </button>
        {this.state.eafs.length === 0 &&
        <div>
          <p id="noEafsMessage">No annotation files found!</p>
        </div>}
        {this.state.eafs.length > 0 &&
        <div> <br/> <br/>
          <h1 id="eafTitle">Annotaion Files for Audio: {this.props.fileName}</h1><br/>
        </div>}
        {this.state.eafs.length > 0 &&
        <div className="eafContainer">
          <table id="myFiles">
            <tbody>
              <tr> {this.renderEafHeader()} </tr>
              {this.renderEafData()}
            </tbody>
          </table>
        </div>
        }
        {this.state.eafs.length > 0 &&
        <div className="myFilesButtonContainer">
        <button className="DownloadFile waves-effect waves-light btn globalbtn" onClick={this.downloadEafFiles}>
                    <i className="material-icons right">file_download</i>
                    Download Files
        </button>
        <button className="DeleteFile waves-effect waves-light btn globalbtn" onClick={this.deleteEafFiles}>
                    <i className="material-icons right">delete</i>
                    Delete Files
        </button>
        <a className="hide" ref={this.downloadRef} target="_blank">
                    Hidden Download Link
        </a>
        </div>}
        <div id="eafDataContainer" className="hide">
          <p id="eafData">
            <button className="CloseFile waves-effect waves-light btn globalbtn" onClick={this.closeEafFile}>
              <i className="material-icons">
                close
              </i>
            </button>
            <h1 id="eafFileTitle">File Content</h1>
            <p id="eafContent"></p>
          </p>
        </div>
      </div>
    );
  }
}

const authCondition = (authUser: any) => !!authUser;

export default withAuthorization(authCondition)(EafsForMyFiles as any)as any;
