import * as constants from "../../constants";
import update from "immutability-helper";
import {Letter} from "../../types/types";
import {Action, AnyAction, Dispatch, Store} from "redux";
import {ThunkAction} from "redux-thunk";
import {AudioAction, AudioAnalysisState} from "./types";
import {AppState} from "../index";


type ActionReturn = ThunkAction<void, AppState, void, AudioAction>;

export const addLetter = (letter: Letter): ActionReturn => (dispatch: Dispatch, getState) => {
    let letters = getState().audio.letters;
    let newLettersList = letters.concat(letter);
    newLettersList = newLettersList.sort((a: Letter, b: Letter) => a.t0 - b.t0);

    dispatch({
        type: constants.ADD_LETTER,
        letters: newLettersList
    })
};

export const removeLetter = (index: number): ActionReturn => (dispatch: Dispatch, getState) => {
    let letters = getState().audio.letters;
    let newLetters = letters.filter((_: any, i: number) => i !== index);

    dispatch({
        type: constants.REMOVE_LETTER,
        letters: newLetters
    })
};

export const resetLetters = (): ActionReturn => (dispatch: Dispatch) => {
    dispatch({
        type: constants.RESET_LETTERS,
        letters: []
    })
};

export const setLetterSyllable = (index: number, syllable: string): ActionReturn => (dispatch: Dispatch, getState) => {
    let letters = getState().audio.letters;
    let newLetters = update(letters, {[index]: {letter: {$set: syllable}}});

    dispatch({
        type: constants.SET_LETTER_SYLLABLE,
        letters: newLetters
    })
};

export const setLetterPitch = (index: number, newPitch: number): ActionReturn => (dispatch: Dispatch, getState) => {
    let letters = getState().audio.letters;
    let newLetters = update(letters, {[index]: {pitch: {$set: newPitch}}});

    dispatch({
        type: constants.MANUAL_PITCH_ADJUST,
        letters: newLetters
    })
};