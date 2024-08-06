import React, { Component } from 'react';
import { Speaker } from '../../types/types';
import './PitchArtColorChooser.scss';
import { FormGroup, FormControlLabel, Checkbox, Dialog, DialogContent, DialogActions, AppBar, Tabs, Tab } from "@material-ui/core";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import { AppState } from '../../store';
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { setLineAndDotColor } from "../../store/audio/actions";
import { AudioAction } from "../../store/audio/types";
import { withAuthorization } from "../../Session";
import { withRouter } from "react-router-dom";
import {getPitchArtDesigns, getLineColors, getDotColors} from '../../Designs/pitchArtDesigns';
import FirebaseContext from "../../Firebase/context";

interface Props{
    speakers:Speaker[];
    isColorChangeDialogOpen: boolean;
    handleClose: () => void;
    currentSpeakerIndex:number;
    setLineAndDotColor: (speakerIndex: number, lineColor:string, dotColor:string) => void;
    firebase:any;
}
interface State {
    tabValue:number;
    lineColor:string;
    dotColor:string;
    currentDesign:string;
    pitchArtDesigns:any[];
    isDotDropDownOpen:boolean;
    isLineDropDownOpen:boolean;
};
const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}
const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});


class PitchArtColorChooser extends Component<Props, State> {
    firebase
    constructor(props: Props) {
        super(props);
        this.state = {
            tabValue: 0,
            lineColor:this.props.speakers[this.props.currentSpeakerIndex].lineColor != undefined ?
            this.props.speakers[this.props.currentSpeakerIndex].lineColor : "#272264",
            dotColor:this.props.speakers[this.props.currentSpeakerIndex].dotColor != undefined ?
            this.props.speakers[this.props.currentSpeakerIndex].dotColor : "#0ba14a",
            currentDesign:null,
            pitchArtDesigns:[],
            isDotDropDownOpen:false,
            isLineDropDownOpen:false
        };
    }
    
    static contextType = FirebaseContext;
    
    async componentDidMount() {
      try {
        const pitchArtDesigns = await getPitchArtDesigns(this.props.firebase);
        this.setState({pitchArtDesigns:pitchArtDesigns});
      } catch (error) {
        console.error("Error fetching pitchArtDesigns:", error);
      }
    }

    handleTabChange = (event, newValue) => {
      this.setState({ tabValue: newValue });
    };

    handleLineColorChange = (colorCode) => {
       
        console.log("line color changes to ", colorCode);
        this.setState({ lineColor: colorCode });
        this.handleToggleLineColorDropdown(null);
    }

    handleDotColorChange = (colorCode) => {
       
        console.log("dot color changes to ", colorCode);
        this.setState({ dotColor: colorCode });
        this.handleToggleDotColorDropdown(null);
    }

    handleSaveColorChange = (e) => {
       this.props.setLineAndDotColor(this.props.currentSpeakerIndex, this.state.lineColor, this.state.dotColor);
       this.props.handleClose();
    }

    handleDesignClick = (designDetails, e) =>{
      console.log(designDetails);
      
      this.setState({ lineColor: designDetails.lineColor, dotColor: designDetails.dotColor , currentDesign:designDetails.imageId});
    }
    renderDesigns = () => {
      
      const pitchArtDesigns = this.state.pitchArtDesigns;
      if(this.state.pitchArtDesigns.length == 0){
        return (
          
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
        );
      }
      const rows = [];
      const designsPerRow = 3;

      for (let i = 0; i < pitchArtDesigns.length; i += designsPerRow) {
        const rowDesigns = pitchArtDesigns.slice(i, i + designsPerRow);

        const rowElements = rowDesigns.map((design:any) => (
          <div key={design.imageId} onClick={(e) => this.handleDesignClick(design,e)} 
            className={`design-item ${design.imageId === this.state.currentDesign ? "design-selected":"design-unselected"}`}>
            {/* Render each design */}
            <img src={design.imageUrl} alt="Design" />
          </div>
        ));

        rows.push(
          <div key={i} className="design-row">
            {rowElements}
          </div>
        );
      }

      return (
        <div className ="design-container dialog-content color-chooser">
          {rows}
        </div>
      );
    }

    renderCustomize = () =>{
      const lineColorMap = getLineColors();
      const dotColorMap = getDotColors();
      return(
        <div className="customize dialog-content color-chooser">
          <div className="dropdown line-color">
              <p className="line-color-text">Choose Line Color</p>
              <div className={`custom-line-dropdown`}>
                <div className="line-dropdown-header" onClick={this.handleToggleLineColorDropdown}>
                  <span>{lineColorMap.get(this.state.lineColor) || 'Select Line Color'}</span>
                  <span className="arrow">&#9660;</span>
                </div>
                <div className={`line-dropdown-options ${this.state.isLineDropDownOpen ? 'open' : ''}`}>
                  {lineColorMap && Array.from(lineColorMap.entries()).map(([code, color]) => (
                    <div
                      key={color}
                      className="line-dropdown-option"
                      onClick={() => this.handleLineColorChange(code)}
                    >
                      <span>{color}</span>
                      {this.state.lineColor === code && <span className="checkmark">&#10004;</span>}
                      <div className="line-color-square" style={{ backgroundColor: code }}></div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
          <div className="dropdown dot-color">
              <p className="dot-color-text">Choose Dot Color</p>
              <div className={`custom-dot-dropdown`}>
                <div className="dot-dropdown-header" onClick={this.handleToggleDotColorDropdown}>
                  {dotColorMap.get(this.state.dotColor) || 'Select Dot Color'}
                  <span className="arrow">&#9660;</span>
                </div>
                <div className={`dot-dropdown-options ${this.state.isDotDropDownOpen ? 'open' : ''}`}>
                  {dotColorMap && Array.from(dotColorMap.entries()).map(([code, color]) => (
                    <div
                      key={color}
                      className="dot-dropdown-option"
                      onClick={() => this.handleDotColorChange(code)}
                    >
                      <span>{color}</span>
                      {this.state.dotColor === code && <span className="checkmark">&#10004;</span>}
                      <div className="dot-color-square" style={{ backgroundColor: code }}></div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
      </div>
      );
    }
    handleToggleDotColorDropdown =(e)=>{
      this.setState({isDotDropDownOpen:!this.state.isDotDropDownOpen});
      e && e.stopPropagation();
    }
    handleToggleLineColorDropdown=(e)=>{
      this.setState({isLineDropDownOpen:!this.state.isLineDropDownOpen});
      e && e.stopPropagation();
    }
    
    render() {

        return (
            <Dialog fullWidth={true} maxWidth="md" open={this.props.isColorChangeDialogOpen}
            onClose={this.props.handleClose}aria-labelledby="form-dialog-title"> 
                <DialogTitle onClose={this.props.handleClose} id="form-dialog-title">
                    <p>{this.state.tabValue === 0 ? "Change Designs" : "Change Color"}</p>
                </DialogTitle>
               
                <AppBar position="static">
                  <Tabs className="color-nav-bar" value={this.state.tabValue} onChange={this.handleTabChange}>
                        <Tab className={`color-tab ${this.state.tabValue === 0 ? 'active-tab' : ''}`} label="Designs" />
                        <Tab className={`color-tab ${this.state.tabValue === 1 ? 'active-tab' : ''}`} label="Customize" />
                  </Tabs>
                </AppBar>
                <DialogContent className='pitchart-dialog-content'>
                  {this.state.tabValue === 0 && this.renderDesigns()}
                  {this.state.tabValue === 1 && this.renderCustomize()}
                </DialogContent>
                <DialogActions>
                    <button className="SaveSyllable waves-effect waves-light btn globalbtn" onClick={this.handleSaveColorChange}>
                        <i className="material-icons right"></i>
                        Save
                    </button>
                </DialogActions>
            </Dialog>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    speakers: state.audio.speakers,
  });
  
  const mapDispatchToProps = (
    dispatch: ThunkDispatch<AppState, void, AudioAction>
  ) => ({
    setLineAndDotColor: (
      speakerIndex: number,
      lineColor:string,
      dotColor:string
    ) => dispatch(setLineAndDotColor(speakerIndex, lineColor, dotColor))
  });
  
  const authCondition = (authUser: any) => !!authUser;
  
  export default connect(mapStateToProps, mapDispatchToProps)(PitchArtColorChooser);

