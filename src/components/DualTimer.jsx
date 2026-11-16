import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Target,
  CheckCircle2,
  Coffee,
  FileText,
  Maximize2,
  Minimize2,
  Sparkles,
  Volume2,
  VolumeX,
  Plus,
} from 'lucide-react';
import { usePrep } from '../context/PrepContext';
import { useMusic } from '../context/MusicContext';

export default function DualTimer() {
  const { allChapters, state, setSelectedChapterId, logFocusMinutes, toggleChapterStage, showToast } = usePrep();
  const { isPlaying: isMusicPlaying, togglePlay: toggleMusicPlay, currentTrack } = useMusic();

  const pomodoroMinutes = state.settings?.pomodoroFocusMin || 25;
  const breakMinutes = state.settings?.pomodoroBreakMin || 5;
  const soundEnabled = state.settings?.soundAlerts !== false;

  // Modes: 'focus' | 'break' | 'exam' | 'stopwatch'
  const [mode, setMode] = useState('focus');
  const [presetFocusMin, setPresetFocusMin] = useState(pomodoroMinutes);
  const [presetBreakMin, setPresetBreakMin] = useState(breakMinutes);

  // Countdown state
  const [totalSeconds, setTotalSeconds] = useState(pomodoroMinutes * 60);
  const [secondsLeft, setSecondsLeft] = useState(pomodoroMinutes * 60);

  // Stopwatch state (counts up)
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [customManualMinutes, setCustomManualMinutes] = useState(25);
  const [isZenMode, setIsZenMode] = useState(false);
  const [justCompletedSession, setJustCompletedSession] = useState(null);

  // Accurate drift-free timing refs
  const timerRef = useRef(null);
  const expectedEndTimeRef = useRef(null);
  const stopwatchStartTimeRef = useRef(null);
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

  // Sync with global settings when user changes settings in modal
  useEffect(() => {
    if (mode === 'focus') {
      const dur = presetFocusMin * 60;
      setTotalSeconds(dur);
      if (!isRunning) setSecondsLeft(dur);
    }
  }, [pomodoroMinutes, presetFocusMin, mode, isRunning]);

  // Mode change handler
  const handleModeChange = (newMode) => {
    setIsRunning(false);
    setJustCompletedSession(null);
    setMode(newMode);

    if (newMode === 'focus') {
      const s = presetFocusMin * 60;
      setTotalSeconds(s);
      setSecondsLeft(s);
    } else if (newMode === 'break') {
      const s = presetBreakMin * 60;
      setTotalSeconds(s);
      setSecondsLeft(s);
    } else if (newMode === 'exam') {
      const s = 180 * 60; // 3 Hours NEET Standard
      setTotalSeconds(s);
      setSecondsLeft(s);
    } else if (newMode === 'stopwatch') {
      setStopwatchSeconds(0);
    }
  };

  // Harmonically rich ambient singing bowl chime via Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      const freqs = [523.25, 783.99, 1046.5]; // C5, G5, C6 harmonic chord
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        const initialGain = 0.12 / (idx + 1);
        gain.gain.setValueAtTime(initialGain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0 + idx * 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
      });
    } catch (e) {
      // Audio context blocked
    }
  };

  // Accurate drift-free interval ticker
  useEffect(() => {
    if (isRunning) {
      if (mode === 'stopwatch') {
        stopwatchStartTimeRef.current = Date.now() - stopwatchSeconds * 1000;
        timerRef.current = setInterval(() => {
          const now = Date.now();
          const elapsed = Math.floor((now - stopwatchStartTimeRef.current) / 1000);
          setStopwatchSeconds(elapsed);
        }, 200);
      } else {
        // Countdown modes ('focus', 'break', 'exam')
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

            // Calculate actual elapsed minutes
            const startSec = initialSecondsAtStartRef.current || totalSeconds;
            const elapsedMins = Math.max(1, Math.round(startSec / 60));

            initialSecondsAtStartRef.current = null;

            if (mode !== 'break') {
              logFocusMinutes(elapsedMins);
              setJustCompletedSession({
                chapter: selectedChapter,
                minutes: elapsedMins,
                mode,
              });
            }

            if (soundEnabled) {
              playChime();
            }

            showToast(
              mode === 'break'
                ? '☕ Break ended! Ready for your next focus session.'
                : `🎉 Focus block completed! +${elapsedMins} mins logged to streak.`
            );
          }
        }, 200);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, secondsLeft, totalSeconds, stopwatchSeconds, soundEnabled, logFocusMinutes, showToast, selectedChapter]);

  // Handle Zen mode keyboard shortcuts
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
    if (!isRunning) {
      if (mode !== 'stopwatch' && initialSecondsAtStartRef.current === null) {
        initialSecondsAtStartRef.current = secondsLeft;
      }
    }
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    initialSecondsAtStartRef.current = null;
    setJustCompletedSession(null);

    if (mode === 'focus') {
      const s = presetFocusMin * 60;
      setSecondsLeft(s);
      setTotalSeconds(s);
    } else if (mode === 'break') {
      const s = presetBreakMin * 60;
      setSecondsLeft(s);
      setTotalSeconds(s);
    } else if (mode === 'exam') {
      const s = 180 * 60;
      setSecondsLeft(s);
      setTotalSeconds(s);
    } else if (mode === 'stopwatch') {
      setStopwatchSeconds(0);
    }
  };

  const handleFinishStopwatch = () => {
    setIsRunning(false);
    const elapsedMinutes = Math.max(1, Math.round(stopwatchSeconds / 60));
    logFocusMinutes(elapsedMinutes);
    setJustCompletedSession({
      chapter: selectedChapter,
      minutes: elapsedMinutes,
      mode: 'stopwatch',
    });
    setStopwatchSeconds(0);
    showToast(`🎉 Logged ${elapsedMinutes} minutes of open focus!`);
  };

  const handleManualQuickLog = (mins) => {
    if (mins > 0) {
      logFocusMinutes(mins);
      showToast(`Logged +${mins} minutes of offline prep.`);
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

  // Geometry for SVG Circular Progress
  const circleRadius = 78;
  const circumference = 2 * Math.PI * circleRadius; // ~490.08
  const currentSeconds = mode === 'stopwatch' ? stopwatchSeconds : secondsLeft;
  const progressRatio =
    mode === 'stopwatch'
      ? (stopwatchSeconds % 3600) / 3600
      : totalSeconds > 0
      ? 1 - secondsLeft / totalSeconds
      : 0;

  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progressRatio)));

  // Theme accents by mode
  const modeColor =
    mode === 'focus'
      ? { stroke: '#55e357', bg: 'bg-[#55e357]', text: 'text-[#55e357]', ring: 'ring-[#55e357]/30' }
      : mode === 'break'
      ? { stroke: '#38bdf8', bg: 'bg-[#38bdf8]', text: 'text-[#38bdf8]', ring: 'ring-[#38bdf8]/30' }
      : mode === 'exam'
      ? { stroke: '#f97316', bg: 'bg-[#f97316]', text: 'text-[#f97316]', ring: 'ring-[#f97316]/30' }
      : { stroke: '#a855f7', bg: 'bg-[#a855f7]', text: 'text-[#a855f7]', ring: 'ring-[#a855f7]/30' };

  const formatted = formatTime(currentSeconds);

  return (
    <>
      <div className="sleek-card p-5 sm:p-6 space-y-5 relative overflow-hidden">
        {/* Background Radial Glow */}
        <div
          className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-10 transition-colors duration-500`}
          style={{ backgroundColor: modeColor.stroke }}
        />

        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${modeColor.text}`} />
            <h3 className="font-bold text-white text-sm tracking-tight">Study Focus Timer</h3>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Zen Fullscreen Modal Button */}
            <button
              onClick={() => setIsZenMode(true)}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition"
              title="Enter Fullscreen Zen Focus"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs (Focus, Break, Exam, Stopwatch) */}
        <div className="grid grid-cols-4 bg-[#14161c] p-1 rounded-2xl border border-white/5 text-[11px] font-semibold text-center">
          <button
            onClick={() => handleModeChange('focus')}
            className={`py-1.5 rounded-xl transition-all ${
              mode === 'focus'
                ? 'bg-[#262a34] text-white shadow-inner font-bold border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Focus
          </button>
          <button
            onClick={() => handleModeChange('break')}
            className={`py-1.5 rounded-xl transition-all ${
              mode === 'break'
                ? 'bg-[#262a34] text-[#38bdf8] shadow-inner font-bold border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Break
          </button>
          <button
            onClick={() => handleModeChange('exam')}
            className={`py-1.5 rounded-xl transition-all ${
              mode === 'exam'
                ? 'bg-[#262a34] text-[#f97316] shadow-inner font-bold border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            3h Exam
          </button>
          <button
            onClick={() => handleModeChange('stopwatch')}
            className={`py-1.5 rounded-xl transition-all ${
              mode === 'stopwatch'
                ? 'bg-[#262a34] text-[#a855f7] shadow-inner font-bold border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Stopwatch
          </button>
        </div>

        {/* Sub-presets for Focus and Break */}
        {mode === 'focus' && (
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            {[25, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setPresetFocusMin(mins);
                  const s = mins * 60;
                  setTotalSeconds(s);
                  setSecondsLeft(s);
                  setIsRunning(false);
                }}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
                  presetFocusMin === mins
                    ? 'bg-[#55e357]/20 text-[#55e357] border border-[#55e357]/40'
                    : 'bg-[#14161c] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        )}

        {mode === 'break' && (
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            {[5, 10, 15].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setPresetBreakMin(mins);
                  const s = mins * 60;
                  setTotalSeconds(s);
                  setSecondsLeft(s);
                  setIsRunning(false);
                }}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
                  presetBreakMin === mins
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                    : 'bg-[#14161c] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {mins}m Break
              </button>
            ))}
          </div>
        )}

        {/* Central Circular Progress Gauge Display */}
        <div className="flex flex-col items-center justify-center py-2 relative">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* SVG Progress Gauge */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 180 180">
              {/* Background Track */}
              <circle
                cx="90"
                cy="90"
                r={circleRadius}
                stroke="#1f232c"
                strokeWidth="7"
                fill="none"
              />
              {/* Progress Arc */}
              <circle
                cx="90"
                cy="90"
                r={circleRadius}
                stroke={modeColor.stroke}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                style={{
                  transition: isRunning ? 'stroke-dashoffset 0.5s ease-out' : 'none',
                }}
              />
            </svg>

            {/* Inner Content inside circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 select-none">
              <span
                className={`text-3xl sm:text-4xl font-mono font-black tracking-tight text-white ${
                  isRunning ? 'animate-pulse' : ''
                }`}
              >
                {formatted.main}
              </span>

              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mt-1 flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isRunning ? `${modeColor.bg} animate-ping` : 'bg-zinc-600'
                  }`}
                />
                <span>
                  {mode === 'focus'
                    ? 'Deep Focus'
                    : mode === 'break'
                    ? 'Recovery'
                    : mode === 'exam'
                    ? 'NEET Mock'
                    : 'Open Track'}
                </span>
              </div>

              {mode !== 'stopwatch' && (
                <span className="text-[10px] font-mono text-zinc-500 mt-0.5">
                  {Math.round(progressRatio * 100)}% done
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Active Target Chapter Pill with Checkpoint Status */}
        <div className="p-3 rounded-2xl bg-[#14161c] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
              <Target className="w-3.5 h-3.5 text-[#55e357]" />
              <span>Target Chapter</span>
            </div>
            {/* Quick checkpoint badges */}
            <div className="flex items-center gap-1 text-[9px] font-bold">
              <span
                className={`px-1.5 py-0.5 rounded-md ${
                  chapterProgress.ncert
                    ? 'bg-[#55e357]/20 text-[#55e357]'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                NCERT
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md ${
                  chapterProgress.pyqs
                    ? 'bg-[#55e357]/20 text-[#55e357]'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                PYQ
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md ${
                  chapterProgress.revision
                    ? 'bg-[#55e357]/20 text-[#55e357]'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                REV
              </span>
            </div>
          </div>

          <select
            value={state.selectedChapterId || (selectedChapter ? selectedChapter.id : '')}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="w-full text-xs font-semibold bg-[#191d24] border border-white/5 rounded-xl p-2.5 text-white truncate focus:outline-none focus:border-[#55e357]/40 cursor-pointer"
          >
            {allChapters &&
              allChapters.map((ch) => (
                <option key={ch.id} value={ch.id} className="bg-[#1a1d24] text-white">
                  [{ch.subject.slice(0, 4)}] {ch.title}
                </option>
              ))}
          </select>
        </div>

        {/* Main Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTimer}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-sleek active:scale-95 ${
              isRunning
                ? 'bg-[#f97316] hover:bg-[#ea580c] text-black shadow-orange-500/20'
                : 'bg-[#55e357] hover:bg-[#42ca44] text-black shadow-glow-lime'
            }`}
          >
            {isRunning ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>

          {mode === 'stopwatch' && stopwatchSeconds > 0 && (
            <button
              onClick={handleFinishStopwatch}
              className="px-4 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95"
              title="Finish session and log time"
            >
              Log Time
            </button>
          )}

          <button
            onClick={resetTimer}
            className="p-3 rounded-full bg-[#262a34] text-zinc-400 hover:text-white border border-white/5 hover:bg-white/10 transition active:scale-90"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Post-Session Milestone Card (appears right after finishing) */}
        {justCompletedSession && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#19231c] to-[#14161c] border border-[#55e357]/30 space-y-2.5 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#55e357]" />
                <span className="text-xs font-bold text-white">Session Logged! (+{justCompletedSession.minutes}m)</span>
              </div>
              <button
                onClick={() => setJustCompletedSession(null)}
                className="text-zinc-500 hover:text-white text-[10px]"
              >
                Dismiss
              </button>
            </div>
            <p className="text-[11px] text-zinc-300">
              Update checkpoint for <span className="font-bold text-white">{selectedChapter.title}</span>:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => toggleChapterStage(selectedChapter.id, 'ncert')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                  chapterProgress.ncert
                    ? 'bg-[#55e357] text-black border-[#55e357]'
                    : 'bg-[#262a34] text-zinc-300 border-white/5 hover:text-white'
                }`}
              >
                NCERT {chapterProgress.ncert ? '✓' : '+'}
              </button>
              <button
                onClick={() => toggleChapterStage(selectedChapter.id, 'pyqs')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                  chapterProgress.pyqs
                    ? 'bg-[#55e357] text-black border-[#55e357]'
                    : 'bg-[#262a34] text-zinc-300 border-white/5 hover:text-white'
                }`}
              >
                PYQs {chapterProgress.pyqs ? '✓' : '+'}
              </button>
              <button
                onClick={() => toggleChapterStage(selectedChapter.id, 'revision')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                  chapterProgress.revision
                    ? 'bg-[#55e357] text-black border-[#55e357]'
                    : 'bg-[#262a34] text-zinc-300 border-white/5 hover:text-white'
                }`}
              >
                Rev {chapterProgress.revision ? '✓' : '+'}
              </button>
            </div>
          </div>
        )}

        {/* Offline Study Quick Logger */}
        <div className="pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Quick log offline study:</span>
            <span className="font-mono text-zinc-500">Manual Entry</span>
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

      {/* Fullscreen Zen Focus Overlay Modal */}
      {isZenMode && (
        <div className="fixed inset-0 z-50 bg-[#0a0c0e]/98 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-12 animate-in fade-in duration-200">
          {/* Zen Header */}
          <div className="w-full max-w-4xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${modeColor.bg} animate-pulse`} />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Zen Mode • {mode}
              </span>
            </div>
            <button
              onClick={() => setIsZenMode(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e232c] hover:bg-[#282f3a] text-zinc-300 hover:text-white text-xs font-semibold transition border border-white/10"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Zen (Esc)</span>
            </button>
          </div>

          {/* Large Zen Radial Gauge */}
          <div className="flex flex-col items-center justify-center my-auto space-y-6">
            <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center">
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
                  stroke={modeColor.stroke}
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  style={{ transition: isRunning ? 'stroke-dashoffset 0.5s ease-out' : 'none' }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <span className="text-5xl sm:text-6xl font-mono font-black tracking-tight text-white">
                  {formatted.main}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mt-2">
                  {selectedChapter.title}
                </span>
                <span className="text-xs font-mono text-zinc-500 mt-1">
                  [{selectedChapter.subject}] • {Math.round(progressRatio * 100)}% complete
                </span>
              </div>
            </div>

            {/* Zen Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={resetTimer}
                className="p-3.5 rounded-full bg-[#1c2027] hover:bg-[#282f3a] text-zinc-400 hover:text-white border border-white/5 transition"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={toggleTimer}
                className={`px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition shadow-2xl active:scale-95 ${
                  isRunning
                    ? 'bg-[#f97316] text-black hover:bg-[#ea580c]'
                    : 'bg-[#55e357] text-black hover:bg-[#42ca44] shadow-glow-lime'
                }`}
              >
                {isRunning ? 'Pause (Space)' : 'Start (Space)'}
              </button>

              {/* Ambient Study Audio Toggle inside Zen Mode */}
              <button
                onClick={toggleMusicPlay}
                className={`p-3.5 rounded-full border transition ${
                  isMusicPlaying
                    ? 'bg-[#55e357]/20 border-[#55e357]/40 text-[#55e357]'
                    : 'bg-[#1c2027] hover:bg-[#282f3a] border-white/5 text-zinc-400 hover:text-white'
                }`}
                title={isMusicPlaying ? 'Pause Study Music' : 'Play Study Music'}
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
