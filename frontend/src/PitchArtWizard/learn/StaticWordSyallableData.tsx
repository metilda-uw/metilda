import {MetildaWord} from "./types";

export default class StaticWordSyallableData {
    getData = (numSyllables: number, accentIndex: number): Array<MetildaWord> => {
        switch (numSyllables) {
            case 2:
                switch (accentIndex) {
                    case 0:
                        return WORDS.pitchArt21;
                    case 1:
                        return WORDS.pitchArt22;
                }
            case 3:
                switch (accentIndex) {
                    case 0:
                        return WORDS.pitchArt31;
                    case 1:
                        return WORDS.pitchArt32;
                    case 2:
                        return WORDS.pitchArt33;
                }
            case 4:
                switch (accentIndex) {
                    case 0:
                        return WORDS.pitchArt41;
                    case 1:
                        return WORDS.pitchArt42;
                    case 2:
                        return WORDS.pitchArt43;
                }
            default:
                return WORDS.pitchArt21;
        }
    };
}

interface WordLookup {
    pitchArt21: Array<MetildaWord>,
    pitchArt22: Array<MetildaWord>,
    pitchArt31: Array<MetildaWord>,
    pitchArt32: Array<MetildaWord>,
    pitchArt33: Array<MetildaWord>,
    pitchArt41: Array<MetildaWord>,
    pitchArt42: Array<MetildaWord>,
    pitchArt43: Array<MetildaWord>,
}

const WORDS: WordLookup = {
    pitchArt21: [
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
        }
    ],
    pitchArt22: [
        {
            text: "Aohkiwa",
            letters: [
                {
                    letter: "AOH",
                    t0: 1,
                    t1: 1.1,
                    pitch: 60.0,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    letter: "KIWA",
                    t0: 2,
                    t1: 2.3,
                    pitch: 90.0,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        }
    ],
    pitchArt31: [
        {
            text: "Aottakiwa",
            letters: [
                {
                    letter: "AOT",
                    t0: 1,
                    t1: 1.1,
                    pitch: 120.0,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    letter: "TAK",
                    t0: 2,
                    t1: 2.3,
                    pitch: 90.0,
                    isManualPitch: false,
                    isWordSep: false
                },
                                {
                    letter: "IWA",
                    t0: 3,
                    t1: 3.3,
                    pitch: 80.0,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        }
    ],
    pitchArt32: [],
    pitchArt33: [],
    pitchArt41: [],
    pitchArt42: [
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
        },
    ],
    pitchArt43: []
};