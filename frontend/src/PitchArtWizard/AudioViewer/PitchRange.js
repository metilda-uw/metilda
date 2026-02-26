import "./PitchRange.css";

import React, { Component } from "react";

class PitchRange extends Component {
  constructor(props) {
      super(props);

      const minMeT = this.hzToMeT(props.initMinPitch);
      const maxMeT = this.hzToMeT(props.initMaxPitch);

      this.state = {
        offsetMeT: maxMeT - minMeT,
        errors: [],
        isDirty: false,
      };

      this.submitMaxPitch = this.submitMaxPitch.bind(this);
  }

  SLIDER_MIN_HZ = 75;
  SLIDER_MAX_HZ = 500;

  getSliderMinMeT = () => this.hzToMeT(this.SLIDER_MIN_HZ);
  getSliderMaxMeT = () => this.hzToMeT(this.SLIDER_MAX_HZ);

  componentDidUpdate(prevProps) {
    if (
      this.props.initMinPitch !== prevProps.initMinPitch ||
      this.props.initMaxPitch !== prevProps.initMaxPitch
    ) {
      const minMeT = this.hzToMeT(this.props.initMinPitch);
      const maxMeT = this.hzToMeT(this.props.initMaxPitch);

      this.setState({
        offsetMeT: maxMeT - minMeT,
        errors: [],
        isDirty: false,
      });
    }
  }

    // Hz → MeT
  hzToMeT = (hz) => {
    return 48 * Math.log2(hz / 440);
  };

  // MeT → Hz
  meTToHz = (met) => {
    return 440 * Math.pow(2, met / 48);
  };

  submitMaxPitch() {
    if (this.state.errors.length > 0) return;

    const minHz = this.SLIDER_MIN_HZ;

    let maxHz;
    if (this.props.isPitchRangeLocked && this.props.lockedMaxPitch) {
      maxHz = this.props.lockedMaxPitch;
    } else {
      maxHz = this.meTToHz(this.getSliderMinMeT() + this.state.offsetMeT);
    }

    this.props.applyPitchRange(minHz, maxHz);

    this.setState({ isDirty: false });
  }

  enterPressed = (event) => {
    console.log("loggint he event which is " + event);
    if (event.key === "Enter") {
      this.submitMaxPitch(event);
    }
  };

  render() {
    
    let sliderValueMeT;
    if (this.props.isPitchRangeLocked && this.props.lockedMaxPitch) {
      // Thumb jumps to locked value
      sliderValueMeT = this.hzToMeT(this.props.lockedMaxPitch);
    } else {
      // Thumb follows current offset
      sliderValueMeT = this.getSliderMinMeT() + this.state.offsetMeT;
    }
    const minPitchMeT = this.getSliderMinMeT();
    const maxPitchMeT = sliderValueMeT; 

    return (
      <div className="metilda-audio-analysis-controls-list-item col s12">
        <label className="group-label">Adjust Pitch (Vertical) Axis</label>

        <div className="metilda-audio-analysis-controls-list-item-row">
          <label className="group-label">Pitch Range Offset</label>

          <input
            type="range"
            min={this.getSliderMinMeT()}
            max={this.getSliderMaxMeT()}  
            step={0.1}
            value={sliderValueMeT}
            disabled={this.props.isLocked}
            onChange={(e) =>
              this.setState({
                offsetMeT: Number(e.target.value) - this.getSliderMinMeT(),
                isDirty: true,
              })
            }
          />

          <p>
            Range: <strong>{minPitchMeT.toFixed(2)} MeT</strong> →{" "}
            <strong>{maxPitchMeT.toFixed(2)} MeT</strong>
            <br />
            Offset: {this.state.offsetMeT.toFixed(2)} MeT
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

        {typeof this.props.lockPitchRange === "function" && (<div style={{ gap: "10px", marginTop: "10px" }}>
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
        </div>)}
      </div>
    );
  }
}

export default PitchRange;
