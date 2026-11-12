import React, { useState, useEffect } from 'react';
import { Pencil, Calendar, Check, X } from 'lucide-react';
import { usePrep } from '../context/PrepContext';

export default function CountdownCard() {
  const { state, setCountdownTarget } = usePrep();
  const [isEditing, setIsEditing] = useState(false);
  const [inputDate, setInputDate] = useState(state.countdownTarget);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setInputDate(state.countdownTarget);
  }, [state.countdownTarget]);

  useEffect(() => {
    const calculate = () => {
      const targetTime = new Date(state.countdownTarget).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, targetTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [state.countdownTarget]);

  const handleSave = () => {
    if (inputDate) {
      setCountdownTarget(inputDate);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">NEET 2027 Countdown</h3>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Edit Target Date"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      {isEditing ? (
        <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Target Exam Date & Time
          </label>
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={inputDate.slice(0, 16)}
              onChange={(e) => setInputDate(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={handleSave}
              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              title="Save"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setInputDate(state.countdownTarget);
                setIsEditing(false);
              }}
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Grid of countdown digits */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-xl p-2.5">
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {timeLeft.days}
          </div>
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Days</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-xl p-2.5">
          <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-200">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Hours</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-xl p-2.5">
          <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-200">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Mins</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-xl p-2.5">
          <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-200">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Secs</div>
        </div>
      </div>
      <div className="mt-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        Estimated: First Sunday of May 2027 (2:00 PM IST)
      </div>
    </div>
  );
}
