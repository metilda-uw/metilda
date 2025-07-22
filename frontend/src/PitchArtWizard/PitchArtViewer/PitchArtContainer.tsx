import * as React from "react";
import { SyntheticEvent } from "react";
import { Speaker } from "../../types/types";
import PitchRange from "../AudioViewer/PitchRange";
import TimeRange from "./TimeRange";
import PitchArt from "./PitchArt";
import "./PitchArtContainer.css";
import PitchArtLegend from "./PitchArtLegend";
import PitchArtToggle from "./PitchArtToggle";
import { Button, Popover, Backdrop, createTheme, Box } from "@material-ui/core"

interface Props {
    firebase: any;
    speakers: Speaker[];
    width: number;
    height: number;
    minPitch?: number;
    maxPitch?: number;
    minTime?: number;
    maxTime?: number;
    uploadId: string;
    pitchArt: any;
    setLetterPitch: (speakerIndex: number, letterIndex: number, newPitch: number) => void;
    updatePitchArtValue: (inputName: string, inputValue: any) => void;
    data: any;
    callBacks:any
}

interface State {
    windowWidth: number;
    anchorEl: HTMLButtonElement | null
}

class PitchArtContainer extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
          windowWidth: window.innerWidth,
          anchorEl: null
        }
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount(): void {
      window.addEventListener("resize", this.setWindowWidth)
    }

    componentWillUnmount(): void {
      window.removeEventListener("resize", this.setWindowWidth)
    }

    handleInputChange(event: SyntheticEvent) {
        const target = event.target as HTMLInputElement;

        let value: boolean | File | string;
        if (target.type === "checkbox") {
            value = target.checked;
        } else if (target.type === "file") {
            value = target.files![0];
        } else {
            value = target.value;
        }

        const name = target.name;

        this.props.updatePitchArtValue(name, value);
    }

    toggleChanged = (inputName: string, isSelected: boolean) => {
        if (inputName === "showVerticallyCentered") {
            this.onVerticallyCenterClick(isSelected);
        }
        this.props.updatePitchArtValue(inputName, isSelected);
    }

    applyPitchRange = (minPitch: number, maxPitch: number) => {
        this.props.updatePitchArtValue("minPitch", minPitch);
        this.props.updatePitchArtValue("maxPitch", maxPitch);
    }

    applyTimeRange = (minTime: number, maxTime: number) => {
        this.props.updatePitchArtValue("maxTime", maxTime);
    }
    
    onVerticallyCenterClick = (isVerticallyCentered: boolean) => {
        if (isVerticallyCentered) {
            this.props.updatePitchArtValue("showPitchScale", false);
        }
    }

    setWindowWidth = () => {
      this.setState({ windowWidth: window.innerWidth })
    }

    setAnchorEl = (event: React.MouseEvent<HTMLButtonElement> | null) => {
      this.setState({ anchorEl: event ? event.currentTarget : null })
    }

    renderOptionList = () => {
      // renders the options for the Pitch Art to the left of the pitch art.
      return (
        <div className="col s5" >
          <h6 className="metilda-control-header">Pitch Art</h6>
          <div className="metilda-pitch-art-container-control-list">
            <PitchRange initMinPitch={this.props.pitchArt.minPitch}
              initMaxPitch={this.props.pitchArt.maxPitch}
              applyPitchRange={this.applyPitchRange} />
            <TimeRange initMinTime={this.props.pitchArt.minTime}
              initMaxTime={this.props.pitchArt.maxTime}
              applyTimeRange={this.applyTimeRange} />
            <div className="row metilda-pitch-art-container-control-toggle-list">
              <PitchArtToggle
                label="Accent Symbol"
                inputName="showAccentPitch"
                isSelected={this.props.pitchArt.showAccentPitch}
                offText="Hide"
                onText="Show"
                onChange={this.toggleChanged}
              />
              <PitchArtToggle
                label={"Syllable Text"}
                inputName={"showSyllableText"}
                isSelected={this.props.pitchArt.showSyllableText}
                offText="Hide"
                onText="Show"
                onChange={this.toggleChanged}
              />
              <PitchArtToggle
                label={"Vertically Center"}
                inputName={"showVerticallyCentered"}
                isSelected={this.props.pitchArt.showVerticallyCentered}
                offText="No"
                onText="Yes"
                onChange={this.toggleChanged}
              />
              <PitchArtToggle
                label={"Lines"}
                inputName={"showPitchArtLines"}
                isSelected={this.props.pitchArt.showPitchArtLines}
                offText="No"
                onText="Yes"
                onChange={this.toggleChanged}
              />
              <PitchArtToggle
                label={"Circle Size"}
                inputName={"showLargeCircles"}
                isSelected={this.props.pitchArt.showLargeCircles}
                offText="Small"
                onText="Large"
                onChange={this.toggleChanged}
              />
              <PitchArtToggle
                label={"Time Normalization"}
                inputName={"showTimeNormalization"}
                isSelected={this.props.pitchArt.showTimeNormalization}
                offText="No"
                onText="Yes"
                onChange={this.toggleChanged}
              />
              <PitchArtToggle
                label={"Pitch & Time Axis"}
                inputName={"showPitchScale"}
                isSelected={this.props.pitchArt.showPitchScale}
                offText="No"
                onText="Yes"
                onChange={this.toggleChanged}
                disabled={this.props.pitchArt.showVerticallyCentered}
              />
              <PitchArtToggle
                label={"Pitch Type"}
                inputName={"showPerceptualScale"}
                isSelected={this.props.pitchArt.showPerceptualScale}
                offText="Linear"
                onText="Metilda"
                onChange={this.toggleChanged}
              />
              <PitchArtToggle
                label={"Saved Image Colors"}
                inputName={"showPitchArtImageColor"}
                isSelected={this.props.pitchArt.showPitchArtImageColor}
                offText="Basic"
                onText="Pitch Art"
                onChange={this.toggleChanged}
              />
              <PitchArtToggle
                label={"Metilda Watermark"}
                inputName={"showMetildaWatermark"}
                isSelected={this.props.pitchArt.showMetildaWatermark}
                offText="Option 1"
                onText="Option 2"
                onChange={this.toggleChanged}
              />
            </div>
            {
              <PitchArtLegend speakers={this.props.speakers} firebase={this.props.firebase} />
            }
          </div>
        </div>
      )
    }

    handlePopupClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      this.setAnchorEl(event)
    }

    handlePopupClose = () => {
      this.setAnchorEl(null)
    }

    renderPopupOptionList = () => {
      // TODO: 1. make popup centered on screen
      // 2. Center options within popup

      // creates options menu with same options at above, but will be contained in a pop 
      // up menu accessed via a button.
      // uses renderOptionList inorder to render the options 
      const theme = createTheme()
      const {anchorEl, windowWidth} = this.state
      const open = Boolean(this.state.anchorEl)
      return (
        <>
          <h4 className="col s7">Pitch Art</h4>
          <Box style={{
            width: windowWidth,
            paddingLeft: "5%",
            paddingRight: "5%",
            paddingBottom: "20px"
          }}>
            <button
              className="col s7 btn globalbtn"
              style={{ width: windowWidth * .8 }}
              onClick={this.handlePopupClick}
            >
              Pitch Art Options
            </button>
          </Box>
          <Backdrop
            open={open}
            style={{ zIndex: theme.zIndex.modal }}
          >
            <Popover
              id={'popover'}
              open={open}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'center'
              }}
              onClose={this.handlePopupClose}
            >
              <div style={{ paddingLeft: '30px', paddingTop: '20px' }}>
                {this.renderOptionList()}
              </div>
            </Popover>
          </Backdrop>
        </>
      )
    }

    render() {
        let { windowWidth } = this.state
        return (
          <>
            {(windowWidth <= 1000) ? this.renderPopupOptionList() : <></>}
            <div>
                {(windowWidth > 1000) ? this.renderOptionList() : <></>}
                <div className="col s7" style={{ paddingTop: "15px"}}>
                    <PitchArt
                        width={this.props.width}
                        height={this.props.height}
                        minPitch={this.props.pitchArt.minPitch}
                        maxPitch={this.props.pitchArt.maxPitch}
                        minTime={this.props.pitchArt.minTime}
                        maxTime={this.props.pitchArt.maxTime}
                        uploadId={this.props.uploadId}
                        setLetterPitch={this.props.setLetterPitch}
                        showAccentPitch={this.props.pitchArt.showAccentPitch}
                        showSyllableText={this.props.pitchArt.showSyllableText}
                        showVerticallyCentered={this.props.pitchArt.showVerticallyCentered}
                        showPitchArtLines={this.props.pitchArt.showPitchArtLines}
                        showLargeCircles={this.props.pitchArt.showLargeCircles}
                        showTimeNormalization={this.props.pitchArt.showTimeNormalization}
                        showPitchScale={this.props.pitchArt.showPitchScale}
                        showPerceptualScale={this.props.pitchArt.showPerceptualScale}
                        showPitchArtImageColor={this.props.pitchArt.showPitchArtImageColor}
                        showMetildaWatermark={this.props.pitchArt.showMetildaWatermark}
                        speakers={this.props.speakers}
                        firebase={this.props.firebase}
                        data={this.props.data}
                        callBacks={this.props.callBacks} />
                </div>
            </div>
          </>
        );
    }
}

export default PitchArtContainer;
