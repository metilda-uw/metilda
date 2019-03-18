export interface Letter {
    letter: string,
    leftX: number,
    rightX: number,
    t0: number,
    t1: number,
    pitch: number,
    syllable: string,
    isManualPitch: boolean,
    isWordSep: boolean
}

export interface PitchArtLetter extends Letter {
    startTime: number
}