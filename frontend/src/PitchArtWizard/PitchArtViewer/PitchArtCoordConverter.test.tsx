import {expect} from "chai";
import * as React from "react";
import PitchArtCoordConverter from "./PitchArtCoordConverter";

describe("PitchArtCoordConverter", () => {
    describe("horzIndexToRectCoords", () => {
        it("GIVEN a time scale EXPECT coordinates are evenly distributed", () => {
            const config = {
                innerHeight: 100,
                innerWidth: 200,
                y0: 5,
                x0: 10,
                dMin: 1,
                dMax: 10
            };
            const subject = new PitchArtCoordConverter(
                config,
                [{t0: 1, t1: 2, pitch: 42}, {t0: 3, t1: 4, pitch: 42}],
                true);
            expect(subject.horzIndexToRectCoords(1)).to.equal(10);
            // TODO: more tests
        });
    });
});
