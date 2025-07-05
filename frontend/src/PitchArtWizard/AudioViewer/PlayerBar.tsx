
import React, { useRef, useState, useEffect } from "react";
import {controls, Media, Player} from "react-media-player";

const {PlayPause, SeekBar, MuteUnmute, Volume,} = controls;

interface Props {
    audioUrl: string;
}

const PlayerBar: React.FC<Props> = ({ audioUrl }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1); // from 0 to 1
  const [progress, setProgress] = useState(0); // in seconds
  const [duration, setDuration] = useState(0); // in seconds
  const [playbackRate, setPlaybackRate] = useState(1.0);

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

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
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


  return (
    <div className="custom-player">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        <button onClick={togglePlayPause}>
            {isPlaying ? "Pause" : "Play"}
        </button>

        <button onClick={toggleMute}>
            {isMuted ? "Unmute" : "Mute"}
        </button>

        <input
            type="range"
            min="0"
            max={duration}
            value={progress}
            step="0.1"
            onChange={handleSeek}
        />

        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
        />

        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="speedSelect" style={{ fontWeight: 'bold' }}>Speed:</label>
          <select
            id="speedSelect"
            value={playbackRate}
            onChange={handleSpeedChange}
            style={{
              display: 'inline-block',
              padding: '4px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: 'black',
              appearance: 'auto', 
            }}
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
    </div>
  );
};

export default PlayerBar;
