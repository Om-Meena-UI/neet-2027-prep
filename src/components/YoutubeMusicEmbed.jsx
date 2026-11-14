import React, { useState } from 'react';
import {
  ExternalLink,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function YoutubeMusicEmbed() {
  const {
    currentTrack,
    isPlaying,
    isSidebarPlayerHidden,
    setIsSidebarPlayerHidden,
    iframeRef,
    loadCustomVideo,
  } = useMusic();

  const [customInputUrl, setCustomInputUrl] = useState('');

  const handleCustomUrlSubmit = (e) => {
    e.preventDefault();
    if (!customInputUrl.trim()) return;

    let url = customInputUrl.trim();
    let vidId = '';

    if (url.includes('v=')) {
      vidId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      vidId = url.split('youtu.be/')[1].split('?')[0];
    } else {
      vidId = url;
    }

    if (vidId) {
      loadCustomVideo(vidId, 'Custom YouTube Stream');
    }
    setCustomInputUrl('');
  };

  // Fixed static embedSrc: DOES NOT recompute on isPlaying so iframe NEVER reloads when pausing/playing!
  const embedSrc = `https://www.youtube.com/embed/${currentTrack.videoId}?enablejsapi=1&version=3&rel=0&playsinline=1`;

  return (
    <div className="sleek-card p-5 space-y-4 relative overflow-hidden">
      {/* Background radial accent glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Hide / Show Screen Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* YouTube Music Red Badge */}
          <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
              <span>YouTube Music</span>
              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-bold border border-red-500/30">
                Live
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400">Stream playlists directly in your dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Hide/Show Video Screen button without stopping audio */}
          <button
            onClick={() => setIsSidebarPlayerHidden(!isSidebarPlayerHidden)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition border ${
              isSidebarPlayerHidden
                ? 'bg-[#262a34] text-zinc-300 border-white/10 hover:text-white'
                : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
            }`}
            title={
              isSidebarPlayerHidden
                ? 'Show Video Screen'
                : 'Hide Video Screen (Music Keeps Playing)'
            }
          >
            {isSidebarPlayerHidden ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[10px]">Show Screen</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span className="text-[10px]">Hide Screen</span>
              </>
            )}
          </button>

          <a
            href="https://music.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition"
            title="Open YouTube Music"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Video IFrame (Stays stable with no src mutation on play/pause) */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-sleek transition-all duration-300 ${
          isSidebarPlayerHidden
            ? 'h-0 opacity-0 pointer-events-none -my-2 border-0'
            : 'aspect-video h-auto opacity-100'
        }`}
      >
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          src={embedSrc}
          title={currentTrack.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* When video screen is hidden, show audio status banner */}
      {isSidebarPlayerHidden && (
        <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2 truncate">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-[#55e357] animate-pulse' : 'bg-zinc-600'
              } flex-shrink-0`}
            />
            <span className="text-white font-semibold truncate text-[11px]">
              {currentTrack.name}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 flex-shrink-0">
            {isPlaying ? 'Audio Streaming' : 'Paused'}
          </span>
        </div>
      )}

      {/* Embed Custom YouTube Music Song / Playlist Link */}
      <form onSubmit={handleCustomUrlSubmit}>
        <div className="flex items-center gap-2 bg-[#14161c] p-1.5 rounded-full border border-white/5">
          <Search className="w-3.5 h-3.5 text-zinc-500 ml-2.5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Paste YouTube or YT Music URL..."
            value={customInputUrl}
            onChange={(e) => setCustomInputUrl(e.target.value)}
            className="flex-1 bg-transparent px-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-3.5 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold transition flex-shrink-0 shadow-sm"
          >
            Play
          </button>
        </div>
      </form>
    </div>
  );
}
