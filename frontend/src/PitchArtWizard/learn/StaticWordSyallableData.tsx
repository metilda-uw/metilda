import {MetildaWord} from "./types";

export default class StaticWordSyallableData {
    getData = (numSyllables: number): Array<MetildaWord> => {
        switch(numSyllables) {
            case 2:
                return WORDS.twoSyllables;
            default:
                return WORDS.twoSyllables;
        }
    };
}

interface WordLookup {
    twoSyllables: Array<MetildaWord>
}

const WORDS: WordLookup = {
    twoSyllables: [
        {
            text: "Onni",
            letters: [
                {
                    letter: "ON",
                    t0: 1,
                    t1: 1.1,
                    pitch: 90.0,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    letter: "NI",
                    t0: 2,
                    t1: 2.3,
                    pitch: 70.0,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        },
        {
            text: "Isska",
            letters: [
                {
                    letter: "IS",
                    t0: 1,
                    t1: 1.1,
                    pitch: 90.0,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    letter: "SKA",
                    t0: 2,
                    t1: 2.3,
                    pitch: 60.0,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        },
        {
            text: "Kayiis",
            letters: [
                {
                    letter: "KAY",
                    t0: 1,
                    t1: 1.1,
                    pitch: 120.0,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    letter: "IIS",
                    t0: 2,
                    t1: 2.3,
                    pitch: 60.0,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        },
        {
            text: "Saaakohmappiwa",
            letters: [
                {
                    letter: "SAH",
                    t0: 0.5715557612244353,
                    t1: 0.5715557612244353,
                    pitch: 79.4,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    letter: "KOH",
                    t0: 1.011578934170736,
                    t1: 1.011578934170736,
                    pitch: 99.26,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    letter: "MAP",
                    t0: 1.2641848297510196,
                    t1: 1.2641848297510196,
                    pitch: 67.96,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    letter: "PI",
                    t0: 1.5982764980991369,
                    t1: 1.5982764980991369,
                    pitch: 65.64,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        }
    ]
};