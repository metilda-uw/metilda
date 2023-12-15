import {combineReducers, Reducer} from "redux";
import audioReducer from "../reducers/audio/reducer";
import {AudioAnalysisState} from "./audio/types";
import {pitchArtDetailsState} from './pitchArt/actionTypes'
import pitchArtDetailsReducer from '../reducers/pitchArt/pitchArtReducer';

export interface AppState {
    audio: AudioAnalysisState;
    pitchArtDetails: pitchArtDetailsState;
}

export const reducers: Reducer<AppState> = combineReducers<AppState>({
    audio: audioReducer,
    pitchArtDetails: pitchArtDetailsReducer
});
