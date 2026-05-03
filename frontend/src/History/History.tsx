import React from "react";
import { NotificationManager } from "react-notifications";
import { withAuthorization } from "../Session";
import Header from "../Components/header/Header";
import "./History.scss";
import AnalysesForImage from "./AnalysesForImage";
import { spinner } from "../Utils/LoadingSpinner";
import { exportExcel } from "../Utils/ExportExcel";
import { isStorageObjectNotFound } from "../Firebase/storageErrors";

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
  imagePath: string;
  legendPath: string | null;
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
      const legendPath = image[3] || null;
      const newImage = {
        id: image[0],
        name: image[1],
        createdAt: image[4],
        imageUrl,
        imagePath: image[2],
        legendPath,
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

  deleteStorageSilently = async (storageRef: any, path: string | null) => {
    if (!path) {
      return;
    }
    try {
      await storageRef.child(path).delete();
    } catch (ex) {
      if (!isStorageObjectNotFound(ex)) {
        throw ex;
      }
    }
  };

  deleteSelectedHistory = async () => {
    const selected = this.state.allUploadedImages.filter((img) => img.checked);
    if (selected.length === 0) {
      NotificationManager.info("Select at least one image to delete.");
      return;
    }
    const confirmed = window.confirm(
      `Delete ${selected.length} selected image(s) and their analyses from history? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    this.setState({ isLoading: true });
    const storageRef = this.props.firebase.uploadFile();
    const deletedIds = new Set<number>();
    let hadError = false;

    try {
      for (const image of selected) {
        try {
          const analysesResponse = await fetch(
            `/api/get-analyses-for-image/${image.id.toString()}`,
            {
              method: "GET",
              headers: { Accept: "application/json" },
            }
          );
          if (!analysesResponse.ok) {
            throw new Error("Failed to load analyses for this image.");
          }
          const analysesBody = await analysesResponse.json();
          const rows = analysesBody.result || [];
          for (const analysis of rows) {
            const analysisPath = analysis[2] as string;
            await this.deleteStorageSilently(storageRef, analysisPath);
          }

          await this.deleteStorageSilently(storageRef, image.legendPath);
          await this.deleteStorageSilently(storageRef, image.imagePath);

          const formData = new FormData();
          formData.append("image_id", String(image.id));
          const deleteResponse = await fetch(`/api/delete-image`, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: formData,
          });
          if (!deleteResponse.ok) {
            throw new Error(`Failed to delete image ${image.name} from database.`);
          }
          deletedIds.add(image.id);
        } catch (e) {
          hadError = true;
          NotificationManager.error(
            `Could not fully delete "${image.name}". ${e instanceof Error ? e.message : ""}`
          );
        }
      }

      const closingDetail =
        this.state.selectedImageId !== null &&
        deletedIds.has(this.state.selectedImageId);

      this.setState((prev) => {
        const allUploadedImages = prev.allUploadedImages.filter(
          (img) => !deletedIds.has(img.id)
        );
        return {
          allUploadedImages,
          isImageClicked: closingDetail ? false : prev.isImageClicked,
          selectedImageId: closingDetail ? null : prev.selectedImageId,
          selectedImageName: closingDetail ? "" : prev.selectedImageName,
        };
      });

      if (deletedIds.size > 0 && !hadError) {
        NotificationManager.success(
          deletedIds.size === 1
            ? "Selected history item deleted."
            : `${deletedIds.size} history items deleted.`
        );
      } else if (deletedIds.size > 0 && hadError) {
        NotificationManager.info(
          `${deletedIds.size} item(s) removed; some operations reported errors.`
        );
      }
    } finally {
      this.setState({ isLoading: false });
    }
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
            2) Select checkboxes and use &apos;Export to Excel&apos; or
            &apos;Delete selected&apos; at the bottom of the page{" "}
          </i>
        </p>
        <br />
        <div className="imageContainer">{this.renderImageData()}</div>
        {this.state.allUploadedImages.length > 0 && (
          <div className="historyActions">
            <button
              className="ExportToExcel waves-effect waves-light btn globalbtn"
              onClick={this.exportToExcel}
            >
              <i className="material-icons right">file_download</i>
              Export to Excel
            </button>
            <button
              className="DeleteSelectedHistory waves-effect waves-light btn globalbtn"
              onClick={this.deleteSelectedHistory}
            >
              <i className="material-icons right">delete</i>
              Delete selected
            </button>
          </div>
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
