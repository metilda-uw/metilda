import React, { Component } from "react";
import "./TimeRange.css";
import "../AudioViewer/PitchRange.css";

class TimeRange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      minTime: null,
      maxTime: null,
      errors: [],
      isMinDirty: false,
      isMaxDirty: false,
    };
    this.minTimeRef = React.createRef();
    this.maxTimeRef = React.createRef();
    this.submitMaxTime = this.submitMaxTime.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidUpdate(prevProps) {

    if (this.props.initMinTime !== prevProps.initMinTime || this.props.initMaxTime !== prevProps.initMaxTime) {
      this.setState({
        minTime: null,
        maxTime: null,
        errors: [],
        isMinDirty: false,
        isMaxDirty: false,
      });
    }
  }

  submitMaxTime(event) {
    if (this.state.errors.length > 0) {
      return;
    }
    this.setState({
      minTime: null,
      maxTime: null,
      errors: [],
      isMinDirty: false,
      isMaxDirty: false,
    });
    this.props.applyTimeRange(0, parseFloat(this.maxTimeRef.current.value));
  }

  validateInput = () => {
    const minTime = 0;
    const maxTime = this.maxTimeRef.current.value;

    const errors = [];
    const invalidValues = [minTime, maxTime].filter(
      (value) => isNaN(value) || value < 0.0
    );
    if (invalidValues.length > 0) {
      errors.push("Time must be a positive number");
    }

    this.setState({ errors: errors });

    return errors.length === 0;
  };

  handleInputChange(event) {
    this.validateInput();

    const name = event.target.name;
    let num = parseFloat(event.target.value);

    if (isNaN(num) || num < 0) {
      this.setState({ [name]: "" });
      return;
    }

    this.setState({ [name]: num });

    if (name === "minTime") {
      this.setState({ isMinDirty: true });
    } else if (name === "maxTime") {
      this.setState({ isMaxDirty: true });
    }
  }

  enterPressed = (event) => {
    if (event.key === "Enter") {
      this.submitMaxTime(event);
    }
  };

  render() {
    let minValue = this.props.initMinTime;
    if (this.state.isMinDirty) {
      minValue = this.state.minTime;
    }

    let maxValue = this.props.initMaxTime;
    if (this.state.isMaxDirty) {
      maxValue = this.state.maxTime;
    }

    return (
      <div className="metilda-audio-analysis-controls-list-item col s12">
        <label className="group-label text">
          Adjust Time (Horizontal) Axis
        </label>
        <span className="pitch-range-err-list">
          {this.state.errors.map((item, index) => (
            <p key={index} className="pitch-range-err-list-item">
              {item}
            </p>
          ))}
        </span>
        <div className="metilda-audio-analysis-controls-list-item-row">
          <div className="metilda-audio-analysis-controls-list-item-row col s6">
            <input
              name="maxTime"
              id="maxTime"
              ref={this.maxTimeRef}
              value={maxValue}
              onChange={(event) => this.handleInputChange(event)}
              onKeyPress={(event) => this.enterPressed(event)}
              placeholder="max seconds"
              className="validate time-range-input"
              //pattern="(\d+)(\.\d+)?"
              required={true}
              type="number"
              step="0.1"
            />
            <p>Seconds</p>
          </div>
          <div className="col s6">
            <button
              className="waves-effect waves-light btn globalbtn"
              type="submit"
              onClick={(event) => this.submitMaxTime(event)}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default TimeRange;
