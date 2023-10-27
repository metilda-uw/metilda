import { Action } from "redux";
import * as constants from "../../constants";
import { Letter, Speaker } from "../../types/types";
import {PitchArtDetailsAction} from "../pitchArt/actionTypes";

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

export interface SetSpeaker extends Action {
  type: constants.SET_SPEAKER;
  speakers: Speaker[];
}

export interface SetSpeakerName extends Action {
  type: constants.SET_SPEAKER_NAME;
  speakers: Speaker[];
}

export interface SetWord extends Action {
  type: constants.SET_WORD;
  speakers: Speaker[];
}

export interface SetWordTranslation extends Action {
  type: constants.SET_WORD_TRANSLATION;
  speakers: Speaker[];
}

export interface ReplaceSpeakers extends Action {
  type: constants.REPLACE_SPEAKERS;
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

export interface SetLetterSyllable extends Action {
  type: constants.SET_LETTER_SYLLABLE;
  speakers: Speaker[];
}

export interface SetLetterTime extends Action {
  type: constants.SET_LETTER_TIME;
  speakers: Speaker[];
}

export interface SetWordTime extends Action {
  type: constants.SET_WORD_TIME;
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

export type AudioAction =
  | AddSpeaker
  | RemoveSpeaker
  | SetSpeaker
  | SetSpeakerName
  | SetWord
  | SetWordTranslation
  | AddLetter
  | RemoveLetter
  | ResetLetters
  | SetLetterSyllable
  | SetLetterTime
  | SetWordTime
  | SetActiveLetter
  | ManualPitchAdjust
  | ReplaceSpeakers
  | PitchArtDetailsAction;
