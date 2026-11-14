import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Radio,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function FloatingBottomPlayer() {
  const {
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    volume,
    isMuted,
    togglePlay,
    changeTrack,
    handleVolumeChange,
    toggleMute,
  } = useMusic();

  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState(false);

  return (
    <>
      {/* Playlist Drawer (pops up when playlist icon clicked) */}
      {showPlaylistDrawer && (
        <div className="fixed bottom-24 right-4 sm:right-8 z-50 w-80 max-w-[92vw] sleek-card p-4 space-y-3 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#55e357]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Synced Soundtracks</h4>
            </div>
            <button
              onClick={() => setShowPlaylistDrawer(false)}
              className="text-zinc-400 hover:text-white text-xs p-1"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {tracks.map((track, idx) => (
              <button
                key={track.id}
                onClick={() => {
                  changeTrack(idx);
                  setShowPlaylistDrawer(false);
                }}
                className={`w-full p-2 rounded-xl text-left transition flex items-center gap-2.5 ${
                  currentTrackIndex === idx
                    ? 'bg-[#262a34] text-white border border-white/15'
                    : 'hover:bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <img
                  src={track.cover}
                  alt={track.name}
                  className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate text-white leading-tight">
                    {track.name}
                  </div>
                  <div className="text-[10px] text-zinc-400">{track.tag}</div>
                </div>
                {currentTrackIndex === idx && isPlaying && (
                  <span className="w-2 h-2 rounded-full bg-[#55e357] animate-ping" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Persistent Floating Bottom Bar (Spotify / YouTube Music Style) */}
      <div className="fixed bottom-3 inset-x-3 sm:inset-x-8 z-40 max-w-5xl mx-auto">
        <div className="bg-[#14161c]/95 backdrop-blur-xl border border-white/10 rounded-full px-4 sm:px-6 py-2.5 shadow-2xl flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Track Info & Album Art */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial sm:w-64">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-inner">
              <img
                src={currentTrack.cover}
                alt={currentTrack.name}
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-[#55e357] animate-ping" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {currentTrack.name}
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 truncate">
                <span className="text-[#55e357] font-semibold">{currentTrack.tag}</span>
                <span>•</span>
                <span>{currentTrack.artist}</span>
              </div>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => changeTrack(currentTrackIndex - 1)}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition"
              title="Previous"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-sleek ${
                isPlaying
                  ? 'bg-[#f97316] text-black hover:bg-[#ea580c] shadow-orange-500/30'
                  : 'bg-[#55e357] text-black hover:bg-[#42ca44] shadow-glow-lime'
              }`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => changeTrack(currentTrackIndex + 1)}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition"
              title="Next"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Volume Slider & Playlist Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-zinc-400 hover:text-white transition p-1"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                className="w-16 md:w-24 h-1 bg-[#262a34] rounded-lg appearance-none cursor-pointer accent-[#55e357]"
              />
            </div>

            {/* Playlist Drawer Button */}
            <button
              onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                showPlaylistDrawer
                  ? 'bg-[#55e357] text-black border-[#55e357]'
                  : 'bg-[#262a34] text-zinc-300 hover:text-white border-white/5'
              }`}
              title="View playlists"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Playlists</span>
              {showPlaylistDrawer ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
