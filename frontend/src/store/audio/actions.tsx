import update from "immutability-helper";
import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import * as constants from "../../constants";
import { Letter, Speaker } from "../../types/types";
import { AppState } from "../index";
import { AudioAction } from "./types";

type ActionReturn = ThunkAction<void, AppState, void, AudioAction>;

export const replaceSpeakers = (speakers: Speaker[]):
  ActionReturn => (dispatch: Dispatch) => {
    const newSpeakers = speakers;
    dispatch({
      type: constants.REPLACE_SPEAKERS,
      speakers: newSpeakers,
    });
  };

export const addSpeaker = (): ActionReturn => (dispatch: Dispatch, getState) => {
  const speakers = getState().audio.speakers;
  const newSpeakers = update(speakers, {
    $push: [{ uploadId: "", letters: [], speakerName: "Spearker", word: "Word", wordTranslation: "Word Translation" }],
  });
  dispatch({
    type: constants.ADD_SPEAKER,
    speakers: newSpeakers,
  });
};

export const removeSpeaker =
  (speakerIndex: number): ActionReturn =>
    (dispatch: Dispatch, getState) => {
      const speakers = getState().audio.speakers;
      const newSpeakers = speakers.filter(
        (_: any, i: number) => i !== speakerIndex
      );

      dispatch({
        type: constants.REMOVE_SPEAKER,
        speakers: newSpeakers,
      });
    };

export const setSpeaker =
  (speakerIndex: number, speaker: Speaker): ActionReturn =>
    (dispatch: Dispatch, getState) => {
      const speakers = getState().audio.speakers;
      speaker.speakerName = "";

      const newSpeakers = update(speakers, { [speakerIndex]: { $set: speaker } });

      dispatch({
        type: constants.SET_SPEAKER,
        speakers: newSpeakers,
      });
    };

export const setSpeakerName =
  (speakerIndex: number, speakerName: string): ActionReturn =>
    (dispatch: Dispatch, getState) => {
      const speakers = getState().audio.speakers;
      const newSpeakers = update(speakers, {
        [speakerIndex]: {
          speakerName: { $set: speakerName },
        },
      });

      dispatch({
        type: constants.SET_SPEAKER_NAME,
        speakers: newSpeakers,
      });
    };

export const setUploadId =
  (speakerIndex: number, uploadId: string, fileIndex: number): ActionReturn =>
    (dispatch: Dispatch, getState) => {
      const speakers = getState().audio.speakers;
      const newSpeakers = update(speakers, {
        [speakerIndex]: {
          uploadId: { $set: uploadId },
          fileIndex: { $set: fileIndex },
        },
      });

      dispatch({
        type: constants.SET_UPLOAD_ID,
        speakers: newSpeakers,
      });
    };

export const setWord =
  (speakerIndex: number, word: string): ActionReturn =>
    (dispatch: Dispatch, getState) => {
      const speakers = getState().audio.speakers;
      const newSpeakers = update(speakers, {
        [speakerIndex]: {
          word: { $set: word },
        },
      });

      dispatch({
        type: constants.SET_WORD,
        speakers: newSpeakers,
      });
    };

export const setWordTranslation =
  (speakerIndex: number, wordTranslation: string): ActionReturn =>
    (dispatch: Dispatch, getState) => {
      const speakers = getState().audio.speakers;
      const newSpeakers = update(speakers, {
        [speakerIndex]: {
          wordTranslation: { $set: wordTranslation },
        },
      });

      dispatch({
        type: constants.SET_WORD_TRANSLATION,
        speakers: newSpeakers,
      });
    };

export const setLatestAnalysisId =
  (
    speakerIndex: number,
    latestAnalysisId: number,
    latestAnalysisName: string,
    lastUploadedLetters: Letter[]
  ): ActionReturn =>
    (dispatch: Dispatch, getState) => {
      const speakers = getState().audio.speakers;
      const newSpeakers = update(speakers, {
        [speakerIndex]: {
          latestAnalysisId: { $set: latestAnalysisId },
          latestAnalysisName: { $set: latestAnalysisName },
          lastUploadedLetters: { $set: lastUploadedLetters },
        },
      });
      dispatch({
        type: constants.SET_LATEST_ANALYSIS_ID,
        speakers: newSpeakers,
      });
    };

export const addLetter =
  (speakerIndex: number, letter: Letter): ActionReturn =>
    (dispatch: Dispatch, getState) => {
      const speakers = getState().audio.speakers;
      const letters: Letter[] = speakers[speakerIndex].letters;

      let newLetters = letters.concat(letter);
      newLetters = newLetters.sort((a: Letter, b: Letter) => a.t0 - b.t0);

      const newSpeakers = update(speakers, {
        [speakerIndex]: { letters: { $set: newLetters } },
      });

      dispatch({
        type: constants.ADD_LETTER,
        speakers: newSpeakers,
      });
    };

export const removeLetter =
  (speakerIndex: number, letterIndex: number): ActionReturn =>
    (dispatch: Dispatch, getState) => {
      const speakers = getState().audio.speakers;
      const letters = speakers[speakerIndex].letters;

      const newLetters = letters.filter((_: any, i: number) => i !== letterIndex);
      const newSpeakers = update(speakers, {
        [speakerIndex]: { letters: { $set: newLetters } },
      });

      dispatch({
        type: constants.REMOVE_LETTER,
        speakers: newSpeakers,
      });
    };

export const resetLetters =
  (speakerIndex: number): ActionReturn =>
    (dispatch: Dispatch, getState) => {
      const speakers = getState().audio.speakers;
      const newSpeakers = update(speakers, {
        [speakerIndex]: { letters: { $set: [] } },
      });
      dispatch({
        type: constants.RESET_LETTERS,
        speakers: newSpeakers,
      });
    };

export const setLetterSyllable =
  (speakerIndex: number, letterIndex: number, syllable: string): ActionReturn =>
    (dispatch: Dispatch, getState) => {
      const speakers = getState().audio.speakers;
      const letters = getState().audio.speakers[speakerIndex].letters;

      const newLetters = update(letters, {
        [letterIndex]: { syllable: { $set: syllable } },
      });
      const newSpeakers = update(speakers, {
        [speakerIndex]: { letters: { $set: newLetters } },
      });

      dispatch({
        type: constants.SET_LETTER_SYLLABLE,
        speakers: newSpeakers,
      });
    };

export const setLetterTime =
  (
    speakerIndex: number,
    letterIndex: number,
    newT0: number,
    newT1: number
  ): ActionReturn =>
    (dispatch: Dispatch, getState) => {
      const speakers = getState().audio.speakers;
      const letters = getState().audio.speakers[speakerIndex].letters;

      const newLetters = update(letters, {
        [letterIndex]: { t0: { $set: newT0 }, t1: { $set: newT1 } },
      });
      const newSpeakers = update(speakers, {
        [speakerIndex]: { letters: { $set: newLetters } },
      });

      dispatch({
        type: constants.SET_LETTER_TIME,
        speakers: newSpeakers,
      });
    };

export const setWordTime =
  (speakerIndex: number, time: number): ActionReturn =>
    (dispatch: Dispatch, getState) => {
      const speakers = getState().audio.speakers;
      const newSpeakers = update(speakers, {
        [speakerIndex]: {
          wordTime: { $set: time },
        },
      });

      dispatch({
        type: constants.SET_WORD,
        speakers: newSpeakers,
      });
    };

export const setLetterPitch =
  (speakerIndex: number, letterIndex: number, newPitch: number): ActionReturn =>
    (dispatch: Dispatch, getState) => {
      const speakers = getState().audio.speakers;
      const letters = getState().audio.speakers[speakerIndex].letters;

      const newLetters = update(letters, {
        [letterIndex]: { pitch: { $set: newPitch } },
      });
      const newSpeakers = update(speakers, {
        [speakerIndex]: { letters: { $set: newLetters } },
      });

      dispatch({
        type: constants.MANUAL_PITCH_ADJUST,
        speakers: newSpeakers,
      });
    };
