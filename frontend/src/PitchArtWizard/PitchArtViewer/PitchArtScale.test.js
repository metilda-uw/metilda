import {roundToNearestNote,
        referenceExponent} from "./PitchArtScale";

it("roundToNearestNote whole-tone scale", () => {
   expect(roundToNearestNote(439.0, 2)).toEqual(440.0);
});

it("roundToNearestNote eighth-tone scale", () => {
    expect(roundToNearestNote(439.0, 8)).toEqual(440.0);
    expect(roundToNearestNote(428, 8)).toBeCloseTo(427.47, 2);
});

it("referenceExponent whole-tone scale", () => {
    expect(referenceExponent(392.00, 2)).toEqual(-2);
    expect(referenceExponent(440.0, 2)).toEqual(0);
    expect(referenceExponent(493.88, 2)).toEqual(2);
});

it("referenceExponent eighth-tone scale", () => {
    expect(referenceExponent(392.00, 8)).toEqual(-8);
    expect(referenceExponent(440.0, 8)).toEqual(0);
    expect(referenceExponent(493.88, 8)).toEqual(8);
});