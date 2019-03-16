import {Letter} from "../../types/types";
import {Action} from "redux";
import * as constants from "../../constants";

export interface AudioAnalysisState {
    letters: Array<Letter>
}

export interface AddLetter extends Action {
    type: constants.ADD_LETTER,
    letters: Array<Letter>
}

export interface RemoveLetter extends Action {
    type: constants.REMOVE_LETTER,
    letters: Array<Letter>
}

export interface ResetLetters extends Action {
    type: constants.RESET_LETTERS,
    letters: Array<Letter>
}

export interface SetLetterSyllable extends Action {
    type: constants.SET_LETTER_SYLLABLE,
    letters: Array<Letter>
}

export interface SetActiveLetter extends Action {
    type: constants.SET_ACTIVE_LETTER,
    letters: Array<Letter>
}

export interface ManualPitchAdjust extends Action {
    type: constants.MANUAL_PITCH_ADJUST,
    letters: Array<Letter>
}

export type AudioAction = (
    AddLetter | RemoveLetter | ResetLetters | SetLetterSyllable |
    SetActiveLetter | ManualPitchAdjust)