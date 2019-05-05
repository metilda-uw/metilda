import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../../setupTests";
import {arbitrarySpeaker} from "../../testSupport/arbitraryObjects";
import {Speaker} from "../../types/types";
import PitchArtLegend, {PitchArtLegendProps} from "./PitchArtLegend";

describe("PitchArtLegend", () => {
    it("renders on the page", () => {
        const subject = shallowRender({});
        expect(subject.find(".PitchArtLegend")).to.be.present();
        expect(subject.find(".PitchArtLegend-title")).to.have.text("Legend");
    });

    describe("legend", () => {
        it("renders 1 speaker correctly", () => {
            const subject = shallowRender({speakers: [arbitrarySpeaker()]});
            expect(subject.find(".pitch-art-legend-list-item")).to.have.lengthOf(1);
            expect(subject.find(".pitch-art-legend-list-item").at(0)).to.text("Speaker 1");
        });

        it("renders 2 speakers correctly", () => {
            const subject = shallowRender({speakers: [arbitrarySpeaker(), arbitrarySpeaker()]});
            expect(subject.find(".pitch-art-legend-list-item")).to.have.lengthOf(2);
            expect(subject.find(".pitch-art-legend-list-item").at(0)).to.text("Speaker 1");
            expect(subject.find(".pitch-art-legend-list-item").at(1)).to.text("Speaker 2");
        });

        it("renders 3 speakers correctly", () => {
            const subject = shallowRender({
                speakers: [
                    arbitrarySpeaker(), arbitrarySpeaker(), arbitrarySpeaker()
                ]
            });
            expect(subject.find(".pitch-art-legend-list-item")).to.have.lengthOf(3);
            expect(subject.find(".pitch-art-legend-list-item").at(0)).to.text("Speaker 1");
            expect(subject.find(".pitch-art-legend-list-item").at(1)).to.text("Speaker 2");
            expect(subject.find(".pitch-art-legend-list-item").at(2)).to.text("Speaker 3");
        });

        it("renders 4 speakers correctly", () => {
            const subject = shallowRender({
                speakers: [
                    arbitrarySpeaker(), arbitrarySpeaker(), arbitrarySpeaker(), arbitrarySpeaker()
                ]
            });
            expect(subject.find(".pitch-art-legend-list-item")).to.have.lengthOf(4);
            expect(subject.find(".pitch-art-legend-list-item").at(0)).to.text("Speaker 1");
            expect(subject.find(".pitch-art-legend-list-item").at(1)).to.text("Speaker 2");
            expect(subject.find(".pitch-art-legend-list-item").at(2)).to.text("Speaker 3");
            expect(subject.find(".pitch-art-legend-list-item").at(3)).to.text("Speaker 4");
        });
    });
});

interface OptionalProps {
    speakers?: Speaker[];
}

function shallowRender(props: OptionalProps) {
    return shallow(<PitchArtLegend {...makeProps(props)} />);
}

function makeProps(props: OptionalProps): PitchArtLegendProps {
    return {
        speakers: props.speakers || []
    };
}
