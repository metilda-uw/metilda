import {actions} from "../actions/audioAnalysisActions";

const defaultState = {
    activeLetterIndex: -1,
    letters: [],
    timeline: {leftX: -1, rightX: -1}
};

let letterAction = (state, action) => Object.assign({}, state, {
    letters: action.letters
});

export default (state = defaultState, action) => {
    switch (action.type) {
        case actions.AUDIO_SELECTION:
            return {
                timeline: action.timeline
            };
        case actions.ADD_LETTER:
            return letterAction(state, action);
        case actions.REMOVE_LETTER:
            return letterAction(state, action);
        case actions.RESET_LETTERS:
            return letterAction(state, action);
        case actions.SET_LETTER_SYLLABLE:
            return letterAction(state, action);
        default:
            return state;
    }
}