import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Target, CheckCircle2 } from 'lucide-react';
import { usePrep } from '../context/PrepContext';

export default function DualTimer() {
  const { allChapters, state, setSelectedChapterId, logFocusMinutes } = usePrep();

  const [mode, setMode] = useState('pomodoro'); // 'pomodoro' | 'exam'
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);

  const selectedChapter = allChapters.find((c) => c.id === state.selectedChapterId) || allChapters[0];

  useEffect(() => {
    if (mode === 'pomodoro') {
      setSecondsLeft(25 * 60);
    } else {
      setSecondsLeft(180 * 60);
    }
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && secondsLeft === 0) {
      setIsRunning(false);
      const sessionDuration = mode === 'pomodoro' ? 25 : 180;
      logFocusMinutes(sessionDuration);
      alert(`🎉 Session completed! ${sessionDuration} minutes logged to your streak.`);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, mode, logFocusMinutes]);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(mode === 'pomodoro' ? 25 * 60 : 180 * 60);
  };

  const handleManualLog = () => {
    const mins = parseInt(customMinutes, 10);
    if (!isNaN(mins) && mins > 0) {
      logFocusMinutes(mins);
    }
  };

  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="sleek-card p-6 space-y-5">
      {/* Header and Mode Pills */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#55e357]" />
          <h3 className="font-bold text-white text-sm tracking-tight">Focus & Exam Timer</h3>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex bg-[#14161c] p-1 rounded-full border border-white/5 text-xs font-medium">
          <button
            onClick={() => setMode('pomodoro')}
            className={`px-3 py-1 rounded-full transition-all ${
              mode === 'pomodoro'
                ? 'bg-[#262a34] text-white font-semibold shadow-inner border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            25m Sprint
          </button>
          <button
            onClick={() => setMode('exam')}
            className={`px-3 py-1 rounded-full transition-all ${
              mode === 'exam'
                ? 'bg-[#262a34] text-white font-semibold shadow-inner border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            180m Exam
          </button>
        </div>
      </div>

      {/* Linked Chapter Selector styled as sleek capsule */}
      <div>
        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
          <Target className="w-3.5 h-3.5 text-[#55e357]" />
          Target Chapter
        </label>
        <select
          value={state.selectedChapterId || (selectedChapter ? selectedChapter.id : '')}
          onChange={(e) => setSelectedChapterId(e.target.value)}
          className="w-full text-xs font-medium bg-[#14161c] border border-white/5 rounded-2xl p-3 text-white truncate focus:outline-none focus:border-[#55e357]/40 cursor-pointer"
        >
          {allChapters.map((ch) => (
            <option key={ch.id} value={ch.id} className="bg-[#1a1d24] text-white">
              [{ch.subject.slice(0, 4)}] {ch.title}
            </option>
          ))}
        </select>
      </div>

      {/* Big Digits Display with sleek dark circular styling */}
      <div className="text-center py-5 bg-[#14161c] rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-white">
          {formatTime(secondsLeft)}
        </div>
        <div className="text-[11px] font-medium text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#55e357]" />
          {mode === 'pomodoro' ? 'Pomodoro Session' : '3-Hour Full Mock Simulation'}
        </div>
      </div>

      {/* Controls styled like the reference buttons ("Get Started", "View demo") */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTimer}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-sleek ${
            isRunning
              ? 'bg-[#f97316] text-black hover:bg-[#ea580c]'
              : 'bg-[#55e357] text-black hover:bg-[#42ca44] shadow-glow-lime'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          {isRunning ? 'Pause Session' : 'Start Focus'}
        </button>

        <button
          onClick={resetTimer}
          className="p-3 rounded-full bg-[#262a34] text-zinc-400 hover:text-white border border-white/5 transition"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Manual Quick Add */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-zinc-400 text-[11px]">Log offline study:</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="5"
            step="5"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            className="w-14 text-xs font-mono p-1 rounded-xl bg-[#14161c] border border-white/10 text-white text-center focus:outline-none"
          />
          <span className="text-[11px] text-zinc-400">mins</span>
          <button
            onClick={handleManualLog}
            className="px-3 py-1 rounded-full bg-[#262a34] hover:bg-[#323744] text-white text-[11px] font-semibold border border-white/5 transition"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
