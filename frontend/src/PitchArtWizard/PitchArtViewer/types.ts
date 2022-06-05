export interface RawPitchValue {
    t0: number;
    t1: number;
    pitch: number;
}

export interface PitchArtWindowConfig {
    innerHeight: number;
    innerWidth: number;
    y0: number;     // the initial y-value where data is plotted at
    x0: number;     // the initial x-value where data is plotted at
    dMin: number;   // the initial value of the domain data
    dMax: number;   // the final value of the domain data
    tMin: number;   // the minimum value of the time domain
    tMax: number;   // the maximum value of the time domain
}

export interface PitchRangeDTO {
    pitches: number[][];
}
