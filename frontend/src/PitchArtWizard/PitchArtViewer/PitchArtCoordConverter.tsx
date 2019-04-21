import {scaleLinear} from "d3-scale";
import {exponentToNote, referenceExponent, roundToNearestNote} from "./PitchArtScale";
import {PitchArtWindowConfig, RawPitchValue} from "./types";

class PitchArtCoordConverter {
    private config: PitchArtWindowConfig;
    private readonly pitchValues: RawPitchValue[];
    private readonly vertOffset: number;
    private readonly isTimeNormalized: boolean;
    private readonly isPerceptualScale: boolean;

    constructor(config: PitchArtWindowConfig,
                pitchValues: RawPitchValue[],
                isVerticallyCentered: boolean,
                isTimeNormalized: boolean,
                isPerceptualScale: boolean) {
        this.config = config;
        this.pitchValues = pitchValues;
        this.vertOffset = 0.0;
        this.isTimeNormalized = isTimeNormalized || false;
        this.isPerceptualScale = isPerceptualScale || false;

        if (isVerticallyCentered && pitchValues) {
            this.vertOffset = this.centerOffset(
                pitchValues.map((item) => this.vertValueToRectCoords(item.pitch))
            );
        }
    }

    horzIndexToRectCoords(time: number) {
        if (!this.pitchValues) {
            throw new Error("Unsupported operation, pitchValues is not provided");
        }

        let timePerc;

        if (this.pitchValues.length <= 1) {
            timePerc = 0.0;
        } else if (this.isTimeNormalized) {
            const timeIndex = this.pitchValues.map((item) => item.t0).indexOf(time);
            timePerc = timeIndex / (this.pitchValues.length - 1);
        } else {
            const totalDuration = this.pitchValues[this.pitchValues.length - 1].t0 - this.pitchValues[0].t0;
            timePerc = (time - this.pitchValues[0].t0) / totalDuration;
        }

        const pointDx = timePerc * this.config.innerWidth;
        return this.config.x0 + pointDx;
    }

    vertValueToRectCoords(pitch: number): number {
        if (this.isPerceptualScale) {
            return this.perceptualVertValueToRectCoords(pitch);
        } else {
           return this.linearVertValueToRectCoords(pitch);
        }
    }

    rectCoordsToVertValue(rectCoord: number): number {
        if (this.isPerceptualScale) {
            return this.perceptualRectCoordsToVertValue(rectCoord);
        } else {
            return this.linearRectCoordsToVertValue(rectCoord);
        }
    }

    vertValueRange(minValue: number, maxValue: number, numSteps?: number): number[] {
        if (this.isPerceptualScale) {
            return this.perceptualVertValueRange(minValue, maxValue, numSteps);
        } else {
            return this.linearVertValueRange(minValue, maxValue, numSteps);
        }
    }

    private linearVertValueToRectCoords(pitch: number): number {
        const scale = scaleLinear().domain([this.config.dMin, this.config.dMax])
                                   .range([this.config.innerHeight + this.config.y0, this.config.y0]);
        return scale(pitch) - this.vertOffset;
    }

    private perceptualVertValueToRectCoords(pitch: number) {
        const refExp = referenceExponent(pitch);
        const pitchIntervalSteps = referenceExponent(this.config.dMax) - referenceExponent(this.config.dMin);
        const valuePerc = (refExp - referenceExponent(this.config.dMin)) / pitchIntervalSteps;
        const rectHeight = this.config.innerHeight * valuePerc;
        return this.config.innerHeight - rectHeight + this.config.y0 - this.vertOffset;
    }

    private linearRectCoordsToVertValue(rectCoord: number): number {
        const scale = scaleLinear().domain([this.config.dMin, this.config.dMax])
                                   .range([this.config.innerHeight, this.config.y0]);
        return scale.invert(rectCoord);
    }

    private perceptualRectCoordsToVertValue(rectCoord: number) {
        let rectCoordPerc = (rectCoord - this.config.y0) / (this.config.innerHeight - this.config.y0);
        rectCoordPerc = Math.min(rectCoordPerc, 1.0);
        rectCoordPerc = Math.max(rectCoordPerc, 0.0);
        rectCoordPerc = 1.0 - rectCoordPerc; // invert so 0.0 is lowest frequency and 1.0 is highest frequency

        // Convert the rectangular coordinate to the appropriate "step" along the perceptual scale
        const pitchIntervalSteps = referenceExponent(this.config.dMax) - referenceExponent(this.config.dMin);
        const rectCoordStepOffset = Math.round(pitchIntervalSteps * rectCoordPerc);
        const rectCoordPitch = exponentToNote(referenceExponent(this.config.dMin) + rectCoordStepOffset);
        return rectCoordPitch;
    }

    private linearVertValueRange(minValue: number, maxValue: number, numSteps?: number): number[] {
        let numTickMarks: number;
        const dStep = maxValue - minValue;

        if (!numSteps) {
            if (dStep / 10.0 > 2.0) {
                numTickMarks = 10;
            } else if (dStep > 10) {
                numTickMarks = 4;
            } else {
                numTickMarks = 1;
            }
        } else {
            numTickMarks  = dStep / numSteps;
        }

        const scale = scaleLinear().domain([this.config.dMin, this.config.dMax])
                                   .range([this.config.innerHeight + this.config.y0, this.config.y0]);

        return scale.ticks(numTickMarks);
    }

    private perceptualVertValueRange(minValue: number, maxValue: number, numSteps?: number): number[] {
        const minExponent = referenceExponent(minValue);
        const maxExponent = referenceExponent(maxValue);

        let exponentStep: number;

        if (!numSteps) {
            const dStep = maxExponent - minExponent;

            if (dStep / 10.0 > 2.0) {
                numSteps = 10;
                exponentStep = Math.round((maxExponent - minExponent) / numSteps);
            } else if (dStep > 10) {
                exponentStep = 4;
            } else {
                exponentStep = 1;
            }
        } else {
            exponentStep  = (maxExponent - minExponent) / numSteps;
        }

        const exponents = [];

        let currExponent: number = minExponent;
        while (currExponent <= maxExponent) {
            exponents.push(currExponent);
            currExponent += exponentStep;
        }

        return exponents.map((value) => exponentToNote(value));
    }

    private centerOffset(pitches: number[]) {
        if (pitches.length < 1) {
            return 0.0;
        }

        const figureHeight = Math.max(...pitches) - Math.min(...pitches);
        const figureCenterY = Math.min(...pitches) + (figureHeight / 2.0);
        const windowCenterY = this.config.y0 + (this.config.innerHeight / 2.0);

        return figureCenterY - windowCenterY;
    }

}

export default PitchArtCoordConverter;
