import React, {createRef} from "react";
import {withAuthorization} from "../Session";
import "./ImagesForMyFiles.scss";
import Header from "../Layout/Header";

export interface ImagesForMyFilesProps {
  firebase: any;
  showImages: boolean;
  imagesBackButtonClicked: any;
  imagesForSelectedFile: any;
  selectedFileName: string;
}

interface State {
  isLoading: boolean;
}

export class ImagesForMyFiles extends React.Component < ImagesForMyFilesProps,
State > {
  private downloadRef = createRef<HTMLAnchorElement>();
  constructor(props: ImagesForMyFilesProps) {
    super(props);

    this.state = {
      isLoading: false
    };
  }

renderImageData() {
    return this.props.imagesForSelectedFile.map((file: any) => {
        return (
          <div className="image">
            <div className="imageName">
              <b>{file.name}</b>
            </div>
              <img src={file.imageUrl} alt="new"/>
          </div>
     );
  });
}

  render() {
    const {isLoading} = this.state;
    const {showImages} = this.props;
    const className = `${showImages
      ? "transition"
      : ""} ImagesForMyFiles`;
    return <div className={className}>
    <button className="BackButton waves-effect waves-light btn" onClick={this.props.imagesBackButtonClicked}>
                    <i className="material-icons right">arrow_back</i>
                  Back
    </button>
    <h1 id="imageTitle">Images for File: {this.props.selectedFileName}</h1>
    <div className="imageContainer">
      {this.renderImageData()}
    </div>
    </div>;
  }
}

const authCondition = (authUser: any) => !!authUser;

export default withAuthorization(authCondition)(ImagesForMyFiles as any) as any;
