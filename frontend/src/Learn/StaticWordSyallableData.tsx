import {MetildaWord} from "./types";

export default class StaticWordSyallableData {
    // @ts-ignore
    getData = (numSyllables: number, accentIndex: number): MetildaWord[] => {
        switch (numSyllables) {
            case 2:
                switch (accentIndex) {
                    case 0:
                        return WORDS.pitchArt21;
                    case 1:
                        return WORDS.pitchArt22;
                }
                break;
            case 3:
                switch (accentIndex) {
                    case 0:
                        return WORDS.pitchArt31;
                    case 1:
                        return WORDS.pitchArt32;
                    case 2:
                        return WORDS.pitchArt33;
                }
                break;
            case 4:
                switch (accentIndex) {
                    case 0:
                        return WORDS.pitchArt41;
                    case 1:
                        return WORDS.pitchArt42;
                    case 2:
                        return WORDS.pitchArt43;
                }
                break;
            default:
                return WORDS.pitchArt21;
        }
    }
}

interface WordLookup {
    pitchArt21: MetildaWord[];
    pitchArt22: MetildaWord[];
    pitchArt31: MetildaWord[];
    pitchArt32: MetildaWord[];
    pitchArt33: MetildaWord[];
    pitchArt41: MetildaWord[];
    pitchArt42: MetildaWord[];
    pitchArt43: MetildaWord[];
}

const WORDS: WordLookup = {
    pitchArt21: [
        {
            uploadId: "PHEOP019 onni.wav",
            minPitch: 90,
            maxPitch: 105,
            letters: [
                {
                    syllable: "ON",
                    t0: 2.28,
                    t1: 2.46,
                    pitch: 103.6768220610205,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "NI",
                    t0: 2.28,
                    t1: 2.64,
                    pitch: 92.82383449939886,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        },
        {
            uploadId: "PHEOP011 isska.wav",
            minPitch: 70,
            maxPitch: 120,
            letters: [
                {
                    syllable: "ISS",
                    t0: 0.44,
                    t1: 0.86,
                    pitch: 114.53712084822074,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "KA",
                    t0: 0.93,
                    t1: 1.15,
                    pitch: 77.26587110530951,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        }
    ],
    pitchArt22: [
        {
            uploadId: "PHEOP002 aakiiwa.wav",
            minPitch: 50,
            maxPitch: 500,
            letters: [
                {
                    syllable: "AAK",
                    t0: 0.41,
                    t1: 0.81,
                    pitch: 90.68466546864435,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "IIWA",
                    t0: 0.81,
                    t1: 1.17,
                    pitch: 175.1823883731017,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        }
    ],
    pitchArt31: [
        {
            uploadId: "PHEOP151 awakaasiwa.wav",
            minPitch: 85,
            maxPitch: 115,
            letters: [
                {
                    syllable: "A",
                    t0: 0,
                    t1: 0.54,
                    pitch: 105.57222520987281,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "WAK",
                    t0: 0.54,
                    t1: 0.7,
                    pitch: 99.21264292740709,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "AASIWA",
                    t0: 0.7,
                    t1: 1.42,
                    pitch: 94.6409184237842,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        }
    ],
    pitchArt32: [
        {
            uploadId: "EOP-RS-NC-makoyi.wav",
            minPitch: 100,
            maxPitch: 165,
            letters: [
                {
                    syllable: "MA",
                    t0: 0.88,
                    t1: 1.29,
                    pitch: 123.40625662541245,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "KO",
                    t0: 1.28,
                    t1: 1.51,
                    pitch: 154.8095303666799,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "YI",
                    t0: 1.49,
                    t1: 1.74,
                    pitch: 109.98694917255786,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        }
    ],
    pitchArt33: [
        {
            uploadId: "PHEOP014 ponokawa.wav",
            minPitch: 75,
            maxPitch: 110,
            letters: [
                {
                    syllable: "PO",
                    t0: 0.68,
                    t1: 0.84,
                    pitch: 90.17102774825014,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "NO",
                    t0: 0.84,
                    t1: 1.09,
                    pitch: 87.74878123206575,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "KAWA",
                    t0: 1.09,
                    t1: 1.3,
                    pitch: 98.75241226770078,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        }
    ],
    pitchArt41: [
        {
            uploadId: "PHEOP163 nikso'kowaksi.wav",
            minPitch: 70,
            maxPitch: 120,
            letters: [
                {
                    syllable: "NIK",
                    t0: 0.87,
                    t1: 0.97,
                    pitch: 111.19976398286593,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "SO",
                    t0: 0.97,
                    t1: 1.14,
                    pitch: 103.95624057155192,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "KO",
                    t0: 1.14,
                    t1: 1.2,
                    pitch: 86.2687918527912,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "WAKSI",
                    t0: 1.2,
                    t1: 1.45,
                    pitch: 79.68972773407367,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        }
    ],
    pitchArt42: [
        {
            uploadId: "EOP-AF-saahkomaapiwa_mono.wav",
            minPitch: 65,
            maxPitch: 250,
            letters: [
                {
                    syllable: "SAAH",
                    t0: 0.37,
                    t1: 0.82,
                    pitch: 124.8134575933624,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "KO",
                    t0: 0.82,
                    t1: 1.08,
                    pitch: 244.0563211173035,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "MAA",
                    t0: 1.08,
                    t1: 1.2,
                    pitch: 88.6713720906401,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "PIWA",
                    t0: 1.2,
                    t1: 1.73,
                    pitch: 78.88766614778135,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        }
    ],
    pitchArt43: [
        {
            uploadId: "PHEOP066 nottoana.wav",
            minPitch: 75,
            maxPitch: 110,
            letters: [
                {
                    syllable: "NOT",
                    t0: 2.19,
                    t1: 2.47,
                    pitch: 87.06193281873325,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "TO",
                    t0: 2.47,
                    t1: 2.76,
                    pitch: 93.17458507819406,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "AN",
                    t0: 2.77,
                    t1: 2.88,
                    pitch: 98.06507889644391,
                    isManualPitch: false,
                    isWordSep: false
                },
                {
                    syllable: "A",
                    t0: 2.88,
                    t1: 3.2,
                    pitch: 87.59215187153842,
                    isManualPitch: false,
                    isWordSep: false
                }
            ]
        }
    ]
};
