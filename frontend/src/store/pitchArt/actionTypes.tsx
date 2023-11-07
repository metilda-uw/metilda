import { Action } from "redux";
import * as constants from "../../constants";

export interface pitchArtDetailsState {
  pitchArtDocId:String,
  collectionId:String,
  listenedDocuments:String[]
  parentPitchArtDocumentData:any
  currentPitchArtDocumentData:any
  currentPitchArtVersions:[]
}

export interface setPitchArtDocId extends Action {
  type: constants.PITCHART_DOCUMENT_ID;
  pitchArtDocId: String;
}

export interface setPitchArtCollectionId extends Action {
  type: constants.PITCHART_COLLECTION_ID;
  collectionId:String,
}

export interface setListenedDocuments extends Action {
    type: constants.LISTENED_DOCUMENT_IDS
    listenedDocuments:String[],
}

export interface setParentPitchArtDocumentData extends Action{
  type: constants.PARENT_PITCHART_DOCUMENT_DATA
  parentPitchArtDocumentData:any,
}

export interface setCurrentPitchArtDocumentData extends Action{
  type: constants.CURRENT_PITCHART_DOCUMENT_DATA
  currentPitchArtDocumentData:any,
}

export interface setCurrentPitchArtVersions extends Action{
  type: constants.CURRENT_PITCHART_VERSIONS
  currentPitchArtVersions:[],
}


export type PitchArtDetailsAction =
  | setPitchArtDocId
  | setPitchArtCollectionId
  | setListenedDocuments
  | setParentPitchArtDocumentData
  | setCurrentPitchArtDocumentData
  | setCurrentPitchArtVersions;
