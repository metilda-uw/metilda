import update from "immutability-helper";
import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import * as constants from "../../constants";

import { AppState } from "../index";
import { AppActions } from "../appActions";

type ActionReturn = ThunkAction<void, AppState, void, AppActions>;

export const setCurrentUserRole = (currentUserRole: string):
  ActionReturn => (dispatch: Dispatch) => {
    dispatch({
      type: constants.CURRENT_USER_ROLE,
      currentUserRole: currentUserRole,
    });
};