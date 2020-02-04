import React from "react";
import {withAuthorization} from "../Session";
import "./ImagesForMyFiles.scss";
import AnalysesForImage from "../History/AnalysesForImage";
import {spinner} from "../Utils/LoadingSpinner";
import {exportExcel} from "../Utils/ExportExcel";

export interface ImagesForMyFilesProps {
  firebase: any;
  showImages: boolean;
  imagesBackButtonClicked: any;
  fileName: string;
  fileId: number;
}

interface ImageEntity {
  name: string;
  createdAt: any;
  imageUrl: any;
  key: number;
  checked: boolean;
}

interface State {
  isLoading: boolean;
  isImageClicked: boolean;
  images: ImageEntity[];
  selectedImageName: string;
  selectedImageId: number | null;
}

interface AnalysisEntity {
  name: string;
  createdAt: any;
  data: any;
}

interface ExcelEntity {
  Image_Name: string;
  Image_Url: string;
  analyses: AnalysisEntity[];
}

export class ImagesForMyFiles extends React.Component < ImagesForMyFilesProps,
State > {
  constructor(props: ImagesForMyFilesProps) {
    super(props);

    this.state = {
      isLoading: false,
      isImageClicked: false,
      images: [],
      selectedImageName: "",
      selectedImageId: null
    };
  }

  async componentWillReceiveProps(nextProps: ImagesForMyFilesProps) {
    const {fileId} = this.props;
    if (nextProps.fileId !== fileId) {
      this.setState({
        images: [],
        isLoading: true,
      });
      const response = await fetch(`/api/get-analyses-for-file/${nextProps.fileId.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      const body = await response.json();
      await Promise.all(body.result.map(async (analysis: number[]) => {
        const analysisId = analysis[0];
        const imageResponse = await fetch(`/api/get-image-for-analysis/${analysisId.toString()}`, {
          method: "GET",
          headers: {
            Accept: "application/json"
          }
        });
        const imageBody = await imageResponse.json();
        const storageRef = this.props.firebase.uploadFile();
        imageBody.result.forEach(async (image: any) => {
          const imageUrl = await storageRef.child(image[2]).getDownloadURL();
          const newImage = {key: image[0], name: image[1], createdAt: image[4], imageUrl, checked: false};
          this.setState({
            images: [...this.state.images, newImage]
          });
        });
      }));
      this.setState({
        isLoading: false,
      });
    }
  }

  handleCheckboxChange = (event: any) => {
    const index = Number(event.target.value);
    const checked = event.target.checked;
    const updatedImages = [...this.state.images];
    updatedImages[index].checked = checked;
    this.setState({
        images: updatedImages
    });
  }

  getAnalysesForImage = async (imageId: number, imageName: string) => {
    this.setState({
        isImageClicked: true,
        selectedImageName: imageName,
        selectedImageId: imageId
      });
  }

  analysesBackButtonClicked = () => {
    this.setState({
        isImageClicked: false
    });
  }

  renderImageData() {
    return this.state.images.map((image, index) => {
          return (
            <div key={image.key} className="image">
            <div className="imageCheckBox">
                <label><input type="checkbox" checked={image.checked} onChange={this.handleCheckboxChange}
                    value={index}/><span/></label><br/>
                   {image.name}
            </div>
            <input type="image" title="Click image to see analysis" src={image.imageUrl}
            onClick={() => (this.getAnalysesForImage(image.key, image.name))}/>
            </div>
       );
    });
  }

  exportToExcel = async () => {
    const excelEntities: ExcelEntity[] = [];
    await Promise.all(this.state.images.map(async (image: ImageEntity) => {
        if (image.checked) {
            const response = await fetch(`/api/get-analyses-for-image/${image.key.toString()}`, {
                method: "GET",
                headers: {
                  Accept: "application/json"
                }
              });
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
                allAnalyses.push(
                    {
                        name: analysisName,
                        createdAt: analysisCreatedAt,
                        data: analysisData
                    });
            }
            excelEntities.push(
                {
                    Image_Name: image.name,
                    Image_Url: image.imageUrl,
                    analyses: allAnalyses
                });
        }
      }));

    const excelData = excelEntities.map((excelEntity) => {
        const { Image_Name, Image_Url, analyses  } = excelEntity;
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
            ...analysesMap

        };
    });
    exportExcel(excelData, "data");
    }

  render() {
    const {isLoading} = this.state;
    const {showImages} = this.props;
    const className = `${showImages
      ? "transition"
      : ""} ImagesForMyFiles`;
    return (
      <div className={className}>
        {isLoading && spinner()}
        <button className="BackButton waves-effect waves-light btn" onClick={this.props.imagesBackButtonClicked}>
          <i className="material-icons right">arrow_back</i>
          Back
        </button>
        {this.state.images.length > 0 && <div>
          <h1 id="imageTitle">Images for File: {this.props.fileName}</h1>
          <p><i><b>Note:</b> 1) Click on each image to view analysis <br/>
        2)  Select checkboxes for images and click on 'Export to Excel'
        button at the bottom of the page to export image-analysis data to excel </i></p><br/>
          </div>}
        <div className="imageContainer">
          {this.renderImageData()}
        </div>
        {this.state.images.length > 0 &&
        <button className="ExportToExcel waves-effect waves-light btn" onClick={this.exportToExcel}>
                    <i className="material-icons right">file_download</i>
                    Export to Excel
        </button>}
        <AnalysesForImage showAnalyses={this.state.isImageClicked}
          analysesBackButtonClicked={this.analysesBackButtonClicked}
          imageId={this.state.selectedImageId}
          imageName={this.state.selectedImageName}/>
      </div>
    );
  }
}

const authCondition = (authUser: any) => !!authUser;

export default withAuthorization(authCondition)(ImagesForMyFiles as any)as any;
