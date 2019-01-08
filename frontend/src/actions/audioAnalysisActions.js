export const actions = {
    AUDIO_SELECTION: "AUDIO_SELECTION"
};

export const audioSelectionAction = (leftX, rightX) => dispatch => {
    dispatch({
        type: actions.AUDIO_SELECTION,
        timeline: {leftX: leftX, rightX: rightX}
    })
};