import { Reducer, Store } from "redux";
import * as constants from "../../constants";
import {pitchArtDetailsState } from "../../store/pitchArt/actionTypes";

/*
pitchArtDetailsState - Is a interface to define properties that
being stored in state.
defaultState - defines a initial state for pitchArtDetailsState
*/ 
const defaultState: pitchArtDetailsState = {
  pitchArtDocId:null,
  collectionId:null,
  listenedDocuments:[],
  parentPitchArtDocumentData:null,
  currentPitchArtDocumentData:null,
  currentPitchArtVersions:[]
};

/**
 * pitchArtDetailsReducer - that handles state for pitchArtDetailsState
 * @param state current state of pitchArtDetailsState
 * @param action action that needs to be performed
 * @returns new state
 */
const pitchArtDetailsReducer: Reducer<pitchArtDetailsState> = (
  state: pitchArtDetailsState = defaultState,
  action
) => {
  switch (action.type) {
    case constants.PITCHART_DOCUMENT_ID:
        return { ...state, pitchArtDocId: action.pitchArtDocId };
    case constants.PITCHART_COLLECTION_ID:
        return { ...state, collectionId: action.collectionId };
    case constants.LISTENED_DOCUMENT_IDS:
        return { ...state, listenedDocuments: action.listenedDocuments };
    case constants.PARENT_PITCHART_DOCUMENT_DATA:
        return {...state, parentPitchArtDocumentData: action.parentPitchArtDocumentData}
    case constants.CURRENT_PITCHART_DOCUMENT_DATA:
      return {...state, currentPitchArtDocumentData: action.currentPitchArtDocumentData}
    case constants.CURRENT_PITCHART_VERSIONS:
      return {...state, currentPitchArtVersions: action.currentPitchArtVersions}
    case constants.UPDATE_MULTIPLE_FIELDS:
      return {...state, ...action.payload}
    default:
        return state;
  }
};

export default pitchArtDetailsReducer;
