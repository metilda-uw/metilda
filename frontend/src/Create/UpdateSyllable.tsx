import React, {Component} from "react";
import { Dialog, DialogContent, DialogActions } from "@material-ui/core";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

// setup details of the dialog box - close button
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
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
});

// UpdateSyllable implementation

export interface UpdateSyllableProps {
    showEditSyllableModal: boolean;
    currentSyllable: string;
    currentT0: number;
    currentT1: number;
    saveSyllable: (syllable: string, t0: number, t1: number) => void;
    handleClose: () => void;
}

export interface State {
    showEditSyllableModal: boolean;
    currentSyllable: string;
    currentT0: number;
    currentT1: number;
    // needed for the onChange event to work.
    [key: string]: any;
}

export class UpdateSyllable extends Component <UpdateSyllableProps, State> {

    constructor(props: UpdateSyllableProps) {
        super(props);
        this.state = {
            showEditSyllableModal: this.props.showEditSyllableModal,
            currentSyllable: this.props.currentSyllable,
            currentT0: parseFloat(this.props.currentT0.toFixed(2)),
            currentT1: parseFloat(this.props.currentT1.toFixed(2))
        };

    }

onChange = (event: any) => {
  if (event.target.name === "currentT0" || event.target.name === "currentT1") {
    const value = parseFloat(event.target.value);
    this.setState({ [event.target.name]: value });
  } else {
    this.setState({ [event.target.name]: event.target.value });
  }
  
}
  
render() {
   
    return(
        <Dialog fullWidth={true} maxWidth="xs" open={this.props.showEditSyllableModal}
                onClose={this.props.handleClose}aria-labelledby="form-dialog-title">

        <DialogTitle onClose={this.props.handleClose} id="form-dialog-title">
            <p>Syllable Details</p>
        </DialogTitle>
        <DialogContent>
        <input 
            className="syllableLetter" 
            name="currentSyllable" 
            defaultValue={this.state.currentSyllable.toString()}
            onChange={this.onChange}
            type="text" 
            placeholder={"Set syllable text."} 
            required/>
        <input 
            className="syllableStartTime" 
            name="currentT0" 
            defaultValue={this.state.currentT0}
            onChange={this.onChange}
            type="number" 
            placeholder={"Set start time."}
            step="0.01"
            required/>
         <input 
            className="syllableEndTime" 
            name="currentT1" 
            defaultValue={(this.state.currentT1)}
            onChange={this.onChange}
            type="number" 
            placeholder={"Set end time."}
            step="0.01"
            required/>
        </DialogContent>
        <DialogActions>
            <button className="SaveSyllable waves-effect waves-light btn globalbtn"
            onClick={() => this.props.saveSyllable(this.state.currentSyllable, 
                            this.state.currentT0, this.state.currentT1)}>
                <i className="material-icons right"></i>
                Save
            </button>
        </DialogActions>
        </Dialog>
    );
  }
}
export default (UpdateSyllable);
