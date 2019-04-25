const REFERENCE_NOTE = 440.0;

export const roundToNearestNote = function(pitch, scaleDivisions=8.0) {
    let nearestTonePitchExp = referenceExponent(pitch, scaleDivisions);
    return exponentToNote(nearestTonePitchExp, scaleDivisions);
};

export const referenceExponent = function(pitch, scaleDivisions=8.0) {
    return Math.round(exponentScalar(scaleDivisions) * Math.log2(pitch / REFERENCE_NOTE));
};

export const exponentToNote = function(exponent, scaleDivisions=8.0) {
    let scaleBase = Math.pow(2, 1 / exponentScalar(scaleDivisions));
    return REFERENCE_NOTE * Math.pow(scaleBase, exponent);
};

const exponentScalar = function(scaleDivisions) {
    // Scale divisions determines how the scale is divided. Examples:
    // - 2 makes all notes round to the nearest whole tone
    // - 4 makes all notes round to the nearest quarter tone
    // - 8 makes all notes round to the nearest eighth tone
    return 12.0 * scaleDivisions / 2.0;
};