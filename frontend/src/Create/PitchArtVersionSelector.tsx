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
import WordSyllableCategories from "../Learn/WordSyllableCategories";

const PitchArtVersionSelector = (props) =>{

    // const [currentWordIndex, setCurrentWordIndex] = useState(0);

    // const showNext = () => {
    //     setCurrentWordIndex((prevIndex) =>
    //         prevIndex < props.words.length - 1 ? prevIndex + 1 : prevIndex
    //     );
    // };

    // const showPrevious = () => {
    //     setCurrentWordIndex((prevIndex) =>
    //         prevIndex > 0 ? prevIndex - 1 : prevIndex
    //     );
    // };
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
    const loadVersion =(index) =>{
        props.removeVersionsModal();
        
        const selectedWord = selectedWords[index];
        if(props.params["type"] == null || props.params["type"] == 'share'){
            props.setCurrentPitchArtData(selectedWord["data"],selectedWord.id,props.collectionId);
        }else{
            props.history.push({pathname:`/pitchartwizard/${props.collectionId}/${selectedWord.id}`});
        }
       
    }

    const word1 = props.words.length > 0 ? props.words[0] : null;
    const word2 = props.words.length > 1 ? props.words[1] : word1;
    const [selectedIds, setSelectedIds] = useState([word1?.id, word2?.id]);
    const [selectedWords, setSelectedWords] = useState([word1, word2]);

    const handleDropdownChange = (index, selectedId) => {
        const newSelectedIds = [...selectedIds];
        newSelectedIds[index] = selectedId;
        setSelectedIds(newSelectedIds);
        if(selectedId != selectedWords[index].id){
           const selectedWord =  props.words.find((word) =>{
                return word.id === selectedId;
            });
            const newSelectedWords = [...selectedWords];
            newSelectedWords[index] = selectedWord;
            setSelectedWords(newSelectedWords);
        }
        
    };

    return (
        // {words = words.props.words;}
        <div className="version-selector">
            <Dialog fullWidth={true} maxWidth="md" open={true}
            onClose={onCancelClick}aria-labelledby="form-dialog-title"> 
                <DialogTitle onClose={onCancelClick} id="form-dialog-title">
                   {props.words.length != 0 && <p>Pitch Art Versions</p> } 
                </DialogTitle>
                <DialogContent>
                { (props.words.length != 0) ? ( 
                    <div className="row version-word-cards">
                        {[0, 1].map((sectionIndex) => (
                            <div key={sectionIndex} className={`comparison-section section-${sectionIndex}`}>
                                <div className="dropdown-container">
                                    <label className="select-label" htmlFor={`dropdown-${sectionIndex}`}>Select Pitch Art for comparision</label>
                                    <select
                                    id={`dropdown-${sectionIndex}`}
                                    className = "select-id"
                                    value={selectedIds[sectionIndex] ? selectedIds[sectionIndex]: ''}
                                    onChange={(e) => handleDropdownChange(sectionIndex, e.target.value)}
                                    >
                                    <option value="" disabled>Select a word</option>
                                    {props.words.map((word) => (
                                        <option key={word.id} value={word.id}>
                                        {word["data"].speakerName}
                                        </option>
                                    ))}
                                    </select>
                                </div>

                                <div className="word-comparison">
                                    <WordCard
                                        word={selectedWords[sectionIndex]}
                                        selectedCollectionUuid={props.collectionId}
                                        key={selectedWords[sectionIndex]["id"]}
                                        fb={props.firebase}
                                        classArgument= {"card-tile"}
                                        url={props.urls[selectedWords[sectionIndex]["id"]]}
                                    />
                                </div>
                            </div>
                        ))}
                        {/* <div className="pagination">
                            <button className="waves-effect waves-light btn globalbtn" disabled={currentWordIndex === 0} onClick={showPrevious}>Previous</button>
                            <button className="waves-effect waves-light btn globalbtn right" disabled={currentWordIndex === props.words.length-1} onClick={showNext}>Next</button>
                        </div> */}
                    </div>
                ):(
                    <p>There are no pitch art versions</p>
                )}
                </DialogContent>
                {props.words.length !== 0 &&
                    <DialogActions  className="selected-index-action">
                        {[0,1].map((index) => (
                            <button key = {`load-version-${index}`} className="load-version waves-effect waves-light btn globalbtn" onClick={() =>loadVersion(index)}>
                            <i className="material-icons"></i>
                            load this version
                            </button>
                        ))}
                        
                    </DialogActions>
                }
            </Dialog>
        
        </div>
    );
}

export default PitchArtVersionSelector;