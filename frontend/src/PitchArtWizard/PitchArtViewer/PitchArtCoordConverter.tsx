import {referenceExponent} from "./PitchArtScale";
import {PitchArtWindowConfig, RawPitchValue} from "./types";

class PitchArtCoordConverter {
    private config: PitchArtWindowConfig;
    private pitchValues: RawPitchValue[];
    private readonly vertOffset: number;

    constructor(config: PitchArtWindowConfig,
                pitchValues: RawPitchValue[],
                isVerticallyCentered: boolean) {
        this.config = config;
        this.pitchValues = pitchValues;
        this.vertOffset = 0.0;

        if (isVerticallyCentered) {
            this.vertOffset = this.centerOffset(
                pitchValues.map((item) => this.vertValueToRectCoords(item.pitch))
            );
        }
    }

    horzIndexToRectCoords(time: number) {
        let timePerc;

        if (this.pitchValues.length === 1) {
            timePerc = 0.1;
        } else {
            const totalDuration = this.pitchValues[this.pitchValues.length - 1].t0 - this.pitchValues[0].t0;
            timePerc = (time - this.pitchValues[0].t0) / totalDuration;
        }

        const pointDx = timePerc * this.config.innerWidth;
        return this.config.x0 + pointDx;
    }

    vertValueToRectCoords(pitch: number) {
        const refExp = referenceExponent(pitch);
        const pitchIntervalSteps = referenceExponent(this.config.dMax) - referenceExponent(this.config.dMin);
        const valuePerc = (refExp - referenceExponent(this.config.dMin)) / pitchIntervalSteps;
        const rectHeight = this.config.innerHeight * valuePerc;
        return this.config.innerHeight - rectHeight + this.config.y0 - this.vertOffset;
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
