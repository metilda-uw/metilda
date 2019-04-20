import {Reducer, Store} from "redux";
import * as constants from "../../constants";
import {AudioAnalysisState} from "../../store/audio/types";

const defaultState: AudioAnalysisState = {
    speakers: [{uploadId: "", letters: []}]
};

const reducer: Reducer<AudioAnalysisState> = (state: AudioAnalysisState = defaultState, action) => {
    switch (action.type) {
        case constants.ADD_SPEAKER:
            return {...state, speakers: action.speakers};
        case constants.REMOVE_SPEAKER:
            return {...state, speakers: action.speakers};
        case constants.SET_UPLOAD_ID:
            return {...state, speakers: action.speakers};
        case constants.ADD_LETTER:
            return {...state, speakers: action.speakers};
        case constants.REMOVE_LETTER:
            return {...state, speakers: action.speakers};
        case constants.RESET_LETTERS:
            return {...state, speakers: action.speakers};
        case constants.SET_SPEAKER:
            return {...state, speakers: action.speakers};
        case constants.SET_LETTER_SYLLABLE:
            return {...state, speakers: action.speakers};
        case constants.MANUAL_PITCH_ADJUST:
            return {...state, speakers: action.speakers};
        default:
            return state;
    }
};

export default reducer;
