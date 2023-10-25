import React, { Component } from 'react';
import { Speaker } from '../../types/types';
import './PitchArtColorChooser.scss';
import { FormGroup, FormControlLabel, Checkbox, Dialog, DialogContent, DialogActions } from "@material-ui/core";
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

interface Props{
    speakers:Speaker[];
    isColorChangeDialogOpen: boolean;
    handleClose: () => void;
    currentSpeakerIndex:number;
    setLineAndDotColor: (speakerIndex: number, lineColor:string, dotColor:string) => void;
}
interface State {
    lineColor:string;
    dotColor:string;
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
    constructor(props: Props) {
        super(props);
        this.state = {
            lineColor:this.props.speakers[this.props.currentSpeakerIndex].lineColor != undefined ?
            this.props.speakers[this.props.currentSpeakerIndex].lineColor : "gray",
            dotColor:this.props.speakers[this.props.currentSpeakerIndex].dotColor != undefined ?
            this.props.speakers[this.props.currentSpeakerIndex].dotColor : "gray"
        };
    }

    handleLineColorChange = (e) => {
        const selectedLineColor = e.target.value;
        console.log("line color changes to ", selectedLineColor);
        this.setState({ lineColor: selectedLineColor });
    }

    handleDotColorChange = (e) => {
        const selectedDotColor = e.target.value;
        console.log("dot color changes to ", selectedDotColor);
        this.setState({ dotColor: selectedDotColor });
    }

    handleSaveColorChange = (e) => {
       this.props.setLineAndDotColor(this.props.currentSpeakerIndex, this.state.lineColor, this.state.dotColor);
       this.props.handleClose();
    }

    render() {
        const speakers = this.props.speakers; // Replace with your speaker data
        const colors = ["gray","green", "blue", "purple", "red", "orange"]; 

        return (
            <Dialog fullWidth={true} maxWidth="xs" open={this.props.isColorChangeDialogOpen}
            onClose={this.props.handleClose}aria-labelledby="form-dialog-title"> 
                <DialogTitle onClose={this.props.handleClose} id="form-dialog-title">
                    <p>Change Color</p>
                </DialogTitle>
                <DialogContent>
                    <div className="dialog-content color-chooser">
                        <div className="dropdown line-color">
                            <p className="line-color-text">Choose Line Color</p>
                            <select className="line-color-dropdown" value={this.state.lineColor} onChange={this.handleLineColorChange}>
                                {colors && colors.map((color) => (
                                    <option key={color} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="dropdown dot-color">
                            <p className="dot-color-text">Choose Dot Color</p>
                            <select className="dot-color-dropdown" value={this.state.dotColor} onChange={this.handleDotColorChange}>
                                {colors && colors.map((color) => (
                                    <option key={color} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
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

