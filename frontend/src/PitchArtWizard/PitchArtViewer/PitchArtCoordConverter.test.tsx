import {expect} from "chai";
import * as React from "react";
import sinon, {SinonSandbox, SinonStub} from "sinon";
import PitchArtCoordConverter from "./PitchArtCoordConverter";
import * as scaleFunctions from "./PitchArtScale";
import {PitchArtWindowConfig, RawPitchValue} from "./types";

describe("PitchArtCoordConverter", () => {
    describe("perceptual scale is true", () => {
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
                    true,
                    false,
                    true);
                expect(subject.horzIndexToRectCoords(1)).to.equal(10);
            });
        });

        describe("vertValueToRectCoords", () => {
            const screenCoord = (wConfig: PitchArtWindowConfig, value: number) =>
                wConfig.innerHeight - value + wConfig.y0;

            let windowConfig: PitchArtWindowConfig;
            let pitchValues: RawPitchValue[];
            let sinonSandbox: SinonSandbox;

            beforeEach(() => {
                sinonSandbox = sinon.createSandbox();

                windowConfig = {
                    innerHeight: 100,
                    innerWidth: 200,
                    y0: 5,
                    x0: 10,
                    dMin: 0,
                    dMax: 500
                };

                pitchValues = [
                    {t0: 1, t1: 2, pitch: 100},
                    {t0: 3, t1: 4, pitch: 200}
                ];

                const mockRefExponent = sinonSandbox.stub(scaleFunctions, "referenceExponent");
                mockRefExponent.returnsArg(0);
            });

            afterEach(() => {
                sinonSandbox.restore();
            });

            it("without vertical centering", () => {
                const subject = new PitchArtCoordConverter(
                    windowConfig,
                    pitchValues,
                    false,
                    false,
                    true);

                expect(subject.vertValueToRectCoords(pitchValues[0].pitch)).to.be.closeTo(
                    screenCoord(windowConfig, 20),
                    0.01
                );

                expect(subject.vertValueToRectCoords(pitchValues[1].pitch)).to.be.closeTo(
                    screenCoord(windowConfig, 40),
                    0.01
                );
            });

            it("with vertical centering", () => {
                const subject = new PitchArtCoordConverter(
                    windowConfig,
                    pitchValues,
                    true,
                    false,
                    true);

                expect(subject.vertValueToRectCoords(pitchValues[0].pitch)).to.be.closeTo(
                    screenCoord(windowConfig, 40),
                    0.01
                );

                expect(subject.vertValueToRectCoords(pitchValues[1].pitch)).to.be.closeTo(
                    screenCoord(windowConfig, 60),
                    0.01
                );
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

            const subject = new PitchArtCoordConverter(
                config,
                [{t0: 1, t1: 2, pitch: 42}, {t0: 3, t1: 4, pitch: 42}],
                false,
                false,
                true);

            const expectedValues = [349.23, 369.99, 392, 415.3, 440.0];
            const actualValues = subject.vertValueRange(350, 441, 4);

            expect(actualValues).to.have.lengthOf(expectedValues.length);
            actualValues.forEach((item, index) => {
                expect(item).to.be.closeTo(expectedValues[index], 0.01);
            });
        });
    });
});