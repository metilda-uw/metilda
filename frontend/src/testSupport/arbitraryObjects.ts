import {RawPitchValue} from "../PitchArtWizard/PitchArtViewer/types";
import {Letter, Speaker} from "../types/types";

export interface ArbitraryLetterProps {
    t0?: number;
    t1?: number;
    pitch?: number;
    syllable?: string;
    isManualPitch?: boolean;
    isWordSep?: boolean;
}

export const arbitraryLetter = (props: ArbitraryLetterProps = {}): Letter => {
    return {
        t0: props.t0 || 0,
        t1: props.t1 || 0,
        pitch: props.pitch || 0,
        syllable: props.syllable || "",
        isManualPitch: props.isManualPitch || false,
        isWordSep: props.isWordSep || false
    };
};

export interface ArbitrarySpeakerProps {
    uploadId?: string;
    letters?: Letter[];
}

export const arbitrarySpeaker = (props: ArbitrarySpeakerProps = {}): Speaker => {
    return {
        uploadId: props.uploadId || "",
        letters: props.letters || []
    };
};

export const arbitraryRawPitchValue = (): RawPitchValue => {
    return {t0: 0, t1: 0, pitch: 0};
};
