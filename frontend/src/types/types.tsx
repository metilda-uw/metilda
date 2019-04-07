export interface Letter {
    t0: number;
    t1: number;
    pitch: number;
    syllable: string;
    isManualPitch: boolean;
    isWordSep: boolean;
}

export interface Speaker {
    uploadId: string;
    letters: Letter[];
}
