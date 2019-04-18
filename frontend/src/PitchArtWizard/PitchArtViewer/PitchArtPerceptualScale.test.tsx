import {expect} from "chai";
import * as React from "react";
import PitchArtPerceptualScale from "./PitchArtPerceptualScale";

describe("PitchArtPerceptualScale", () => {
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
            const subject = new PitchArtPerceptualScale(
                config,
                [{t0: 1, t1: 2, pitch: 42}, {t0: 3, t1: 4, pitch: 42}],
                true);
            expect(subject.horzIndexToRectCoords(1)).to.equal(10);
        });
    });

    it("vertValueRange should create values within the expected range", () => {
        const config = {
            innerHeight: 100,
            innerWidth: 200,
            y0: 5,
            x0: 10,
            dMin: 1,
            dMax: 10
        };

        const subject = new PitchArtPerceptualScale(
            config,
            [{t0: 1, t1: 2, pitch: 42}, {t0: 3, t1: 4, pitch: 42}],
            true);

        const expectedValues = [349.23, 369.99, 392, 415.3, 440.0];
        const actualValues = subject.vertValueRange(350, 441, 4);
        expect(actualValues).to.have.lengthOf(expectedValues.length);
        actualValues.forEach((item, index) => {
           expect(item).to.be.closeTo(expectedValues[index], 0.05);
        });
    });
});
