import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Radio,
  Headphones,
  Sparkles,
} from 'lucide-react';

const TRACKS = [
  {
    id: 'lofi-1',
    name: 'Lofi Girl - Chill Study Beats',
    artist: 'Lofi Records',
    tag: 'Focus Lofi',
    videoId: 'jfKfPfyJRdk',
  },
  {
    id: 'alpha-1',
    name: 'Deep Focus & Binaural Alpha Waves',
    artist: 'Brainwave Sync',
    tag: 'Alpha Waves',
    videoId: 'WPni755-Krg',
  },
  {
    id: 'classical-1',
    name: 'Classical for Intense Studying',
    artist: 'Mozart & Chopin',
    tag: 'Classical',
    videoId: 'mIYzp5rcTvU',
  },
  {
    id: 'synth-1',
    name: 'Chill Ambient Study Synthwave',
    artist: 'Astral Wave',
    tag: 'Synthwave',
    videoId: '4xDzrJKXOOY',
  },
  {
    id: 'piano-1',
    name: 'Peaceful Piano & Soft Rain',
    artist: 'Soothing Relax',
    tag: 'Rain & Piano',
    videoId: '2atQnvunGCo',
  },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const playerRef = useRef(null);
  const currentTrack = TRACKS[currentTrackIndex];

  // Load YouTube IFrame Player API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    function initPlayer() {
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player('yt-audio-player', {
        height: '0',
        width: '0',
        videoId: TRACKS[0].videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            setPlayerReady(true);
            event.target.setVolume(volume);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              setIsPlaying(false);
            }
          },
        },
      });
    }

    return () => {
      // Do not destroy player across small re-renders so music keeps playing smoothly
    };
  }, []);

  // Handle Play / Pause toggle
  const togglePlay = () => {
    if (!playerRef.current || !playerReady) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  // Change Track
  const changeTrack = (newIndex) => {
    const validIndex = (newIndex + TRACKS.length) % TRACKS.length;
    setCurrentTrackIndex(validIndex);
    const nextTrack = TRACKS[validIndex];

    if (playerRef.current && playerReady) {
      playerRef.current.loadVideoById(nextTrack.videoId);
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  // Volume slider control
  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    setIsMuted(newVol === 0);

    if (playerRef.current && playerReady) {
      playerRef.current.setVolume(newVol);
      if (newVol > 0 && playerRef.current.isMuted()) {
        playerRef.current.unMute();
      }
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!playerRef.current || !playerReady) return;

    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume || 50);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  return (
    <div className="sleek-card p-5 space-y-4 relative overflow-hidden">
      {/* Hidden YouTube Audio IFrame Engine */}
      <div id="yt-audio-player" className="hidden" />

      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#55e357]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#55e357]/10 text-[#55e357] flex items-center justify-center border border-[#55e357]/20">
            <Headphones className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
              <span>Direct Audio Player</span>
              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#55e357]/15 text-[#55e357] font-bold border border-[#55e357]/30">
                Live
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400">Plays directly inside this page</p>
          </div>
        </div>

        {/* Music Soundwave animation when playing */}
        {isPlaying && (
          <div className="flex items-end gap-1 h-3.5 px-2">
            <span className="w-1 bg-[#55e357] rounded-full animate-bounce h-2.5" />
            <span className="w-1 bg-[#55e357] rounded-full animate-bounce h-3.5 delay-100" />
            <span className="w-1 bg-[#55e357] rounded-full animate-bounce h-2 delay-200" />
          </div>
        )}
      </div>

      {/* Player Display Card */}
      <div className="p-4 rounded-2xl bg-[#14161c] border border-white/5 space-y-3">
        {/* Track Title and Artist */}
        <div className="min-w-0">
          <span className="text-[9px] uppercase font-bold tracking-widest text-[#55e357]">
            {currentTrack.tag}
          </span>
          <div className="text-xs font-bold text-white truncate leading-snug">
            {currentTrack.name}
          </div>
          <div className="text-[10px] text-zinc-400">{currentTrack.artist}</div>
        </div>

        {/* Direct Playback Controls (Previous, Play/Pause, Next) */}
        <div className="flex items-center justify-center gap-4 pt-1">
          <button
            onClick={() => changeTrack(currentTrackIndex - 1)}
            className="p-2 rounded-full bg-[#262a34] text-zinc-300 hover:text-white hover:bg-[#323744] transition"
            title="Previous track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-sleek ${
              isPlaying
                ? 'bg-[#f97316] text-black hover:bg-[#ea580c] shadow-orange-500/30'
                : 'bg-[#55e357] text-black hover:bg-[#42ca44] shadow-glow-lime'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => changeTrack(currentTrackIndex + 1)}
            className="p-2 rounded-full bg-[#262a34] text-zinc-300 hover:text-white hover:bg-[#323744] transition"
            title="Next track"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* In-Website Volume Slider */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <button
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white transition p-0.5"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-[#262a34] rounded-lg appearance-none cursor-pointer accent-[#55e357]"
          />
          <span className="text-[10px] font-mono text-zinc-400 w-6 text-right">
            {isMuted ? 0 : volume}%
          </span>
        </div>
      </div>

      {/* Station Selector Pills */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
          Switch Soundtracks:
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TRACKS.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => changeTrack(idx)}
              className={`p-2 rounded-xl text-left text-xs transition border flex items-center gap-2 ${
                currentTrackIndex === idx
                  ? 'bg-[#262a34] text-white border-white/20'
                  : 'bg-[#14161c] text-zinc-400 hover:text-white border-white/5'
              }`}
            >
              <Radio
                className={`w-3.5 h-3.5 flex-shrink-0 ${
                  currentTrackIndex === idx ? 'text-[#55e357]' : 'text-zinc-500'
                }`}
              />
              <span className="truncate text-[11px] font-semibold">{track.tag}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
