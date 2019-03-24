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
            "text": "PHEOP019 onni.wav",
            "letters": [
                {
                    "letter": "ON",
                    "t0": 0.5703882232235339,
                    "t1": 0.7036232238391321,
                    "pitch": 106.1081048153841,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "NI",
                    "t0": 0.70243362561935,
                    "t1": 0.9915059930264069,
                    "pitch": 90.95704281719073,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                }
            ]
        },
        {
            "text": "PHEOP011 isska.wav",
            "letters": [
                {
                    "letter": "ISS",
                    "t0": 0.4749116999992116,
                    "t1": 0.6468954553263592,
                    "pitch": 114.53712084993575,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "KA",
                    "t0": 0.9550330169541649,
                    "t1": 1.2130086499448858,
                    "pitch": 77.26587110531462,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                }
            ]
        }
    ],
    pitchArt22: [
        {
            "text": "PHEOP002 aakiiwa.wav",
            "letters": [
                {
                    "letter": "AAK",
                    "t0": 4.6757559811288205,
                    "t1": 5.024208672770138,
                    "pitch": 72.34960285118446,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "IIWA",
                    "t0": 5.211472364196425,
                    "t1": 5.517257379310235,
                    "pitch": 80.20179997985323,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                }
            ]
        }
    ],
    pitchArt31: [

    ],
    pitchArt32: [],
    pitchArt33: [],
    pitchArt41: [],
    pitchArt42: [],
    pitchArt43: []
};