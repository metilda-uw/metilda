import {combineReducers, Reducer} from "redux";
import audioReducuer from "../reducers/audio/reducer";
import {AudioAnalysisState} from "./audio/types";

export interface AppState {
    audio: AudioAnalysisState;
}

export const reducers: Reducer<AppState> = combineReducers<AppState>({
    audio: audioReducuer,
});
