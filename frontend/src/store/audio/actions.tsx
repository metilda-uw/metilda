import update from "immutability-helper";
import {Dispatch} from "redux";
import {ThunkAction} from "redux-thunk";
import * as constants from "../../constants";
import {Letter} from "../../types/types";
import {AppState} from "../index";
import {AudioAction} from "./types";

type ActionReturn = ThunkAction<void, AppState, void, AudioAction>;

export const addSpeaker = (): ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;
    const newSpeakers = update(speakers, {$push: [[]]});
    dispatch({
        type: constants.ADD_SPEAKER,
        speakers: newSpeakers,
    });
}

export const removeSpeaker = (speakerIndex: number):
    ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;
    const newSpeakers = speakers.filter((_: any, i: number) => i !== speakerIndex);

    dispatch({
        type: constants.REMOVE_SPEAKER,
        speakers: newSpeakers,
    });
};

export const addLetter = (speakerIndex: number, letter: Letter): ActionReturn => (dispatch: Dispatch, getState) => {
    let speakers = getState().audio.speakers;

    let letters: Letter[];
    let isNewList = false;
    if (speakerIndex <= speakers.length - 1) {
        letters = speakers[0];
    } else {
        isNewList = true;
        letters = [];
    }

    let newLettersList = letters.concat(letter);
    newLettersList = newLettersList.sort((a: Letter, b: Letter) => a.t0 - b.t0);

    if (isNewList) {
        speakers = update(speakers, {$push: [newLettersList]});
    } else {
        speakers = update(speakers, {[speakerIndex]: {$set: newLettersList}});
    }

    dispatch({
        type: constants.ADD_LETTER,
        speakers,
    });
};

export const removeLetter = (speakerIndex: number, letterIndex: number):
    ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;
    const letters = speakers[speakerIndex];

    const newLetters = letters.filter((_: any, i: number) => i !== letterIndex);
    const newSpeakers = update(speakers, {[speakerIndex]: {$set: newLetters}});

    dispatch({
        type: constants.REMOVE_LETTER,
        speakers: newSpeakers,
    });
};

export const resetLetters = (speakerIndex: number): ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;
    const newSpeakers = update(speakers, {[speakerIndex]: {$set: []}});
    dispatch({
        type: constants.RESET_LETTERS,
        speakers: newSpeakers,
    });
};

export const setLetterSyllable = (speakerIndex: number, letterIndex: number, syllable: string):
    ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;
    const letters = getState().audio.speakers[speakerIndex];

    const newLetters = update(letters, {[letterIndex]: {syllable: {$set: syllable}}});
    const newSpeakers = update(speakers, {[speakerIndex]: {$set: newLetters}});

    dispatch({
        type: constants.SET_LETTER_SYLLABLE,
        speakers: newSpeakers,
    });
};

export const setLetterPitch = (speakerIndex: number, letterIndex: number, newPitch: number):
    ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;
    const letters = getState().audio.speakers[speakerIndex];

    const newLetters = update(letters, {[letterIndex]: {pitch: {$set: newPitch}}});
    const newSpeakers = update(speakers, {[speakerIndex]: {$set: newLetters}});

    dispatch({
        type: constants.MANUAL_PITCH_ADJUST,
        speakers: newSpeakers,
    });
};
