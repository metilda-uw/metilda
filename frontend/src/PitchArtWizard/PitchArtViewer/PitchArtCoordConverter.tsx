import {PitchArtWindowConfig, RawPitchValue} from "./types";
import {referenceExponent} from "./PitchArtScale";

class PitchArtCoordConverter {
    private config: PitchArtWindowConfig;
    private pitchValues: Array<RawPitchValue>;
    private readonly vertOffset: number;

    constructor(config: PitchArtWindowConfig,
                pitchValues: Array<RawPitchValue>,
                isVerticallyCentered: boolean) {
        this.config = config;
        this.pitchValues = pitchValues;
        this.vertOffset = 0.0;

        if (isVerticallyCentered) {
            this.vertOffset = this.centerOffset(
                pitchValues.map(item => this.vertValueToRectCoords(item.pitch))
            );
        }
    }

    centerOffset(pitches: Array<number>) {
        if (pitches.length < 1) {
            return 0.0;
        }

        let figureHeight = Math.max(...pitches) - Math.min(...pitches);
        let figureCenterY = Math.min(...pitches) + (figureHeight / 2.0);
        let windowCenterY = this.config.y0 + (this.config.innerHeight / 2.0);

        return figureCenterY - windowCenterY;
    }

    horzIndexToRectCoords(time: number) {
        let timePerc;

        if (this.pitchValues.length === 1) {
            timePerc = 0.1;
        } else {
            let totalDuration = this.pitchValues[this.pitchValues.length - 1].t0 - this.pitchValues[0].t0;
            timePerc = (time - this.pitchValues[0].t0) / totalDuration;
        }

        let pointDx = timePerc * this.config.innerWidth;
        return this.config.x0 + pointDx;
    }

    vertValueToRectCoords(pitch: number) {
        let refExp = referenceExponent(pitch);
        let pitchIntervalSteps = referenceExponent(this.config.dMax) - referenceExponent(this.config.dMin);
        let valuePerc = (refExp - referenceExponent(this.config.dMin)) / pitchIntervalSteps;
        let rectHeight = this.config.innerHeight * valuePerc;
        return this.config.innerHeight - rectHeight + this.config.y0 - this.vertOffset;
    }

}

export default PitchArtCoordConverter;