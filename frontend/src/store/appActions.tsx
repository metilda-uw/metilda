import { AudioAction } from "./audio/types";
import { PitchArtDetailsAction } from "./pitchArt/actionTypes";
import { userDetailsAction } from "./userDetails/types";

export type AppActions = AudioAction | PitchArtDetailsAction | userDetailsAction;