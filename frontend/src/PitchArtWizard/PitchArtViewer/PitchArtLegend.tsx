import * as React from "react";
import {Speaker} from "../../types/types";
import "../GlobalStyling.css";
import "./PitchArtLegend.css";

interface Props {
    speakers: Speaker[];
}

export default class PitchArtLegend extends React.Component<Props> {
    static SPEAKER_COLOR(speakerIndex: number): string {
        const colors = ["green", "blue", "purple", "red", "orange"];
        return colors[speakerIndex % colors.length];
    }

    renderSpeaker = (speaker: Speaker, speakerIndex: number) => {
        const color = PitchArtLegend.SPEAKER_COLOR(speakerIndex);
        return (
          <div className="pitch-art-legend-list-item">
              <span style={{backgroundColor: color}} className="pitch-art-legend-icon"></span>
              <p className="pitch-art-legend-list-item-text">Speaker {speakerIndex + 1}</p>
          </div>
        );
    }

    render() {
        return (
            <div className="metilda-pitch-art-container-control-list-item col s12">
                <div className="top-label">
                    <label>Legend</label>
                </div>
                {
                    this.props.speakers.map(
                    (item, speakerIndex) => this.renderSpeaker(item, speakerIndex)
                    )
                }
            </div>
        );
    }
}
