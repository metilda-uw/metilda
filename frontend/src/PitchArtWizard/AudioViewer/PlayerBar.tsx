
import React, { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeUp, faVolumeDown, faVolumeOff } from "@fortawesome/free-solid-svg-icons";
import "./PlayerBar.css"; 

interface VerticalLine {
  id: string;
  time: number;
}

interface Props {
    audioUrl: string;
    typeOfBeat?: string;
    verticalLines?: VerticalLine[];
    minAudioTime: number;
    maxAudioTime: number;
}

const PlayerBar: React.FC<Props> = ({ audioUrl, typeOfBeat='Melody', verticalLines=[],minAudioTime, maxAudioTime }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);


  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // from 0 to 1
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [progress, setProgress] = useState(0); // in seconds
  const [duration, setDuration] = useState(0); // in seconds
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [tapSpeed, setTapSpeed] = useState(1.0);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      audio.currentTime = 0; 
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackRate;
      }
  }, [playbackRate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        volumeRef.current &&
        !volumeRef.current.contains(event.target as Node)
      ) {
        setShowVolumeSlider(false);
      }
    };

    if (showVolumeSlider) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVolumeSlider]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
    }
    setVolume(newVolume);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = newTime;
    }
    setProgress(newTime);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlaybackRate(parseFloat(e.target.value));
  };

  const  playBeats = () => {
  
      if (!verticalLines.length) {
        console.warn("No beats to play.");
        return;
      }
  
      const tapTimes = verticalLines.map((line) => {
        // Map the x-coordinate to a time in the audio
        if (line.time >= minAudioTime && line.time <= maxAudioTime) {
          return line.time - minAudioTime;
        }
      });
  
      const audioCtx = new (window.AudioContext || window.AudioContext)();
  
      // Function to play a single tap sound
      const playTap = () => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
  
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Frequency of the tap sound
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05); // Fade out the tap sound
  
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.06); // Duration of the tap sound
      };
  
      tapTimes.forEach((time) => {
        setTimeout(() => {
          playTap();
        }, (time/tapSpeed)* 1000); // Convert seconds to milliseconds.
      });
    };

    const  playAudioWithTaps = () => {

      if (!verticalLines.length) {
        console.warn("No beats to play.");
        return;
      }

      const audioElement = audioRef.current;
      if (!audioElement) return;


      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const tapGainNode = audioContext.createGain();
      tapGainNode.connect(audioContext.destination);

      const tapTimes = verticalLines
        .filter(line => line.time >= minAudioTime && line.time <= maxAudioTime)
        .map(line => (line.time - minAudioTime));


      audioElement.currentTime = 0;
      audioElement.playbackRate = playbackRate;
      audioContext.resume();
      audioElement.play();

      const triggeredTaps = new Set();

      const handleTimeUpdate = () => {
        const currentTime = audioElement.currentTime;

        for (let i = 0; i < tapTimes.length; i++) {
          if (currentTime >= tapTimes[i]- 0.05 && !triggeredTaps.has(i)) {
            // Play the tap sound using AudioContext for precise timing and 50ms early trigger to sync better with audio
            playTapSound(audioContext, tapGainNode, tapTimes[i]);
            triggeredTaps.add(i);
          }
        }
      };

      audioElement.addEventListener('timeupdate', handleTimeUpdate);

      audioElement.addEventListener('ended', () => {
        audioElement.removeEventListener('timeupdate', handleTimeUpdate);
        triggeredTaps.clear();
      });
    };


    const playTapSound = (audioContext: AudioContext, tapGainNode: GainNode, i: number) => {
      const audioCtx = audioContext
      const oscillator = audioCtx.createOscillator();
      const gainNode = tapGainNode || audioCtx.createGain();
    
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05); // Fade out the tap sound
    
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.02);
    };


  return (
      <div className="player-container">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        <div className="player-row player-main-controls">
          <button className="no-margin" onClick={togglePlayPause}>
            {isPlaying ? "Pause" : "Play"}
          </button>

          <div className="volume-control" ref={volumeRef}>
            <button onClick={() => setShowVolumeSlider(!showVolumeSlider)} className="volume-icon">
                <FontAwesomeIcon
                    icon={
                      volume === 0 ? faVolumeOff :
                      volume < 0.5 ? faVolumeDown :
                      faVolumeUp
                    }
                  />
              </button>

            {showVolumeSlider && (
              <input
                type="range"
                className="volume-slider vertical"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
              />
            )}
          </div>

          <input
            type="range"
            className="audio-slider"
            min="0"
            max={duration}
            value={progress}
            step="0.1"
            onChange={handleSeek}
          />

          <select
            value={playbackRate}
            onChange={handleSpeedChange}
            className="speed-control"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
        {
          typeOfBeat == 'Rhythm' &&
          <div className="player-row player-beat-controls">
            <select
              value={tapSpeed}
              onChange={(e) => setTapSpeed(parseFloat(e.target.value))}
              className="speed-control"
            >
              <option value="0.5">Tap 0.5x</option>
              <option value="0.75">Tap 0.75x</option>
              <option value="1">Tap 1x</option>
              <option value="1.25">Tap 1.25x</option>
              <option value="1.5">Tap 1.5x</option>
              <option value="2">Tap 2x</option>
            </select>

            <div style={{ marginBottom: "3px", textAlign: "center" }}>
              <button className="waves-effect waves-light btn globalbtn" onClick={playBeats}>
                Play Taps
              </button>
              <button className="waves-effect waves-light btn globalbtn" onClick={playAudioWithTaps} style={{ marginLeft: "8px" }}>
                Play Speech + Taps
              </button>
            </div>
            <audio id="audio-player" src={audioUrl} preload="auto" />
          </div>
        }
      </div>
    );
  };

export default PlayerBar;
