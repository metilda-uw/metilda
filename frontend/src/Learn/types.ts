import {Letter} from "../types/types";

export interface MetildaWord {
    uploadId: string;
    minPitch: number;
    maxPitch: number;
    letters: Letter[];
}
