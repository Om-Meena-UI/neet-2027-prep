import React, { useState, useEffect } from 'react';
import { Pencil, Calendar, Check, X, Compass } from 'lucide-react';
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
    <div className="sleek-card p-6 relative overflow-hidden">
      {/* Background glow circle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#55e357]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
          <h3 className="font-bold text-white text-sm tracking-tight">NEET 2027 Countdown</h3>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-[#262a34] transition"
          title="Change Target Date"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      {isEditing && (
        <div className="mb-4 p-3 bg-[#14161c] rounded-2xl border border-white/5 space-y-2">
          <label className="block text-[11px] font-medium text-zinc-400">
            Target Exam Date & Time
          </label>
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={inputDate.slice(0, 16)}
              onChange={(e) => setInputDate(e.target.value)}
              className="text-xs p-2 rounded-xl border border-white/10 bg-[#1a1d24] text-white flex-1 focus:outline-none focus:border-[#55e357]"
            />
            <button
              onClick={handleSave}
              className="p-2 rounded-xl bg-[#55e357] text-black font-bold hover:bg-[#42ca44] transition"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setInputDate(state.countdownTarget);
                setIsEditing(false);
              }}
              className="p-2 rounded-xl bg-[#262a34] text-zinc-300 hover:bg-[#323744] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4 Sleek Digit Cells styled in dark rounded cards */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-3">
          <div className="text-2xl font-black font-mono text-[#55e357]">
            {timeLeft.days}
          </div>
          <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider mt-0.5">Days</div>
        </div>

        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-3">
          <div className="text-2xl font-black font-mono text-white">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider mt-0.5">Hours</div>
        </div>

        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-3">
          <div className="text-2xl font-black font-mono text-white">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider mt-0.5">Mins</div>
        </div>

        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-3">
          <div className="text-2xl font-black font-mono text-white">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider mt-0.5">Secs</div>
        </div>
      </div>

      <div className="mt-3 text-center text-[11px] text-zinc-400">
        Scheduled: First Sunday of May 2027 (2:00 PM IST)
      </div>
    </div>
  );
}
