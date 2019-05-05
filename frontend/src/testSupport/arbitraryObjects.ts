import {Letter, Speaker} from "../types/types";

export const arbitraryLetter = (): Letter => {
    return {
        t0: 0,
        t1: 0,
        pitch: 0,
        syllable: "",
        isManualPitch: false,
        isWordSep: false
    };
};

export const arbitrarySpeaker = (): Speaker => {
    return {
        uploadId: "",
        letters: []
    };
};
