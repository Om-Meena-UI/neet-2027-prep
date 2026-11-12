import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Target } from 'lucide-react';
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
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">Focus & Exam Timer</h3>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => setMode('pomodoro')}
            className={`px-3 py-1 rounded-md transition-colors ${
              mode === 'pomodoro'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            25m Sprint
          </button>
          <button
            onClick={() => setMode('exam')}
            className={`px-3 py-1 rounded-md transition-colors ${
              mode === 'exam'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            180m Mock Exam
          </button>
        </div>
      </div>

      {/* Linked chapter picker */}
      <div className="mb-4">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
          <Target className="w-3.5 h-3.5 text-emerald-500" />
          Focusing on Chapter
        </label>
        <select
          value={state.selectedChapterId || (selectedChapter ? selectedChapter.id : '')}
          onChange={(e) => setSelectedChapterId(e.target.value)}
          className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 truncate focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {allChapters.map((ch) => (
            <option key={ch.id} value={ch.id}>
              [{ch.subject.slice(0, 4)}] {ch.title}
            </option>
          ))}
        </select>
      </div>

      {/* Big Digit display */}
      <div className="text-center py-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80 mb-4">
        <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {formatTime(secondsLeft)}
        </div>
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
          {mode === 'pomodoro' ? 'Pomodoro Session' : 'Full 3h NEET Simulation'}
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={toggleTimer}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          {isRunning ? 'Pause' : 'Start Focus'}
        </button>
        <button
          onClick={resetTimer}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Manual Quick Add */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">Log past study:</span>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="5"
            step="5"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            className="w-14 text-xs font-mono p-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-center"
          />
          <span className="text-xs text-slate-500">mins</span>
          <button
            onClick={handleManualLog}
            className="px-2.5 py-1 text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded font-medium transition"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
