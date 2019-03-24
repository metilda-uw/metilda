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
        {
            "text": "PHEOP151 awakaasiwa.wav",
            "letters": [
                {
                    "letter": "A",
                    "t0": 0.475870033358618,
                    "t1": 0.6303939947172325,
                    "pitch": 101.10661309610012,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "WAK",
                    "t0": 0.6352228685096891,
                    "t1": 0.788137205270818,
                    "pitch": 98.62790131202878,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "AASIWA",
                    "t0": 0.8766665581325241,
                    "t1": 1.0746503836232488,
                    "pitch": 65.07054964843938,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                }
            ]
        }
    ],
    pitchArt32: [
        {
            "text": "EOP-RS-NC-makoyi.wav",
            "letters": [
                {
                    "letter": "MA",
                    "t0": 0.03625365429756595,
                    "t1": 0.18647402295731383,
                    "pitch": 84.38275517277124,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "KO",
                    "t0": 0.3159192342492243,
                    "t1": 0.45974724679579143,
                    "pitch": 105.28008985015153,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "YI",
                    "t0": 0.4709338699938578,
                    "t1": 0.717039580351317,
                    "pitch": 65.12509898086948,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                }
            ]
        }
    ],
    pitchArt33: [
        {
            "text": "PHEOP014 ponokawa.wav",
            "letters": [
                {
                    "letter": "PO",
                    "t0": 0.7033966597605494,
                    "t1": 0.8667995289725832,
                    "pitch": 90.4558843537849,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "NO",
                    "t0": 0.8731658745262987,
                    "t1": 1.0047370159697544,
                    "pitch": 87.51784567506309,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "KAWA",
                    "t0": 1.1278196966749228,
                    "t1": 1.3018331418098157,
                    "pitch": 98.22343675532215,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                }
            ]
        }
    ],
    pitchArt41: [
        {
            "text": "PHEOP163 nikso'kowaksi.wav",
            "letters": [
                {
                    "letter": "NIK",
                    "t0": 3.318991933619896,
                    "t1": 3.48215451749801,
                    "pitch": 103.9968955854266,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "SO",
                    "t0": 3.595369371617518,
                    "t1": 3.7785110473990744,
                    "pitch": 81.09938422857613,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "KO",
                    "t0": 3.9649825718312046,
                    "t1": 4.184752582769073,
                    "pitch": 74.39267052767232,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "WAKSI",
                    "t0": 4.174763036817351,
                    "t1": 4.45780017211612,
                    "pitch": 69.4276310793272,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                }
            ]
        }
    ],
    pitchArt42: [
        {
            "text": "EOP-AF-saahkomaapiwa_mono.wav",
            "letters": [
                {
                    "letter": "SAAH",
                    "t0": 0.5681797411724614,
                    "t1": 0.7073615563224249,
                    "pitch": 79.42285264855812,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "KO",
                    "t0": 0.9886865018383084,
                    "t1": 1.1752493604435787,
                    "pitch": 96.09724363584401,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "MAA",
                    "t0": 1.2137464582510153,
                    "t1": 1.4654582516073322,
                    "pitch": 69.85057161998193,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "PIWA",
                    "t0": 1.5957561211094258,
                    "t1": 1.755667142771086,
                    "pitch": 64.56488685272433,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                }
            ]
        }
    ],
    pitchArt43: [
        {
            "text": "PHEOP066 nottoana.wav",
            "letters": [
                {
                    "letter": "NOT",
                    "t0": 0.16198128823059565,
                    "t1": 0.28179239592252603,
                    "pitch": 97.28029198685712,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "TO",
                    "t0": 0.5347269566054901,
                    "t1": 0.6998000383143719,
                    "pitch": 99.36647391253892,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "AN",
                    "t0": 0.7104499145536546,
                    "t1": 0.8728605272027157,
                    "pitch": 99.02846973423681,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                },
                {
                    "letter": "A",
                    "t0": 0.9074726249803844,
                    "t1": 1.0938454591678315,
                    "pitch": 67.34023383638507,
                    "syllable": "X",
                    "isManualPitch": false,
                    "isWordSep": false
                }
            ]
        }
    ]
};