import { Reducer, Store } from "redux";
import * as constants from "../../constants";
import { userDetailsState } from "../../store/userDetails/types";

/*
pitchArtDetailsState - Is a interface to define properties that
being stored in state.
defaultState - defines a initial state for pitchArtDetailsState
*/ 
const defaultState: userDetailsState = {
  currentUserRole:null
};

/**
 * pitchArtDetailsReducer - that handles state for pitchArtDetailsState
 * @param state current state of pitchArtDetailsState
 * @param action action that needs to be performed
 * @returns new state
 */
const userDetailsReducer: Reducer<userDetailsState> = (
  state: userDetailsState = defaultState,
  action
) => {
  switch (action.type) {
    case constants.CURRENT_USER_ROLE:
        return { ...state, currentUserRole: action.currentUserRole };
    default:
        return state;
  }
};

export default userDetailsReducer;
