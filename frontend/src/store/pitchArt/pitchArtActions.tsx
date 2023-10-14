import update from "immutability-helper";
import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import * as constants from "../../constants";

import { AppState } from "../index";
import { PitchArtDetailsAction } from "./actionTypes";

type ActionReturn = ThunkAction<void, AppState, void, PitchArtDetailsAction>;

export const setPitchArtDocId = (pitchArtDocId: String):
  ActionReturn => (dispatch: Dispatch) => {
    const Id = pitchArtDocId;
    dispatch({
      type: constants.PITCHART_DOCUMENT_ID,
      pitchArtDocId: Id,
    });
};

export const setPitchArtCollectionId = (collectionId: String):
  ActionReturn => (dispatch: Dispatch) => {
    const Id = collectionId;
    dispatch({
      type: constants.PITCHART_COLLECTION_ID,
      collectionId: Id,
    });
};

// TODO :: write one action for listened documents

