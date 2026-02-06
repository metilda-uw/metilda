import { ContactSupportOutlined } from "@material-ui/icons";
import "./PitchRange.css";

import React, { Component } from "react";

class PitchRange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: 425, // maxPitch - minPitch
      errors: [],
      isDirty: false,
    };
    this.submitMaxPitch = this.submitMaxPitch.bind(this);
  }

  componentDidUpdate(prevProps) {
      if (
        this.props.initMinPitch !== prevProps.initMinPitch ||
        this.props.initMaxPitch !== prevProps.initMaxPitch
      ) {
        this.setState({
          offset: this.props.initMaxPitch - this.props.initMinPitch,
          errors: [],
          isDirty: false,
        });
      }
    }

  submitMaxPitch() {
    if (this.state.errors.length > 0) return;

    const min = this.props.initMinPitch;
    const max = Math.min(min + this.state.offset, 500);

    this.props.applyPitchRange(min, max);

    this.setState({
      isDirty: false,
    });
  }

  enterPressed = (event) => {
    console.log("loggint he event which is " + event);
    if (event.key === "Enter") {
      this.submitMaxPitch(event);
    }
  };

  render() {
    const minPitch = this.props.initMinPitch;
    const maxPitch = minPitch + this.state.offset;

    return (
      <div className="metilda-audio-analysis-controls-list-item col s12">
        <label className="group-label">Adjust Pitch (Vertical) Axis</label>

        <div className="metilda-audio-analysis-controls-list-item-row">
          <label className="group-label">Pitch Range Offset</label>

          <input
            type="range"
            min={0}
            max={425}
            step={1}
            value={this.state.offset}
            disabled = {this.props.isLocked}
            onChange={(e) =>
              this.setState({
                offset: Number(e.target.value),
                isDirty: true,
              })
            }
          />

          <p>
            Range: <strong>{minPitch} Hz</strong> →{" "}
            <strong>{maxPitch} Hz</strong>
            <br />
            Offset: {this.state.offset} Hz
          </p>
        </div>

        <div>
          <button
            className="waves-effect waves-light btn globalbtn"
            type="submit"
            disabled={!this.state.isDirty || this.props.isLocked}
            onClick={this.submitMaxPitch}
          >
            Apply
          </button>
        </div>

        <div style={{ gap: "10px", marginTop: "10px" }}>
            <button
              className="waves-effect waves-light btn globalbtn"
              onClick={this.props.lockPitchRange}
              disabled={this.props.isPitchRangeLocked}
              type="button"
              >
                Lock Range
            </button>
        
            <button
              className="waves-effect waves-light btn globalbtn"
              onClick={this.props.unlockPitchRange}
              disabled={!this.props.isPitchRangeLocked}
              type="button"
              >
               Unlock
            </button>
        </div>
      </div>
    );
  }
}

export default PitchRange;
