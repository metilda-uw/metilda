import {Action} from "redux";
import * as constants from "../../constants";
import {Letter, Speaker} from "../../types/types";

export interface AudioAnalysisState {
    speakers: Speaker[];
}

export interface AddSpeaker extends Action {
    type: constants.ADD_SPEAKER;
    speakers: Speaker[];
}

export interface RemoveSpeaker extends Action {
    type: constants.REMOVE_SPEAKER;
    speakers: Speaker[];
}

export interface AddLetter extends Action {
    type: constants.ADD_LETTER;
    speakers: Speaker[];
}

export interface RemoveLetter extends Action {
    type: constants.REMOVE_LETTER;
    speakers: Speaker[];
}

export interface ResetLetters extends Action {
    type: constants.RESET_LETTERS;
    speakers: Speaker[];
}

export interface SetSpeaker extends Action {
    type: constants.SET_SPEAKER;
    speakers: Speaker[];
}

export interface SetLetterSyllable extends Action {
    type: constants.SET_LETTER_SYLLABLE;
    speakers: Speaker[];
}

export interface SetActiveLetter extends Action {
    type: constants.SET_ACTIVE_LETTER;
    speakers: Speaker[];
}

export interface ManualPitchAdjust extends Action {
    type: constants.MANUAL_PITCH_ADJUST;
    speakers: Speaker[];
}

export type AudioAction = (
    AddSpeaker | RemoveSpeaker | AddLetter | RemoveLetter |
    ResetLetters | SetSpeaker | SetLetterSyllable | SetActiveLetter | ManualPitchAdjust);
