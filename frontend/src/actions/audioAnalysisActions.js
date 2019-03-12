import audioAnalysisReducer from "../reducers/audioAnalysisReducers";
import update from "immutability-helper";

export const actions = {
    AUDIO_SELECTION: "AUDIO_SELECTION",
    ADD_LETTER: "ADD_LETTER",
    REMOVE_LETTER: "REMOVE_LETTER",
    RESET_LETTERS: "RESET_LETTERS",
    SET_LETTER_SYLLABLE: "SET_LETTER_SYLLABLE",
    SET_ACTIVE_LETTER: "SET_ACTIVE_LETTER"
};

export const audioSelectionAction = (leftX, rightX) => dispatch => {
    dispatch({
        type: actions.AUDIO_SELECTION,
        timeline: {leftX: leftX, rightX: rightX}
    })
};

export const addLetter = (letter) => (dispatch, getState) => {
    let letters = getState().audioAnalysisReducer.letters;
    let newLettersList = letters.concat(letter);
    newLettersList = newLettersList.sort((a, b) => a.t0 - b.t0);

    dispatch({
        type: actions.ADD_LETTER,
        letters: newLettersList
    })
};

export const removeLetter = (index) => (dispatch, getState) => {
    let letters = getState().audioAnalysisReducer.letters;
    let newLetters = letters.filter((_, i) => i !== index);

    dispatch({
        type: actions.REMOVE_LETTER,
        letters: newLetters
    })
};

export const resetLetters = () => dispatch => {
    dispatch({
        type: actions.RESET_LETTERS,
        letters: []
    })
};

export const setLetterSyllable = (index, syllable) => (dispatch, getState) => {
    let letters = getState().audioAnalysisReducer.letters;
    let newLetters = update(letters, {[index]: {letter: {$set: syllable}}});

    dispatch({
        type: actions.SET_LETTER_SYLLABLE,
        letters: newLetters
    })
};