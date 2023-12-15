import { Reducer, Store } from "redux";
import * as constants from "../../constants";
import { AudioAnalysisState } from "../../store/audio/types";

const defaultState: AudioAnalysisState = {
  speakers: [{ uploadId: "", letters: [] , lineColor:"#272264", dotColor:"#0ba14a"}],
};

const reducer: Reducer<AudioAnalysisState> = (
  state: AudioAnalysisState = defaultState,
  action
) => {
  switch (action.type) {
    case constants.ADD_SPEAKER:
      return { ...state, speakers: action.speakers };
    case constants.REPLACE_SPEAKERS:
      return { ...state, speakers: action.speakers };
    case constants.REMOVE_SPEAKER:
      return { ...state, speakers: action.speakers };
    case constants.SET_SPEAKER:
      return { ...state, speakers: action.speakers };
    case constants.SET_UPLOAD_ID:
      return { ...state, speakers: action.speakers };
    case constants.SET_WORD:
      return { ...state, speakers: action.speakers };
    case constants.SET_WORD_TRANSLATION:
      return { ...state, speakers: action.speakers };
    case constants.SET_SPEAKER_NAME:
      return { ...state, speakers: action.speakers };
    case constants.ADD_LETTER:
      return { ...state, speakers: action.speakers };
    case constants.REMOVE_LETTER:
      return { ...state, speakers: action.speakers };
    case constants.RESET_LETTERS:
      return { ...state, speakers: action.speakers };
    case constants.SET_LETTER_SYLLABLE:
      return { ...state, speakers: action.speakers };
    case constants.SET_LETTER_TIME:
      return { ...state, speakers: action.speakers };
    case constants.SET_WORD_TIME:
      return { ...state, speakers: action.speakers };
    case constants.MANUAL_PITCH_ADJUST:
      return { ...state, speakers: action.speakers };
    case constants.LINE_AND_DOT_COLOR:
        return { ...state, speakers: action.speakers };
    default:
      return state;
  }
};

export default reducer;
