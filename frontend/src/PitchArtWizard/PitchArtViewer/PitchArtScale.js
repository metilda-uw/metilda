exports.roundToNearestNote = function(pitch, scaleDivisions=8.0) {
    // Scale divisions determines how the scale is divided. Examples:
    // - 2 makes all notes round to the nearest whole tone
    // - 4 makes all notes round to the nearest quarter tone
    // - 8 makes all notes round to the nearest eighth tone
    let referenceNote = 440.0;
    let scaleBase = Math.pow(2, 1 / (12.0 * scaleDivisions / 2.0));
    let nearestTonePitchExp = Math.round(Math.log(pitch / referenceNote) / Math.log(scaleBase));
    return referenceNote * Math.pow(scaleBase, nearestTonePitchExp);
};

exports.referenceExponent = function(pitch, scaleDivisions=8.0) {
    // Scale divisions determines how the scale is divided. Examples:
    // - 2 makes all notes round to the nearest whole tone
    // - 4 makes all notes round to the nearest quarter tone
    // - 8 makes all notes round to the nearest eighth tone
    let referenceNote = 440.0;
    let scaleBase = Math.pow(2, 1 / (12.0 * scaleDivisions / 2.0));
    return Math.round(Math.log(pitch / referenceNote) / Math.log(scaleBase));
};

exports.exponentToNote = function(exponent, scaleDivisions=8.0) {
    // Scale divisions determines how the scale is divided. Examples:
    // - 2 makes all notes round to the nearest whole tone
    // - 4 makes all notes round to the nearest quarter tone
    // - 8 makes all notes round to the nearest eighth tone
    let referenceNote = 440.0;
    let scaleBase = Math.pow(2, 1 / (12.0 * scaleDivisions / 2.0));
    return referenceNote * Math.pow(scaleBase, exponent);
};