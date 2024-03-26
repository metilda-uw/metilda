import { Action } from "redux";
import * as constants from "../../constants";

export interface userDetailsState {
    currentUserRole:String
}

export interface setCurrentUserRole extends Action {
    type: constants.CURRENT_USER_ROLE;
    currentUserRole: String;
}

export type userDetailsAction =
  | setCurrentUserRole;