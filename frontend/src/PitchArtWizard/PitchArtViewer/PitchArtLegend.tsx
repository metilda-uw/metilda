import * as React from "react";
import {Speaker} from "../../types/types";
import "./PitchArtLegend.css";
import PitchArtColorChooser from "./PitchArtColorChooser";

export interface PitchArtLegendProps {
    speakers: Speaker[];
}

export interface State {
    isColorChangeDialogOpen: boolean;
}


export default class PitchArtLegend extends React.Component<PitchArtLegendProps, State> {
    private speakerIndex: number;
    constructor(props: PitchArtLegendProps){
        super(props);
        this.state = {
            isColorChangeDialogOpen:false
        };
        this.speakerIndex = -1;
    }
    static SPEAKER_COLOR(speakerIndex: number): string {
        const colors = ["gray","green", "blue", "purple", "red", "orange"];
        return colors[speakerIndex % colors.length];
    }

    openColorChangeDailog = (speakerIndex:number) => { 
        this.speakerIndex = speakerIndex;
        this.setState({isColorChangeDialogOpen:true});
    }

    closeColorChangeDailog = () => { 
        this.speakerIndex = -1;
        this.setState({isColorChangeDialogOpen:false});
    }

    renderSpeaker = (speaker: Speaker, speakerIndex: number) => {
        const color = this.props.speakers[speakerIndex].lineColor ? this.props.speakers[speakerIndex].lineColor :  PitchArtLegend.SPEAKER_COLOR(speakerIndex);
        return (
            <div className="pitch-art-legend-list-item" key={speakerIndex}>
                <span style={{backgroundColor: color}} className="pitch-art-legend-icon"></span>
                <p className="pitch-art-legend-list-item-text">Speaker {speakerIndex + 1}</p>
                <button className="waves-effect waves-light btn globalbtn" onClick={()=>{this.openColorChangeDailog(speakerIndex)}}>Change Color</button>
            </div>
        );
    }

    render() {
        return (
           
            <div className="PitchArtLegend metilda-pitch-art-container-control-list-item col s12">
                {this.state.isColorChangeDialogOpen && 
                    <PitchArtColorChooser 
                        isColorChangeDialogOpen={this.state.isColorChangeDialogOpen} 
                        handleClose={this.closeColorChangeDailog}
                        currentSpeakerIndex = {this.speakerIndex}
                    /> 
                }
                <div className="top-label">
                    <label className="PitchArtLegend-title">Legend</label>
                </div>
                <div className="pitch-art-legend-col-container">
                    <div className="pitch-art-legend-col">
                        {
                            this.props.speakers.slice(0, 2).map(
                                (item, speakerIndex) => this.renderSpeaker(item, speakerIndex)
                            )
                        }
                    </div>
                    <div className="pitch-art-legend-col">
                        {
                            this.props.speakers.slice(2).map(
                                (item, speakerIndex) => this.renderSpeaker(item, speakerIndex + 2)
                            )
                        }
                    </div>
                </div>
            </div>
        );
    }
}
