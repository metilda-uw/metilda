import * as DEFAULT  from '../../constants/create';

interface PitchConfig {
  maxPitch: number;
  minPitch: number;
}

interface Speaker {
  uploadId: string;
}

export const useImageSelection = () => {
  const imageIntervalToTimeInterval = (
    x1: number, 
    x2: number, 
    maxAudioTime: number,
    minAudioTime: number,
    maxAudioX: number,
    minAudioX: number,
    ) => {
    const dt = maxAudioTime - minAudioTime;
    const dx = maxAudioX - minAudioX;
    const u0 = x1 / dx;
    const u1 = x2 / dx;

    const t0 = minAudioTime + (u0 * dt);
    const t1 = minAudioTime + (u1 * dt);
    return [t0, t1];
  };

  const imageIntervalSelected = (
    leftX: number,
    rightX: number,
    audioConfig: {
      maxAudioTime: number,
      minAudioTime: number,
      maxAudioX: number,
      minAudioX: number,
    },
    config: {
      addPitch: (pitch: number, text: string, ts: number[], isManual?: boolean, isWordSep?: boolean) => void;
      getSpeaker: () => Speaker;
      pitchConfig: PitchConfig;
    },
    options: {
      manualPitch?: number;
      isWordSep?: boolean;
      tsOverride?: number[];
    } = {}

  ) => {
    const ts = options.tsOverride || imageIntervalToTimeInterval(leftX, rightX, audioConfig.maxAudioTime, audioConfig.minAudioTime, audioConfig.maxAudioX, audioConfig.minAudioX);

    if (options.manualPitch !== undefined) {
      config.addPitch(options.manualPitch, DEFAULT.SYLLABLE_TEXT, ts, true);
      return;
    }

    if (options.isWordSep) {
      config.addPitch(-1, DEFAULT.SEPARATOR_TEXT, ts, false, true);
      return;
    }

    fetch(`/api/audio/${config.getSpeaker().uploadId}/pitch/avg`
      + "?t0=" + ts[0]
      + "&t1=" + ts[1]
      + "&max-pitch=" + config.pitchConfig.maxPitch
      + "&min-pitch=" + config.pitchConfig.minPitch, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
    })
      .then((response) => response.json())
      .then((data) => config.addPitch(data.avg_pitch, DEFAULT.SYLLABLE_TEXT, ts, false));
  };

  // Convert audio time (seconds) -> image-local X pixel (relative to the full image)
  const timeToImageX = (time: number, props) => {
    const startOffset = props.imageWidth * props.xminPerc;
    if (time <= props.minAudioTime) return startOffset + props.minAudioX - props.minAudioX * 0; // startOffset
    if (time >= props.maxAudioTime) return startOffset + (props.maxAudioX - props.minAudioX);

    const dt = props.maxAudioTime - props.minAudioTime;
    const u0 = (time - props.minAudioTime) / dt;
    const dx = props.maxAudioX - props.minAudioX;
    return startOffset + u0 * dx;
  }

// Convert image-local X pixel -> audio time (seconds)
  const imageXToTime = (x: number, props) => {
    const startOffset = props.imageWidth * props.xminPerc;
    const dx = props.maxAudioX - props.minAudioX;
    if (x <= startOffset) return props.minAudioTime;
    if (x >= startOffset + dx) return props.maxAudioTime;
    const u = (x - startOffset) / dx;
    return props.minAudioTime + u * (props.maxAudioTime - props.minAudioTime);
  }


  return {
    imageIntervalToTimeInterval,
    imageIntervalSelected,
    timeToImageX,
    imageXToTime
  };
};


