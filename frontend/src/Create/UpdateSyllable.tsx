import React, {Component} from "react";
import { FormGroup, FormControlLabel, Checkbox, Dialog, DialogContent, DialogActions } from "@material-ui/core";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import { blue } from "@material-ui/core/colors";

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
    lockRatio: boolean;
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
            currentT1: parseFloat(this.props.currentT1.toFixed(2)),
            lockRatio: true
        };

    }

onChange = (event: any) => {
  if ((event.target.name == "currentT0" || event.target.name == "currentT1") && this.state.lockRatio) {
    const value = parseFloat(event.target.value);
    // get the difference between start and end and add or substract that from opposite T value.
    if (event.target.name === "currentT0") {
      const diff = value - this.state.currentT0;
      this.setState({ [event.target.name]: value });
      this.setState({currentT1: this.state.currentT1 + diff});
    } else if (event.target.name === "currentT1") {
      const diff = value - this.state.currentT1;
      this.setState({ [event.target.name]: value });
      this.setState({currentT0: this.state.currentT0 + diff});
    }
  } else if (event.target.name == "currentT0" || event.target.name == "currentT1") {
    const value = parseFloat(event.target.value);
    this.setState({ [event.target.name]: value });
  } 
  else {
    this.setState({ [event.target.name]: event.target.value });
  }
}

handleChange = () => {
  if (this.state.lockRatio === true) {
    this.setState({lockRatio: false});
  } else {
    this.setState({lockRatio: true});
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
        <div className="row">
          <div className="col s4">
            <p>Syllable:</p>
          </div>
          <div className="col s4">
            <input 
            className="syllableLetter" 
            name="currentSyllable" 
            defaultValue={this.state.currentSyllable}
            onChange={this.onChange}
            type="text" 
            placeholder={"Set syllable text."} 
            required/>
          </div>
          </div>
          
          
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
