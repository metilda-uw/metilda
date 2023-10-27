import update from "immutability-helper";
import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import * as constants from "../../constants";

import { AppState } from "../index";
import { PitchArtDetailsAction } from "./actionTypes";
import { AudioAction } from "../audio/types";

type ActionReturn = ThunkAction<void, AppState, void, AudioAction>;

export const setPitchArtDocId = (pitchArtDocId: string):
  ActionReturn => (dispatch: Dispatch) => {
    console.log("inside setPitchArtDocId");
    // const Id = pitchArtDocId;
    dispatch({
      type: constants.PITCHART_DOCUMENT_ID,
      pitchArtDocId: pitchArtDocId,
    });
};

export const setPitchArtCollectionId = (collectionId: string):
  ActionReturn => (dispatch: Dispatch) => {
    const Id = collectionId;
    dispatch({
      type: constants.PITCHART_COLLECTION_ID,
      collectionId: Id,
    });
};

// TODO :: write one action for listened documents

