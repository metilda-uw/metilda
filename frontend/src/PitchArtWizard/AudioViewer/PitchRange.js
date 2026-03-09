import "./PitchRange.css";

import React, { Component } from "react";

const MIN_PITCH_FLOOR_HZ = 30;
const SLIDER_MAX_HZ = 500;
const DEFAULT_MIN_DISPLAY = 75;
const DEFAULT_MAX_DISPLAY = 500;

class PitchRange extends Component {
  constructor(props) {
      super(props);

      const useMinMaxInputs = props.useMinMaxInputs === true;
      const minMeT = this.hzToMeT(props.initMinPitch);
      const maxMeT = this.hzToMeT(props.initMaxPitch);

      this.state = useMinMaxInputs
        ? {
            minHz: Number(props.initMinPitch) || DEFAULT_MIN_DISPLAY,
            maxHz: Number(props.initMaxPitch) || DEFAULT_MAX_DISPLAY,
            errors: [],
            isDirty: false,
          }
        : {
            offsetMeT: maxMeT - minMeT,
            errors: [],
            isDirty: false,
          };

      this.submitMaxPitch = this.submitMaxPitch.bind(this);
      this.submitMinMaxPitch = this.submitMinMaxPitch.bind(this);
  }

  /** Pitch art slider: fixed min 75 Hz, max 500 Hz (reverted from 30 for drag line). */
  SLIDER_MIN_HZ = 75;
  SLIDER_MAX_HZ = 500;

  getSliderMinMeT = () => this.hzToMeT(this.SLIDER_MIN_HZ);
  getSliderMaxMeT = () => this.hzToMeT(this.SLIDER_MAX_HZ);

  componentDidUpdate(prevProps) {
    if (
      this.props.initMinPitch !== prevProps.initMinPitch ||
      this.props.initMaxPitch !== prevProps.initMaxPitch
    ) {
      if (this.props.useMinMaxInputs) {
        this.setState({
          minHz: Number(this.props.initMinPitch) || DEFAULT_MIN_DISPLAY,
          maxHz: Number(this.props.initMaxPitch) || DEFAULT_MAX_DISPLAY,
          errors: [],
          isDirty: false,
        });
      } else {
        const minMeT = this.hzToMeT(this.props.initMinPitch);
        const maxMeT = this.hzToMeT(this.props.initMaxPitch);
        this.setState({
          offsetMeT: maxMeT - minMeT,
          errors: [],
          isDirty: false,
        });
      }
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

  submitMinMaxPitch() {
    const errors = [];
    const minHz = Number(this.state.minHz);
    const maxHz = Number(this.state.maxHz);

    if (Number.isNaN(minHz) || minHz < MIN_PITCH_FLOOR_HZ) {
      errors.push(`Min pitch must be at least ${MIN_PITCH_FLOOR_HZ} Hz`);
    }
    if (Number.isNaN(maxHz) || maxHz < MIN_PITCH_FLOOR_HZ) {
      errors.push(`Max pitch must be at least ${MIN_PITCH_FLOOR_HZ} Hz`);
    }
    if (errors.length === 0 && minHz >= maxHz) {
      errors.push("Min pitch must be less than max pitch");
    }

    this.setState({ errors });
    if (errors.length > 0) return;

    this.props.applyPitchRange(minHz, maxHz);
    this.setState({ isDirty: false });
  }

  enterPressed = (event) => {
    if (event.key === "Enter") {
      if (this.props.useMinMaxInputs) {
        this.submitMinMaxPitch();
      } else {
        this.submitMaxPitch(event);
      }
    }
  };

  render() {
    if (this.props.useMinMaxInputs) {
      return (
        <div className="metilda-audio-analysis-controls-list-item col s12 pitch-range-minmax-wrap">
          <label className="group-label">Pitch Range (Hz)</label>
          <div
            className="metilda-audio-analysis-controls-list-item-row-left-align pitch-range-minmax-row"
            style={{ alignItems: "center", gap: "24px", flexWrap: "nowrap" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ minWidth: "32px" }}>Min</span>
              <input
                aria-label="Min pitch (Hz)"
                id="pitch-range-min-hz"
                type="number"
                min={MIN_PITCH_FLOOR_HZ}
                step={1}
                className="pitch-range-input"
                value={this.state.minHz}
                disabled={this.props.isLocked}
                onChange={(e) => {
                  const v = e.target.value;
                  this.setState({
                    minHz: v === "" ? "" : Number(v),
                    isDirty: true,
                    errors: [],
                  });
                }}
                onKeyDown={this.enterPressed}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ minWidth: "32px" }}>Max</span>
              <input
                aria-label="Max pitch (Hz)"
                id="pitch-range-max-hz"
                type="number"
                min={MIN_PITCH_FLOOR_HZ}
                step={1}
                className="pitch-range-input"
                value={this.state.maxHz}
                disabled={this.props.isLocked}
                onChange={(e) => {
                  const v = e.target.value;
                  this.setState({
                    maxHz: v === "" ? "" : Number(v),
                    isDirty: true,
                    errors: [],
                  });
                }}
                onKeyDown={this.enterPressed}
              />
            </div>
          </div>

          {this.state.errors.length > 0 && (
            <div className="pitch-range-err-list">
              {this.state.errors.map((err, index) => (
                <p key={index} className="pitch-range-err-list-item">
                  {err}
                </p>
              ))}
            </div>
          )}
          <div className="pitch-range-apply-wrap">
            <button
              className="waves-effect waves-light btn globalbtn"
              type="button"
              disabled={!this.state.isDirty || this.props.isLocked}
              onClick={this.submitMinMaxPitch}
            >
              Apply
            </button>
          </div>
        </div>
      );
    }

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
