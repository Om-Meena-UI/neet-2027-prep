import React, { useState, useEffect } from 'react';
import { Calendar, Edit3, Check, Sparkles } from 'lucide-react';

export default function Countdown({ targetDate, onUpdateTargetDate, chapters = [] }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [dateInput, setDateInput] = useState(targetDate ? targetDate.slice(0, 16) : '2027-05-02T14:00');

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  // Calculate overall syllabus readiness across all checkboxes
  const totalCheckboxes = chapters.length * 5;
  const completedCheckboxes = chapters.reduce((acc, ch) => {
    const c = ch.checks || {};
    return (
      acc +
      (c.ncert ? 1 : 0) +
      (c.dpp ? 1 : 0) +
      (c.jeeMains ? 1 : 0) +
      (c.neetPyq ? 1 : 0) +
      (c.referenceBook ? 1 : 0)
    );
  }, 0);

  const readinessPercent =
    totalCheckboxes > 0 ? Math.round((completedCheckboxes / totalCheckboxes) * 100) : 0;

  const handleSaveDate = () => {
    if (dateInput) {
      onUpdateTargetDate(new Date(dateInput).toISOString());
    }
    setIsEditing(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              NEET 2027 Countdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(targetDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Edit Target Exam Date"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {isEditing && (
        <div className="mb-4 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/70 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          />
          <button
            onClick={handleSaveDate}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      )}

      {/* Ticking Numerals */}
      <div className="grid grid-cols-4 gap-2 my-3 text-center">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: String(timeLeft.hours).padStart(2, '0') },
          { label: 'Mins', value: String(timeLeft.minutes).padStart(2, '0') },
          { label: 'Secs', value: String(timeLeft.seconds).padStart(2, '0') },
        ].map((unit) => (
          <div
            key={unit.label}
            className="rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 py-2.5 px-1"
          >
            <div className="text-xl sm:text-2xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
              {unit.value}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {unit.label}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Syllabus Readiness Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Overall Prep Readiness
          </span>
          <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {readinessPercent}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${readinessPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 text-right">
          {completedCheckboxes} / {totalCheckboxes} tasks completed
        </p>
      </div>
    </div>
  );
}