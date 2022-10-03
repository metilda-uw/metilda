import React from "react";
import { withAuthorization } from "../Session";
import Header from "../Components/header/Header";
import "./History.scss";
import AnalysesForImage from "./AnalysesForImage";
import { spinner } from "../Utils/LoadingSpinner";
import { exportExcel } from "../Utils/ExportExcel";

export interface HistoryProps {
  firebase: any;
}

interface State {
  allUploadedImages: ImageEntity[];
  analysesForSelectedImage: AnalysisEntity[];
  selectedImageName: string;
  selectedImageId: number | null;
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

interface ExcelEntity {
  Image_Name: string;
  Image_Url: string;
  analyses: AnalysisEntity[];
}

export class History extends React.Component<HistoryProps, State> {
  constructor(props: HistoryProps) {
    super(props);

    this.state = {
      allUploadedImages: [],
      analysesForSelectedImage: [],
      selectedImageName: "",
      selectedImageId: null,
      isImageClicked: false,
      isLoading: false,
    };
  }
  componentDidMount() {
    this.getUploadedImages();
  }

  getUploadedImages = async () => {
    this.setState({
      isLoading: true,
    });
    const currentUserId = this.props.firebase.auth.currentUser.email;
    const response = await fetch(
      `/api/get-all-images-for-user/${currentUserId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );
    const body = await response.json();
    const storageRef = this.props.firebase.uploadFile();
    body.result.forEach(async (image: any) => {
      const imageUrl = await storageRef.child(image[2]).getDownloadURL();
      const newImage = {
        id: image[0],
        name: image[1],
        createdAt: image[4],
        imageUrl,
        checked: false,
      };
      this.setState({
        allUploadedImages: [...this.state.allUploadedImages, newImage],
      });
    });
    this.setState({
      isLoading: false,
    });
  };

  analysesBackButtonClicked = () => {
    this.setState({
      isImageClicked: false,
    });
  };

  getAnalysesForImage = (imageId: number, imageName: string) => {
    this.setState({
      isImageClicked: true,
      selectedImageId: imageId,
      selectedImageName: imageName,
    });
  };

  handleCheckboxChange = (event: any) => {
    const index = Number(event.target.value);
    const checked = event.target.checked;
    const updatedImages = [...this.state.allUploadedImages];
    updatedImages[index].checked = checked;
    this.setState({
      allUploadedImages: updatedImages,
    });
  };

  renderImageData = () => {
    return this.state.allUploadedImages.map((image, index) => {
      return (
        <div key={image.id} className="image">
          <div className="imageCheckBox">
            <label>
              <input
                type="checkbox"
                checked={image.checked}
                onChange={this.handleCheckboxChange}
                value={index}
              />
              <span />
            </label>
            {image.name}
          </div>
          <br />
          <input
            type="image"
            title="Click image to see analysis"
            src={image.imageUrl}
            onClick={() => this.getAnalysesForImage(image.id, image.name)}
          />
        </div>
      );
    });
  };

  exportToExcel = async () => {
    const excelEntities: ExcelEntity[] = [];
    await Promise.all(
      this.state.allUploadedImages.map(async (image: ImageEntity) => {
        if (image.checked) {
          const response = await fetch(
            `/api/get-analyses-for-image/${image.id.toString()}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            }
          );
          const analysisBody = await response.json();
          const storageRef = this.props.firebase.uploadFile();
          const allAnalyses: AnalysisEntity[] = [];
          for (const analysis of analysisBody.result) {
            const analysisName = analysis[1];
            const analysisPath = analysis[2];
            const analysisCreatedAt = analysis[4];
            const url = await storageRef.child(analysisPath).getDownloadURL();
            const dataResponse = await fetch(url);
            const analysisData = await dataResponse.json();
            allAnalyses.push({
              name: analysisName,
              createdAt: analysisCreatedAt,
              data: analysisData,
            });
          }
          excelEntities.push({
            Image_Name: image.name,
            Image_Url: image.imageUrl,
            analyses: allAnalyses,
          });
        }
      })
    );

    const excelData = excelEntities.map((excelEntity) => {
      const { Image_Name, Image_Url, analyses } = excelEntity;
      const analysesMap = analyses.reduce((acc, val, index) => {
        const key = "Analysis_" + (index + 1);
        return {
          ...acc,
          [key]: JSON.stringify(val, null, 4),
        };
      }, {});
      return {
        Image_Name,
        Image_Url,
        ...analysesMap,
      };
    });
    exportExcel(excelData, "data");
  };

  render() {
    const { isLoading } = this.state;
    return (
      <div>
        <Header />
        {isLoading && spinner()}
        <h1 id="imageTitle">History of Analyses</h1>
        <p>
          <i>
            <b>Note:</b> 1) Click on each image to view analysis <br />
            2) Select checkboxes for images and click on 'Export to Excel'
            button at the bottom of the page to export image-analysis data to
            excel{" "}
          </i>
        </p>
        <br />
        <div className="imageContainer">{this.renderImageData()}</div>
        {this.state.allUploadedImages.length > 0 && (
          <button
            className="ExportToExcel waves-effect waves-light btn globalbtn"
            onClick={this.exportToExcel}
          >
            <i className="material-icons right">file_download</i>
            Export to Excel
          </button>
        )}
        <AnalysesForImage
          showAnalyses={this.state.isImageClicked}
          analysesBackButtonClicked={this.analysesBackButtonClicked}
          imageId={this.state.selectedImageId}
          imageName={this.state.selectedImageName}
        />
      </div>
    );
  }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(History as any);
