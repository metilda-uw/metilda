import update from "immutability-helper";
import {Dispatch} from "redux";
import {ThunkAction} from "redux-thunk";
import * as constants from "../../constants";
import {Letter, Speaker} from "../../types/types";
import {AppState} from "../index";
import {AudioAction} from "./types";

type ActionReturn = ThunkAction<void, AppState, void, AudioAction>;

export const addSpeaker = (): ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;
    const newSpeakers = update(speakers, {$push: [{uploadId: "", letters: []}]});
    dispatch({
        type: constants.ADD_SPEAKER,
        speakers: newSpeakers,
    });
};

export const removeSpeaker = (speakerIndex: number):
    ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;
    const newSpeakers = speakers.filter((_: any, i: number) => i !== speakerIndex);

    dispatch({
        type: constants.REMOVE_SPEAKER,
        speakers: newSpeakers,
    });
};

export const setUploadId = (speakerIndex: number, uploadId: string):
    ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;
    const newSpeakers = update(speakers, {[speakerIndex]: {uploadId: {$set: uploadId}}});

    dispatch({
        type: constants.SET_UPLOAD_ID,
        speakers: newSpeakers,
    });
};

export const addLetter = (speakerIndex: number, letter: Letter): ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;
    const letters: Letter[] = speakers[speakerIndex].letters;

    let newLetters = letters.concat(letter);
    newLetters = newLetters.sort((a: Letter, b: Letter) => a.t0 - b.t0);

    const newSpeakers = update(speakers, {[speakerIndex]: {letters: {$set: newLetters}}});

    dispatch({
        type: constants.ADD_LETTER,
        speakers: newSpeakers,
    });
};

export const removeLetter = (speakerIndex: number, letterIndex: number):
    ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;
    const letters = speakers[speakerIndex].letters;

    const newLetters = letters.filter((_: any, i: number) => i !== letterIndex);
    const newSpeakers = update(speakers, {[speakerIndex]: {letters: {$set: newLetters}}});

    dispatch({
        type: constants.REMOVE_LETTER,
        speakers: newSpeakers,
    });
};

export const resetLetters = (speakerIndex: number): ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;
    const newSpeakers = update(speakers, {[speakerIndex]: {letters: {$set: []}}});
    dispatch({
        type: constants.RESET_LETTERS,
        speakers: newSpeakers,
    });
};

export const setSpeaker = (speakerIndex: number, speaker: Speaker):
    ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;

    const newSpeakers = update(speakers, {[speakerIndex]: {$set: speaker}});

    dispatch({
        type: constants.SET_SPEAKER,
        speakers: newSpeakers,
    });
};

export const setLetterSyllable = (speakerIndex: number, letterIndex: number, syllable: string):
    ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;
    const letters = getState().audio.speakers[speakerIndex].letters;

    const newLetters = update(letters, {[letterIndex]: {syllable: {$set: syllable}}});
    const newSpeakers = update(speakers, {[speakerIndex]: {letters: {$set: newLetters}}});

    dispatch({
        type: constants.SET_LETTER_SYLLABLE,
        speakers: newSpeakers,
    });
};

export const setLetterPitch = (speakerIndex: number, letterIndex: number, newPitch: number):
    ActionReturn => (dispatch: Dispatch, getState) => {
    const speakers = getState().audio.speakers;
    const letters = getState().audio.speakers[speakerIndex].letters;

    const newLetters = update(letters, {[letterIndex]: {pitch: {$set: newPitch}}});
    const newSpeakers = update(speakers, {[speakerIndex]: {letters: {$set: newLetters}}});

    dispatch({
        type: constants.MANUAL_PITCH_ADJUST,
        speakers: newSpeakers,
    });
};
