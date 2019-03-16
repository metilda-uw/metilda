import audioReducuer from "../reducers/audio/reducer";
import {combineReducers, Reducer} from "redux";
import {AudioAnalysisState} from "./audio/types";
import thunk from "redux-thunk";

export interface AppState {
    audio: AudioAnalysisState
}

export const reducers: Reducer<AppState> = combineReducers<AppState>({
    audio: audioReducuer
});