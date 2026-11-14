import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';

const MusicContext = createContext(null);

export const DEFAULT_TRACKS = [
  {
    id: 'lofi-1',
    name: 'Lofi Girl - Chill Study Beats',
    artist: 'Lofi Records',
    tag: 'Focus Lofi',
    cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=150&auto=format&fit=crop&q=80',
    videoId: 'jfKfPfyJRdk',
  },
  {
    id: 'alpha-1',
    name: 'Deep Focus & Binaural Alpha Waves',
    artist: 'Brainwave Sync',
    tag: 'Alpha Waves',
    cover: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=150&auto=format&fit=crop&q=80',
    videoId: 'WPni755-Krg',
  },
  {
    id: 'classical-1',
    name: 'Classical for Intense Studying',
    artist: 'Mozart & Chopin',
    tag: 'Classical',
    cover: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=150&auto=format&fit=crop&q=80',
    videoId: 'mIYzp5rcTvU',
  },
  {
    id: 'synth-1',
    name: 'Chill Ambient Study Synthwave',
    artist: 'Astral Wave',
    tag: 'Synthwave',
    cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150&auto=format&fit=crop&q=80',
    videoId: '4xDzrJKXOOY',
  },
  {
    id: 'rain-1',
    name: 'Peaceful Piano & Soft Rain',
    artist: 'Soothing Relax',
    tag: 'Rain & Piano',
    cover: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=150&auto=format&fit=crop&q=80',
    videoId: '2atQnvunGCo',
  },
];

export function MusicProvider({ children }) {
  const [tracks, setTracks] = useState(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isSidebarPlayerHidden, setIsSidebarPlayerHidden] = useState(false);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const changeTrack = (newIndex) => {
    const validIndex = (newIndex + tracks.length) % tracks.length;
    setCurrentTrackIndex(validIndex);
    setIsPlaying(true);
  };

  const loadCustomVideo = (videoId, title = 'Custom YouTube Stream') => {
    const customTrack = {
      id: `custom-${Date.now()}`,
      name: title,
      artist: 'YouTube Stream',
      tag: 'Custom',
      cover: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      videoId,
    };
    setTracks((prev) => [customTrack, ...prev]);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <MusicContext.Provider
      value={{
        tracks,
        currentTrack,
        currentTrackIndex,
        isPlaying,
        volume,
        isMuted,
        isSidebarPlayerHidden,
        setIsSidebarPlayerHidden,
        togglePlay,
        changeTrack,
        loadCustomVideo,
        handleVolumeChange,
        toggleMute,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used inside MusicProvider');
  return ctx;
}
