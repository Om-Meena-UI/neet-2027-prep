import React, { useState, useEffect, useRef } from 'react';
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
  const drawerRef = useRef(null);

  // Close playlist drawer when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setShowPlaylistDrawer(false);
      }
    };
    if (showPlaylistDrawer) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showPlaylistDrawer]);

  return (
    <>
      {/* Playlist Drawer (pops up cleanly above MobileBottomNav on mobile, and above bar on desktop) */}
      {showPlaylistDrawer && (
        <div
          ref={drawerRef}
          className="fixed right-3 sm:right-8 z-50 w-80 max-w-[calc(100vw-1.5rem)] sleek-card p-4 space-y-3 shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/10 bg-[#14161c]/95 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 lg:!bottom-20"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 9rem)' }}
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#55e357]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Synced Soundtracks</h4>
              <span className="text-[10px] font-mono text-zinc-500">({tracks.length})</span>
            </div>
            <button
              onClick={() => setShowPlaylistDrawer(false)}
              className="text-zinc-400 hover:text-white text-xs p-1.5 rounded-full hover:bg-white/5 transition"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {tracks.map((track, idx) => {
              const isSelected = currentTrackIndex === idx;
              return (
                <button
                  key={track.id}
                  onClick={() => {
                    changeTrack(idx);
                    setShowPlaylistDrawer(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-[#262a34] text-white border border-white/15 shadow-sm'
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

                  {/* Animated Equalizer Wave on Active Playing Track */}
                  {isSelected && isPlaying && (
                    <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
                      <span className="w-0.5 bg-[#55e357] rounded-full eq-bar-1" />
                      <span className="w-0.5 bg-[#55e357] rounded-full eq-bar-2" />
                      <span className="w-0.5 bg-[#55e357] rounded-full eq-bar-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Volume Control inside Drawer */}
          <div className="sm:hidden pt-2.5 border-t border-white/5 flex items-center justify-between gap-3 text-xs text-zinc-400">
            <button
              onClick={toggleMute}
              className="text-zinc-400 hover:text-white transition flex items-center gap-1.5"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span className="text-[10px] font-mono">{isMuted ? 'Muted' : `${volume}%`}</span>
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
              className="flex-1 h-1 bg-[#262a34] rounded-lg cursor-pointer accent-[#55e357]"
            />
          </div>
        </div>
      )}

      {/* Persistent Floating Bottom Bar (Spotify / YouTube Music Style) */}
      <div
        className="fixed inset-x-2.5 sm:inset-x-8 z-40 max-w-5xl mx-auto"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
      >
        <div
          className={`bg-[#14161c]/92 backdrop-blur-2xl border rounded-full px-3 sm:px-5 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.75)] flex items-center justify-between gap-2 sm:gap-6 transition-all ${
            isPlaying ? 'border-[#55e357]/30 ring-1 ring-[#55e357]/15' : 'border-white/10'
          }`}
        >
          {/* Left: Track Info & Album Art */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial sm:w-64">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-inner">
              <img
                src={currentTrack.cover}
                alt={currentTrack.name}
                className="w-full h-full object-cover"
              />
              {/* Sleek Animated Equalizer Overlay on Album Art */}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                  <div className="flex items-end gap-0.5 h-3.5">
                    <span className="w-1 bg-[#55e357] rounded-full eq-bar-1" />
                    <span className="w-1 bg-[#55e357] rounded-full eq-bar-2" />
                    <span className="w-1 bg-[#55e357] rounded-full eq-bar-3" />
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {currentTrack.name}
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 truncate">
                <span className="inline-flex items-center gap-1 text-[#55e357] font-semibold flex-shrink-0">
                  {isPlaying && <span className="w-1.5 h-1.5 rounded-full bg-[#55e357] animate-pulse" />}
                  {currentTrack.tag}
                </span>
                <span className="flex-shrink-0">•</span>
                <span className="truncate">{currentTrack.artist}</span>
              </div>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
            <button
              onClick={() => changeTrack(currentTrackIndex - 1)}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/5 active:scale-90 transition-transform"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-sleek active:scale-95 duration-150 ${
                isPlaying
                  ? 'bg-[#55e357] text-black hover:bg-[#45cc47] shadow-glow-lime'
                  : 'bg-white text-black hover:bg-zinc-200'
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
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/5 active:scale-90 transition-transform"
              title="Next Track"
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
                  ? 'bg-[#55e357] text-black border-[#55e357] font-bold shadow-glow-lime'
                  : 'bg-[#262a34] text-zinc-300 hover:text-white border-white/5 hover:bg-white/10'
              }`}
              title="View study playlists"
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
