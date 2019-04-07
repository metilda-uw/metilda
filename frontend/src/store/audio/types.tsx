import {Action} from "redux";
import * as constants from "../../constants";
import {Letter} from "../../types/types";

export interface AudioAnalysisState {
    speakers: Letter[][];
}

export interface AddLetter extends Action {
    type: constants.ADD_LETTER;
    speakers: Letter[][];
}

export interface RemoveLetter extends Action {
    type: constants.REMOVE_LETTER;
    speakers: Letter[][];
}

export interface ResetLetters extends Action {
    type: constants.RESET_LETTERS;
    speakers: Letter[][];
}

export interface SetLetterSyllable extends Action {
    type: constants.SET_LETTER_SYLLABLE;
    speakers: Letter[][];
}

export interface SetActiveLetter extends Action {
    type: constants.SET_ACTIVE_LETTER;
    speakers: Letter[][];
}

export interface ManualPitchAdjust extends Action {
    type: constants.MANUAL_PITCH_ADJUST;
    speakers: Letter[][];
}

export type AudioAction = (
    AddLetter | RemoveLetter | ResetLetters | SetLetterSyllable |
    SetActiveLetter | ManualPitchAdjust);
