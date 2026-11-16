import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Target,
  CheckCircle2,
  Coffee,
  Maximize2,
  Minimize2,
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  Flame,
  Award,
} from 'lucide-react';
import { usePrep } from '../context/PrepContext';
import { useMusic } from '../context/MusicContext';

// Storage keys so each mode's decided time is preserved independently
const STORAGE_TIMER_POMODORO = 'neet27_timer_pomodoro_mins';
const STORAGE_TIMER_CHAPTER = 'neet27_timer_chapter_mins';
const STORAGE_TIMER_MARATHON = 'neet27_timer_marathon_mins';
const STORAGE_TIMER_MODE = 'neet27_timer_active_mode';

export default function DualTimer() {
  const { allChapters, state, setSelectedChapterId, logFocusMinutes, toggleChapterStage, showToast } = usePrep();
  const { isPlaying: isMusicPlaying, togglePlay: toggleMusicPlay } = useMusic();

  const soundEnabled = state.settings?.soundAlerts !== false;

  // 3 Primary Study Modes:
  // 1. 'pomodoro': pure focus sprints (e.g. 25m / 45m / 50m)
  // 2. 'chapter': time decided specifically for revising 1 chapter (e.g. 60m / 90m / 120m)
  // 3. 'marathon': NEET mock exam / deep endurance marathon (e.g. 180m / 3 hours)
  // 4. 'break': optional rest interval after a session (5m / 10m)
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TIMER_MODE);
      return saved && ['pomodoro', 'chapter', 'marathon', 'break'].includes(saved) ? saved : 'pomodoro';
    } catch {
      return 'pomodoro';
    }
  });

  // Independent decided durations (DO NOT MATCH OR OVERWRITE EACH OTHER)
  const [pomodoroMins, setPomodoroMins] = useState(() => {
    try {
      const s = parseInt(localStorage.getItem(STORAGE_TIMER_POMODORO), 10);
      return !isNaN(s) && s > 0 ? s : (state.settings?.pomodoroFocusMin || 25);
    } catch {
      return 25;
    }
  });

  const [chapterMins, setChapterMins] = useState(() => {
    try {
      const s = parseInt(localStorage.getItem(STORAGE_TIMER_CHAPTER), 10);
      return !isNaN(s) && s > 0 ? s : 60; // 60 min standard chapter revision
    } catch {
      return 60;
    }
  });

  const [marathonMins, setMarathonMins] = useState(() => {
    try {
      const s = parseInt(localStorage.getItem(STORAGE_TIMER_MARATHON), 10);
      return !isNaN(s) && s > 0 ? s : 180; // 180 min (3 Hours NEET official)
    } catch {
      return 180;
    }
  });

  const [breakMins, setBreakMins] = useState(5);

  // Active countdown seconds for the currently active mode
  const getDurationForMode = (m) => {
    if (m === 'pomodoro') return pomodoroMins * 60;
    if (m === 'chapter') return chapterMins * 60;
    if (m === 'marathon') return marathonMins * 60;
    if (m === 'break') return breakMins * 60;
    return 25 * 60;
  };

  const [totalSeconds, setTotalSeconds] = useState(() => getDurationForMode(mode));
  const [secondsLeft, setSecondsLeft] = useState(() => getDurationForMode(mode));
  const [isRunning, setIsRunning] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [completedSession, setCompletedSession] = useState(null);

  // Drift-free timing engine refs
  const timerRef = useRef(null);
  const expectedEndTimeRef = useRef(null);
  const initialSecondsAtStartRef = useRef(null);

  // Active selected chapter
  const selectedChapter =
    (allChapters && allChapters.find((c) => c.id === state.selectedChapterId)) ||
    (allChapters && allChapters[0]) || { id: '', title: 'All Chapters', subject: 'General' };

  const chapterProgress = (selectedChapter && state.chapterProgress?.[selectedChapter.id]) || {
    ncert: false,
    pyqs: false,
    revision: false,
  };

  // Persist mode choice
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TIMER_MODE, mode);
    } catch (e) {
      // ignore
    }
  }, [mode]);

  // Mode switcher: sets the exact independent time decided for that mode
  const handleModeChange = (newMode) => {
    setIsRunning(false);
    setCompletedSession(null);
    setMode(newMode);
    initialSecondsAtStartRef.current = null;

    let targetDuration = 25 * 60;
    if (newMode === 'pomodoro') targetDuration = pomodoroMins * 60;
    else if (newMode === 'chapter') targetDuration = chapterMins * 60;
    else if (newMode === 'marathon') targetDuration = marathonMins * 60;
    else if (newMode === 'break') targetDuration = breakMins * 60;

    setTotalSeconds(targetDuration);
    setSecondsLeft(targetDuration);
  };

  // Set independent duration for Pomodoro without touching other modes
  const handleSetPomodoroMins = (mins) => {
    const val = Math.max(1, parseInt(mins, 10) || 25);
    setPomodoroMins(val);
    try {
      localStorage.setItem(STORAGE_TIMER_POMODORO, String(val));
    } catch (e) {}
    if (mode === 'pomodoro') {
      setIsRunning(false);
      initialSecondsAtStartRef.current = null;
      setTotalSeconds(val * 60);
      setSecondsLeft(val * 60);
    }
  };

  // Set independent duration for 1 Chapter Revision without touching Pomodoro or Marathon
  const handleSetChapterMins = (mins) => {
    const val = Math.max(1, parseInt(mins, 10) || 60);
    setChapterMins(val);
    try {
      localStorage.setItem(STORAGE_TIMER_CHAPTER, String(val));
    } catch (e) {}
    if (mode === 'chapter') {
      setIsRunning(false);
      initialSecondsAtStartRef.current = null;
      setTotalSeconds(val * 60);
      setSecondsLeft(val * 60);
    }
  };

  // Set independent duration for Marathon without touching other modes
  const handleSetMarathonMins = (mins) => {
    const val = Math.max(1, parseInt(mins, 10) || 180);
    setMarathonMins(val);
    try {
      localStorage.setItem(STORAGE_TIMER_MARATHON, String(val));
    } catch (e) {}
    if (mode === 'marathon') {
      setIsRunning(false);
      initialSecondsAtStartRef.current = null;
      setTotalSeconds(val * 60);
      setSecondsLeft(val * 60);
    }
  };

  // Set Break time
  const handleSetBreakMins = (mins) => {
    const val = Math.max(1, parseInt(mins, 10) || 5);
    setBreakMins(val);
    if (mode === 'break') {
      setIsRunning(false);
      initialSecondsAtStartRef.current = null;
      setTotalSeconds(val * 60);
      setSecondsLeft(val * 60);
    }
  };

  // Harmonic chord chime via Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const freqs = [523.25, 783.99, 1046.5]; // C5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.12 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0 + idx * 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
      });
    } catch (e) {}
  };

  // Drift-free interval ticker
  useEffect(() => {
    if (isRunning) {
      expectedEndTimeRef.current = Date.now() + secondsLeft * 1000;
      if (initialSecondsAtStartRef.current === null) {
        initialSecondsAtStartRef.current = secondsLeft;
      }

      timerRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((expectedEndTimeRef.current - now) / 1000));
        setSecondsLeft(remaining);

        if (remaining === 0) {
          clearInterval(timerRef.current);
          setIsRunning(false);

          const startSec = initialSecondsAtStartRef.current || totalSeconds;
          const elapsedMins = Math.max(1, Math.round(startSec / 60));
          initialSecondsAtStartRef.current = null;

          if (mode !== 'break') {
            logFocusMinutes(elapsedMins);
            setCompletedSession({
              mode,
              chapter: selectedChapter,
              minutes: elapsedMins,
            });
          }

          if (soundEnabled) {
            playChime();
          }

          if (mode === 'chapter') {
            showToast(`📖 Chapter Revision completed! +${elapsedMins}m logged for ${selectedChapter.title}.`);
          } else if (mode === 'marathon') {
            showToast(`🔥 NEET Marathon completed! +${elapsedMins}m logged to your endurance streak.`);
          } else if (mode === 'break') {
            showToast('☕ Break over! Refocused and ready for study.');
          } else {
            showToast(`🎉 Pomodoro sprint completed! +${elapsedMins}m logged.`);
          }
        }
      }, 200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, secondsLeft, totalSeconds, soundEnabled, logFocusMinutes, showToast, selectedChapter]);

  // Fullscreen Zen Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
      if (e.code === 'Space' && isZenMode && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
        e.preventDefault();
        setIsRunning((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  const toggleTimer = () => {
    if (!isRunning && initialSecondsAtStartRef.current === null) {
      initialSecondsAtStartRef.current = secondsLeft;
    }
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    initialSecondsAtStartRef.current = null;
    setCompletedSession(null);
    const dur = getDurationForMode(mode);
    setSecondsLeft(dur);
    setTotalSeconds(dur);
  };

  const handleManualQuickLog = (mins) => {
    if (mins > 0) {
      logFocusMinutes(mins);
      showToast(`Logged +${mins}m of offline study.`);
    }
  };

  // Time formatters
  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return {
        main: `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
        hasHours: true,
      };
    }
    return {
      main: `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
      hasHours: false,
    };
  };

  // Geometry for SVG Radial Progress
  const circleRadius = 78;
  const circumference = 2 * Math.PI * circleRadius;
  const progressRatio = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progressRatio)));

  // Theme accents distinct for each mode
  const modeThemes = {
    pomodoro: {
      title: 'Pomodoro Sprint',
      desc: 'High-focus interval discipline',
      color: '#55e357',
      bgGlow: 'bg-[#55e357]',
      textColor: 'text-[#55e357]',
      borderActive: 'border-[#55e357]',
      badge: 'Sprint Mode',
    },
    chapter: {
      title: '1 Chapter Revision',
      desc: 'Dedicated block to revise 1 full chapter',
      color: '#38bdf8',
      bgGlow: 'bg-[#38bdf8]',
      textColor: 'text-[#38bdf8]',
      borderActive: 'border-[#38bdf8]',
      badge: 'Chapter Block',
    },
    marathon: {
      title: 'NEET Marathon',
      desc: '3-Hour official mock exam simulation',
      color: '#f97316',
      bgGlow: 'bg-[#f97316]',
      textColor: 'text-[#f97316]',
      borderActive: 'border-[#f97316]',
      badge: '3h Endurance',
    },
    break: {
      title: 'Rest & Recover',
      desc: 'Cognitive breather before next block',
      color: '#a855f7',
      bgGlow: 'bg-[#a855f7]',
      textColor: 'text-[#a855f7]',
      borderActive: 'border-[#a855f7]',
      badge: 'Break Time',
    },
  };

  const currentTheme = modeThemes[mode] || modeThemes.pomodoro;
  const formatted = formatTime(secondsLeft);

  return (
    <>
      <div className="sleek-card p-5 sm:p-6 space-y-5 relative overflow-hidden">
        {/* Radial Background Atmosphere */}
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-10 transition-colors duration-500"
          style={{ backgroundColor: currentTheme.color }}
        />

        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${currentTheme.textColor}`} />
            <div>
              <h3 className="font-bold text-white text-sm tracking-tight">Study Focus Timer</h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{
                color: currentTheme.color,
                backgroundColor: `${currentTheme.color}15`,
                borderColor: `${currentTheme.color}35`,
              }}
            >
              {currentTheme.badge}
            </span>

            {/* Zen Fullscreen Modal */}
            <button
              onClick={() => setIsZenMode(true)}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition"
              title="Fullscreen Zen Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3 Core Modes + Break: Completely separate times (Don't match both times) */}
        <div className="grid grid-cols-4 bg-[#14161c] p-1 rounded-2xl border border-white/5 text-[11px] font-semibold text-center">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`py-1.5 rounded-xl transition-all ${
              mode === 'pomodoro'
                ? 'bg-[#262a34] text-[#55e357] shadow-inner font-bold border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pomodoro
          </button>

          <button
            onClick={() => handleModeChange('chapter')}
            className={`py-1.5 rounded-xl transition-all ${
              mode === 'chapter'
                ? 'bg-[#262a34] text-[#38bdf8] shadow-inner font-bold border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            1 Chapter
          </button>

          <button
            onClick={() => handleModeChange('marathon')}
            className={`py-1.5 rounded-xl transition-all ${
              mode === 'marathon'
                ? 'bg-[#262a34] text-[#f97316] shadow-inner font-bold border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Marathon
          </button>

          <button
            onClick={() => handleModeChange('break')}
            className={`py-1.5 rounded-xl transition-all ${
              mode === 'break'
                ? 'bg-[#262a34] text-[#a855f7] shadow-inner font-bold border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Break
          </button>
        </div>

        {/* Mode-Specific Time Presets (Independent Decided Times) */}
        {mode === 'pomodoro' && (
          <div className="space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-300">Pomodoro Sprints:</span>
              <span className="font-mono text-[#55e357]">{pomodoroMins}m set</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[25, 45, 50, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSetPomodoroMins(mins)}
                  className={`py-1 rounded-xl text-[10px] font-bold transition border ${
                    pomodoroMins === mins
                      ? 'bg-[#55e357]/20 text-[#55e357] border-[#55e357]/40 shadow-sm'
                      : 'bg-[#14161c] text-zinc-400 hover:text-white border-white/5'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'chapter' && (
          <div className="space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#38bdf8]" />
                Time for 1 Chapter Revision:
              </span>
              <span className="font-mono text-[#38bdf8] font-bold">{chapterMins}m block</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSetChapterMins(mins)}
                  className={`py-1 rounded-xl text-[10px] font-bold transition border ${
                    chapterMins === mins
                      ? 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8]/40 shadow-sm'
                      : 'bg-[#14161c] text-zinc-400 hover:text-white border-white/5'
                  }`}
                >
                  {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'marathon' && (
          <div className="space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#f97316]" />
                NEET Marathon Endurance:
              </span>
              <span className="font-mono text-[#f97316] font-bold">{marathonMins / 60}h test</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: '2h Mini Mock', mins: 120 },
                { label: '3h NTA Exam', mins: 180 },
                { label: '4h Mega Marathon', mins: 240 },
              ].map((item) => (
                <button
                  key={item.mins}
                  onClick={() => handleSetMarathonMins(item.mins)}
                  className={`py-1 rounded-xl text-[10px] font-bold transition border ${
                    marathonMins === item.mins
                      ? 'bg-[#f97316]/20 text-[#f97316] border-[#f97316]/40 shadow-sm'
                      : 'bg-[#14161c] text-zinc-400 hover:text-white border-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'break' && (
          <div className="space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-[#a855f7]" />
                Rest Duration:
              </span>
              <span className="font-mono text-[#a855f7]">{breakMins}m break</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSetBreakMins(mins)}
                  className={`py-1 rounded-xl text-[10px] font-bold transition border ${
                    breakMins === mins
                      ? 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/40 shadow-sm'
                      : 'bg-[#14161c] text-zinc-400 hover:text-white border-white/5'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Radial SVG Dial */}
        <div className="relative flex flex-col items-center justify-center py-2">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r={circleRadius}
                stroke="#1d222b"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="90"
                cy="90"
                r={circleRadius}
                stroke={currentTheme.color}
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-300 ease-linear"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
              <div
                className={`font-mono font-black tracking-tight text-white ${
                  formatted.hasHours ? 'text-3xl' : 'text-4xl'
                }`}
              >
                {formatted.main}
              </div>

              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${isRunning ? 'animate-ping' : ''}`}
                  style={{ backgroundColor: currentTheme.color }}
                />
                <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                  {currentTheme.title}
                </span>
              </div>

              <span className="text-[10px] font-mono text-zinc-500 mt-0.5">
                {Math.round(progressRatio * 100)}% done
              </span>
            </div>
          </div>
        </div>

        {/* Target Chapter Section: Highlighted for Chapter Revision & optional for other modes */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            mode === 'chapter'
              ? 'bg-[#161a22] border-[#38bdf8]/30 shadow-sm'
              : 'bg-[#14161c] border-white/5'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] mb-2">
            <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[10px]">
              <Target
                className={`w-3.5 h-3.5 ${mode === 'chapter' ? 'text-[#38bdf8]' : 'text-[#55e357]'}`}
              />
              <span className={mode === 'chapter' ? 'text-white font-bold' : 'text-zinc-400'}>
                {mode === 'chapter' ? 'Chapter to Revise (1 Chapter Block)' : 'Target Chapter'}
              </span>
            </div>

            {/* Checkpoint status pills */}
            <div className="flex items-center gap-1 text-[9px] font-bold">
              <span
                className={`px-1.5 py-0.5 rounded-md ${
                  chapterProgress.ncert ? 'bg-[#55e357]/20 text-[#55e357]' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                NCERT
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md ${
                  chapterProgress.pyqs ? 'bg-[#55e357]/20 text-[#55e357]' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                PYQ
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md ${
                  chapterProgress.revision ? 'bg-[#38bdf8]/20 text-[#38bdf8]' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                REV
              </span>
            </div>
          </div>

          <select
            value={state.selectedChapterId || (selectedChapter ? selectedChapter.id : '')}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="w-full text-xs font-semibold bg-[#191d24] border border-white/10 rounded-xl p-2.5 text-white truncate focus:outline-none focus:border-[#38bdf8]/50 cursor-pointer"
          >
            {allChapters &&
              allChapters.map((ch) => (
                <option key={ch.id} value={ch.id} className="bg-[#1a1d24] text-white">
                  [{ch.subject.slice(0, 4)}] {ch.title}
                </option>
              ))}
          </select>

          {mode === 'chapter' && (
            <p className="text-[10px] text-[#38bdf8]/80 mt-1.5">
              Timer is set to <span className="font-bold">{chapterMins}m</span> dedicated to completing 1 revision of this chapter.
            </p>
          )}
        </div>

        {/* Main Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTimer}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-sleek active:scale-95 text-black"
            style={{
              backgroundColor: isRunning ? '#ea580c' : currentTheme.color,
            }}
          >
            {isRunning ? (
              <Pause className="w-4 h-4 fill-current text-black" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5 text-black" />
            )}
            <span className="text-black font-bold">
              {isRunning ? 'Pause Session' : `Start ${currentTheme.title}`}
            </span>
          </button>

          <button
            onClick={resetTimer}
            className="p-3 rounded-full bg-[#262a34] text-zinc-400 hover:text-white border border-white/5 transition"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Post-Session Milestone Card: specific to mode completed */}
        {completedSession && (
          <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/10 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Sparkles className="w-4 h-4 text-[#55e357]" />
                <span>
                  {completedSession.mode === 'chapter'
                    ? '1 Chapter Revision Completed!'
                    : completedSession.mode === 'marathon'
                    ? 'NEET Marathon Finished!'
                    : 'Pomodoro Sprint Done!'}
                </span>
              </div>
              <button
                onClick={() => setCompletedSession(null)}
                className="text-zinc-500 hover:text-white text-[10px]"
              >
                Dismiss
              </button>
            </div>

            <p className="text-[11px] text-zinc-300">
              {completedSession.mode === 'chapter' ? (
                <>
                  Completed <span className="font-bold text-white">{completedSession.chapter.title}</span> revision ({completedSession.minutes}m). Mark revision done:
                </>
              ) : (
                <>
                  Logged <span className="font-bold text-white">+{completedSession.minutes}m</span> focus session to your streak!
                </>
              )}
            </p>

            {completedSession.mode === 'chapter' && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => toggleChapterStage(selectedChapter.id, 'revision')}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border transition ${
                    chapterProgress.revision
                      ? 'bg-[#38bdf8] text-black border-[#38bdf8]'
                      : 'bg-[#262a34] text-[#38bdf8] border-[#38bdf8]/40 hover:bg-[#38bdf8]/20'
                  }`}
                >
                  Mark Revision {chapterProgress.revision ? '✓ Done' : '+ Complete'}
                </button>
                <button
                  onClick={() => toggleChapterStage(selectedChapter.id, 'pyqs')}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border transition ${
                    chapterProgress.pyqs
                      ? 'bg-[#55e357] text-black border-[#55e357]'
                      : 'bg-[#262a34] text-zinc-300 border-white/5 hover:text-white'
                  }`}
                >
                  PYQs {chapterProgress.pyqs ? '✓' : '+'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Offline Study Quick Logger */}
        <div className="pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Log offline study:</span>
            <span className="font-mono text-zinc-500">Quick Add</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => handleManualQuickLog(mins)}
                className="py-1 rounded-xl bg-[#14161c] hover:bg-[#262a34] text-zinc-300 hover:text-white border border-white/5 text-[10px] font-bold transition"
              >
                +{mins}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Zen Focus Overlay */}
      {isZenMode && (
        <div className="fixed inset-0 z-50 bg-[#0e1013]/98 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-200">
          {/* Zen Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentTheme.color }}
              />
              <span className="text-sm font-bold text-white tracking-wide uppercase">
                {currentTheme.title}
              </span>
            </div>

            <button
              onClick={() => setIsZenMode(false)}
              className="p-2.5 rounded-full bg-[#1c2027] hover:bg-[#282f3a] text-zinc-400 hover:text-white border border-white/10 transition"
              title="Exit Zen Mode (Esc)"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Zen Centerpiece */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 180 180">
                <circle
                  cx="90"
                  cy="90"
                  r={circleRadius}
                  stroke="#1c2027"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="90"
                  cy="90"
                  r={circleRadius}
                  stroke={currentTheme.color}
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-[stroke-dashoffset] duration-300 ease-linear"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="font-mono font-black text-6xl sm:text-7xl tracking-tighter text-white">
                  {formatted.main}
                </div>
                <div className="text-sm text-zinc-400 mt-2 font-medium">
                  {mode === 'chapter' ? selectedChapter.title : currentTheme.desc}
                </div>
              </div>
            </div>

            {/* Zen Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTimer}
                className="px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider text-black transition active:scale-95"
                style={{ backgroundColor: currentTheme.color }}
              >
                {isRunning ? 'Pause (Space)' : 'Start (Space)'}
              </button>

              <button
                onClick={toggleMusicPlay}
                className={`p-3.5 rounded-full border transition ${
                  isMusicPlaying
                    ? 'bg-[#55e357]/20 border-[#55e357]/40 text-[#55e357]'
                    : 'bg-[#1c2027] hover:bg-[#282f3a] border-white/5 text-zinc-400 hover:text-white'
                }`}
                title={isMusicPlaying ? 'Pause Study Audio' : 'Play Study Audio'}
              >
                {isMusicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Zen Footer */}
          <div className="text-xs text-zinc-500 font-mono text-center">
            Press <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">Space</kbd> to toggle,{' '}
            <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">Esc</kbd> to exit
          </div>
        </div>
      )}
    </>
  );
}
