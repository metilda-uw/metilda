import React, {createRef} from "react";
import { withAuthorization } from "../Session";
import Header from "../Layout/Header";
import "./History.scss";
import AnalysesForImage from "./AnalysesForImage";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

export interface HistoryProps {
  firebase: any;
}

interface State {
  allUploadedImages: ImageEntity[];
  analysesForSelectedImage: AnalysisEntity[];
  selectedImageName: string;
  isImageClicked: boolean;
  isLoading: boolean;
}

interface AnalysisEntity {
    name: string;
    createdAt: any;
    data: any;
}

interface ImageEntity {
    id: number;
    name: string;
    createdAt: any;
    imageUrl: any;
    checked: boolean;
}

export class History extends React.Component<HistoryProps, State> {
  constructor(props: HistoryProps) {
      super(props);

      this.state = {
        allUploadedImages: [],
        analysesForSelectedImage: [],
        selectedImageName: "",
        isImageClicked: false,
        isLoading: false
      };
  }
  componentDidMount() {
    this.getUploadedImages();
  }

  getUploadedImages = async () => {
    const currentUserId = this.props.firebase.auth.currentUser.email;
    const response = await fetch(`/api/get-all-images/${currentUserId}`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
    const body = await response.json();
    const updatedImages: ImageEntity[] = [];
    const storageRef = this.props.firebase.uploadFile();
    for (const image of body.result) {
        const imageUrl = await storageRef.child(image[2]).getDownloadURL();
        updatedImages.push({
            id: image[0],
            name: image[1],
            createdAt: image[4],
            imageUrl,
            checked: false
        });
    }
    this.setState({
        allUploadedImages: updatedImages
    });
  }

  analysesBackButtonClicked = async () => {
    this.setState({
        isImageClicked: false
    });
  }

  getAnalysesForImage = async (imageId: number, imageName: string) => {
    const response = await fetch(`/api/get-analyses-for-image/${imageId.toString()}`, {
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
        isImageClicked: true,
        analysesForSelectedImage: updatedAnalyses,
        selectedImageName: imageName
      });
  }

  handleCheckboxChange = (event: any) => {
    const index = Number(event.target.value);
    const checked = event.target.checked;
    const updatedImages = [...this.state.allUploadedImages];
    updatedImages[index].checked = checked;
    this.setState({
        allUploadedImages: updatedImages
    });
  }

  renderImageData = () => {
    return this.state.allUploadedImages.map((image, index) => {
        return (
            <div key={image.id} className="image">
            <div className="imageCheckBox">
                <label><input type="checkbox" checked={image.checked} onChange={this.handleCheckboxChange}
                    value={index}/><span/></label><br/>
                   {image.name}
            </div>
            <input type="image" src={image.imageUrl} onClick={() => (this.getAnalysesForImage(image.id, image.name))}/>
            </div>
        );
    });
  }

   exportToExcel = async () => {
       const allAnalyses: AnalysisEntity[] = [];
       for (const image of this.state.allUploadedImages) {
        if (image.checked) {
            const response = await fetch(`/api/get-analyses-for-image/${image.id.toString()}`, {
                method: "GET",
                headers: {
                  Accept: "application/json"
                }
              });
            const body = await response.json();
            for (const analysis of body.result) {
                const analysisName = analysis[1];
                const analysisPath = analysis[2];
                const analysisCreatedAt = analysis[4];
                const storageRef = this.props.firebase.uploadFile();
                const url = await storageRef.child(analysisPath).getDownloadURL();
                const dataResponse = await fetch(url);
                const analysisData = await dataResponse.json();
                allAnalyses.push(
                    {
                        name: analysisName,
                        createdAt: analysisCreatedAt,
                        data: analysisData
                    });
            }
        }
     }
       console.log(allAnalyses);
       const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
       const fileExtension = ".xlsx";
       const ws = XLSX.utils.json_to_sheet(allAnalyses);
       console.log(ws);
       const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
       const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
       const data = new Blob([excelBuffer], {type: fileType});
       FileSaver.saveAs(data, "Analysis" + fileExtension);
    }

    render() {
    // const { isLoading } = this.state;
    const customers = [{test1: "hello1", name1: "hey1"}, {test1: "hello2", name1: "hey2"}];
    return (
        <div>
            <Header/>
            <div className="imageContainer">
            {this.renderImageData()}
            </div>
            <button className="ExportToExcel waves-effect waves-light btn" onClick={this.exportToExcel}>
                    <i className="material-icons right">file_download</i>
                    Export to Excel
            </button>

            {/* <ExportExcel excelData={customers} fileName="hello" /> */}
            <AnalysesForImage showAnalyses={this.state.isImageClicked}
          analysesBackButtonClicked={this.analysesBackButtonClicked}
          analysesForSelectedImage={this.state.analysesForSelectedImage}
          selectedImageName={this.state.selectedImageName}/>
        </div>
      );
  }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(History as any);
