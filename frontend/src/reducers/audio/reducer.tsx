import {Reducer, Store} from "redux";
import * as constants from "../../constants";
import {AudioAnalysisState} from "../../store/audio/types";

const defaultState: AudioAnalysisState = {
    letters: []
};


const reducer: Reducer<AudioAnalysisState> = (state: AudioAnalysisState = defaultState, action) =>{
    switch (action.type) {
        case constants.ADD_LETTER:
            return {...state, letters: action.letters};
        case constants.REMOVE_LETTER:
            return {...state, letters: action.letters};
        case constants.RESET_LETTERS:
            return {...state, letters: action.letters};
        case constants.SET_LETTER_SYLLABLE:
            return {...state, letters: action.letters};
        case constants.MANUAL_PITCH_ADJUST:
            return {...state, letters: action.letters};
        default:
            return state;
    }
}

export default reducer;