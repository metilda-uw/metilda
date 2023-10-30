import React, { useContext, useEffect, useState, useRef } from "react";
import Modal from "react-modal";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import { FormGroup, FormControlLabel, Checkbox, Dialog, DialogContent, DialogActions } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import { Link, useHistory } from "react-router-dom";
import WordCard from "../Components/collections/WordCard";
import './PitchArtVersionSelector.scss'

const PitchArtVersionSelector = (props) =>{
    // const customStyles = {
    //     content: {
    //       margin: 0,
    //       top: "50%",
    //       left: "50%",
    //       right: "auto",
    //       bottom: "auto",
    //       marginRight: "-50%",
    //       transform: "translate(-50%, -50%)",
    //     },
    // };
    // const firebase = useContext(FirebaseContext);

    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    // const history = useHistory();

    const showNext = () => {
        setCurrentWordIndex((prevIndex) =>
            prevIndex < props.words.length - 1 ? prevIndex + 1 : prevIndex
        );
    };

    const showPrevious = () => {
        setCurrentWordIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
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
    
    interface DialogTitleProps extends WithStyles<typeof styles> {
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
    
    function onCancelClick(){
        props.removeVersionsModal();
    }
    function loadVersion(){
        props.removeVersionsModal();
        
        props.history.push({pathname:`/pitchartwizard/${props.collectionId}/${props.words[currentWordIndex].id}`});
    }

    return (
        <div className="version-selector">
            {/* <Modal isOpen={true} style={customStyles}
                appElement={document.getElementById("root" || undefined)}>
                <h3> Load Pitch Art versions</h3>
                <div className="collectionRename-cancel-save">
                    <button
                    className="btn waves-light globalbtn"
                    onClick={onCancelClick}
                    >
                    Cancel
                    </button>
                    <button
                    className="btn waves-light globalbtn"
                    onClick={loadVersion}
                    >
                    Load version
                    </button>
                </div>
            </Modal> */}

            <Dialog fullWidth={true} maxWidth="xs" open={true}
                onClose={onCancelClick}aria-labelledby="form-dialog-title"> 
                <DialogTitle onClose={onCancelClick} id="form-dialog-title">
                    <p>Pitch Art Versions</p>
                </DialogTitle>
                <DialogContent>
                <div className="row collections-view-wordcards">
                    <ul className="word-list">
                        {props.words.map((word, index) => (
                        <li
                            key={word.id}
                            className={`word-card ${index === currentWordIndex ? 'active' : ''}`}
                        >
                            <WordCard
                            word={word}
                            selectedCollectionUuid={props.collectionId}
                            key={word.id}
                            fb={props.firebase}
                            classArgument= {"card-tile"}
                            />
                        </li>
                        ))}
                    </ul>
                    <div className="pagination">
                        <button onClick={showPrevious}>Previous</button>
                        <button onClick={showNext}>Next</button>
                    </div>
                </div>
                    
                </DialogContent>
                <DialogActions>
                    <button className="SaveSyllable waves-effect waves-light btn globalbtn" onClick={loadVersion}>
                        <i className="material-icons right"></i>
                        load pitch version
                    </button>
                </DialogActions>
            </Dialog>

        </div>
    );
}

export default PitchArtVersionSelector