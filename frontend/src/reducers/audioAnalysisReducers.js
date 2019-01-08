import {actions} from "../actions/audioAnalysisActions";

const defaultState = {
    timeline: {leftX: 1, rightX: 2}
};

export default (state = defaultState, action) => {
    switch (action.type) {
        case actions.AUDIO_SELECTION:
            return {
                timeline: action.timeline
            };
        default:
            return state;
    }
}