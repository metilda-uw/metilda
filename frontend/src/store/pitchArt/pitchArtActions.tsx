import update from "immutability-helper";
import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import * as constants from "../../constants";

import { AppState } from "../index";
import { PitchArtDetailsAction } from "./actionTypes";
import { AudioAction } from "../audio/types";
import { AppActions } from "../appActions";

type ActionReturn = ThunkAction<void, AppState, void, AppActions>;

export const setPitchArtDocId = (pitchArtDocId: string):
  ActionReturn => (dispatch: Dispatch) => {
    // console.log("inside setPitchArtDocId");
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

export const setParentPitchArtDocumentData = (data:any):
ActionReturn => (dispatch: Dispatch) => {
  dispatch({
    type: constants.PARENT_PITCHART_DOCUMENT_DATA,
    parentPitchArtDocumentData: data,
  });
};

export const setCurrentPitchArtDocumentData = (data:any):
ActionReturn => (dispatch: Dispatch) => {
  dispatch({
    type: constants.CURRENT_PITCHART_DOCUMENT_DATA,
    currentPitchArtDocumentData: data,
  });
};

export const setCurrentPitchArtVersions = (data:any):
ActionReturn => (dispatch: Dispatch) => {
  dispatch({
    type: constants.CURRENT_PITCHART_VERSIONS,
    currentPitchArtVersions: data,
  });
};

export const updatePitchArtDetails = (data:any):
ActionReturn => (dispatch: Dispatch) => {
  dispatch({
    type: constants.UPDATE_MULTIPLE_FIELDS,
    payload: data,
  });
};

export const setListenedDocuments = (data:any):
ActionReturn => (dispatch: Dispatch) => {
  dispatch({
    type: constants.LISTENED_DOCUMENT_IDS,
    listenedDocuments: data,
  });
};

