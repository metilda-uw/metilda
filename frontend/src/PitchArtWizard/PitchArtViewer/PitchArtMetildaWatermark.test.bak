import {shallow} from "enzyme";
import * as React from "react";
import {expect} from "../../setupTests";
import PitchArtMetildaWatermark from "./PitchArtMetildaWatermark";

describe("PitchArtMetildaWatermark", () => {
    it("renders on the page", () => {
        const subject = shallowRender({});
        expect(subject.find(".PitchArtLegend")).to.be.present();
        expect(subject.find(".PitchArtLegend-title")).to.have.text("Legend");
    });
}

function shallowRender(props: OptionalProps) {
    return shallow(<PitchArtMetildaWatermark {...makeProps(props)} />);
}

interface OptionalProps {
    fontSize: number;
    windowConfig: PitchArtWindowConfig;
    xOrigin: number;
    xMax: number;
}

function makeProps(props: OptionalProps) {
    return {
        fontSize: props.fontSize || "",
        windowConfig: props.WindowConfig || null,
        xOrigin: props.xOrigin || "";
        xMax: props.xMax || "";
    };
}
