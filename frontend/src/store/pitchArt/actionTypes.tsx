import { Action } from "redux";
import * as constants from "../../constants";

export interface pitchArtDetailsState {
  pitchArtDocId:String,
  collectionId:String,
  listenedDocuments:String[]
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


export type PitchArtDetailsAction =
  | setPitchArtDocId
  | setPitchArtCollectionId
  | setListenedDocuments;
