import {roundToNearestNote} from "./PitchArtScale";

it("roundToNearestNote whole-tone scale", () => {
   expect(roundToNearestNote(439.0, 2)).toEqual(440.0);
});

it("roundToNearestNote eighth-tone scale", () => {
    expect(roundToNearestNote(439.0, 8)).toEqual(440.0);
    expect(roundToNearestNote(428, 8)).toBeCloseTo(427.47, 2);
});