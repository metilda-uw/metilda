import {combineReducers, Reducer} from "redux";
import audioReducer from "../reducers/audio/reducer";
import {AudioAnalysisState} from "./audio/types";
import {pitchArtDetailsState} from './pitchArt/actionTypes'
import pitchArtDetailsReducer from '../reducers/pitchArt/pitchArtReducer';
import { userDetailsState } from "./userDetails/types";
import userDetailsReducer from "../reducers/userDetails/userDetailsReducer";

export interface AppState {
    audio: AudioAnalysisState;
    pitchArtDetails: pitchArtDetailsState;
    userDetails: userDetailsState
}

export const reducers: Reducer<AppState> = combineReducers<AppState>({
    audio: audioReducer,
    pitchArtDetails: pitchArtDetailsReducer,
    userDetails:userDetailsReducer
});
