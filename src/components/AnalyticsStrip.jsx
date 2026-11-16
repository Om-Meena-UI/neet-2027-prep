import React, { useState } from 'react';
import { Target, ChevronDown, ChevronUp, Sparkles, Flame, Award, Clock, CheckCircle2 } from 'lucide-react';
import Heatmap from './Heatmap';
import { usePrep } from '../context/PrepContext';

export default function AnalyticsStrip() {
  const { metrics, state, consistency, toggleHeatmapCollapsed } = usePrep();
  const { overallReadiness, subjectStats, totalChapters, masteredChapters } = metrics;

  const dailyHoursGoal = state.settings?.dailyHoursGoal || 8;
  const targetMinutes = dailyHoursGoal * 60;

  // Generate 7-day rolling mini calendar strip like Habify reference image
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekDays = [];
  const today = new Date();
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const dayActivity = state.dailyActivity?.[dateStr] || {};
    const minutes = dayActivity.minutes || 0;
    const checks = dayActivity.checks || 0;
    const hasActivity = Boolean(minutes > 0 || checks > 0);
    const exceededTarget = minutes >= targetMinutes && targetMinutes > 0;

    let activityLabel = '';
    if (minutes >= 60) {
      activityLabel = `${(minutes / 60).toFixed(1)}h`;
    } else if (minutes > 0) {
      activityLabel = `${minutes}m`;
    } else if (checks > 0) {
      activityLabel = `${checks}ch`;
    }

    weekDays.push({
      dateStr,
      dayNum: d.getDate(),
      dayName: daysOfWeek[d.getDay()],
      isToday,
      hasActivity,
      exceededTarget,
      activityLabel,
    });
  }

  const subjectPillTheme = {
    Physics: { dot: 'bg-sky-400', bar: 'bg-sky-400' },
    Chemistry: { dot: 'bg-[#55e357]', bar: 'bg-[#55e357]' },
    Biology: { dot: 'bg-emerald-400', bar: 'bg-emerald-400' },
  };

  return (
    <div className="space-y-4">
      {/* Habify-Style Top Streak & Day-Pill Strip (High impact on Mobile) */}
      <div className="sleek-card p-4 sm:p-5 relative overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#f97316]/10 to-[#55e357]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Streak Banner styled after "Keep up your streak! 68 Days" */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f97316]/10 border border-[#f97316]/30 flex flex-col items-center justify-center text-[#f97316] flex-shrink-0">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono leading-none">
                {consistency.currentStreak}{' '}
                <span className="text-xs font-sans font-normal text-zinc-400">Days</span>
              </div>
              <div className="text-xs font-bold text-[#f97316] uppercase tracking-wider mt-0.5">
                Keep up your streak!
              </div>
            </div>
          </div>

          {/* 5-Day Habify Date Pills */}
          <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            {weekDays.map((d) => (
              <div
                key={d.dateStr}
                className={`flex flex-col items-center justify-center w-12 h-14 rounded-2xl border transition-all ${
                  d.exceededTarget
                    ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-black border-amber-300 font-black shadow-[0_0_15px_rgba(251,191,36,0.55)] ring-1 ring-amber-300/80 scale-105'
                    : d.isToday
                    ? 'bg-[#55e357] text-black border-[#55e357] font-bold shadow-glow-lime'
                    : d.hasActivity
                    ? 'bg-[#262a34] text-white border-white/20'
                    : 'bg-[#14161c] text-zinc-400 border-white/5'
                }`}
                title={d.exceededTarget ? `🏆 Target Exceeded! (${d.activityLabel} vs ${dailyHoursGoal}h goal)` : undefined}
              >
                <span className="text-[10px] uppercase font-semibold leading-none">{d.dayName}</span>
                <span className="text-sm font-black font-mono mt-1 leading-none">{d.dayNum}</span>
                {d.activityLabel ? (
                  <span
                    className={`text-[9px] font-mono font-bold leading-none mt-1 flex items-center gap-0.5 ${
                      d.exceededTarget ? 'text-black font-black' : d.isToday ? 'text-black/80' : 'text-[#55e357]'
                    }`}
                  >
                    {d.exceededTarget && '★'}{d.activityLabel}
                  </span>
                ) : (
                  <span className="w-1 h-1 rounded-full bg-transparent mt-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Readiness & Subject Progress Card */}
      <div className="sleek-card p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Overall Readiness Metric */}
          <div className="md:col-span-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#55e357]" />
              <span className="text-xs font-bold text-zinc-300">
                {state.settings?.dreamCollege || 'AIIMS New Delhi'} • Target {state.settings?.targetScore || 700}+
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Syllabus Roadmap
            </h1>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl sm:text-5xl font-mono font-black text-white">
                {overallReadiness}%
              </span>
              <span className="text-xs text-zinc-400">
                ({masteredChapters} of {totalChapters} chapters done)
              </span>
            </div>
          </div>

          {/* Subject Progress Pill Bars */}
          <div className="md:col-span-7 space-y-2.5">
            {Object.entries(subjectStats).map(([subject, stat]) => {
              const theme = subjectPillTheme[subject] || { dot: 'bg-[#55e357]', bar: 'bg-[#55e357]' };
              return (
                <div key={subject} className="bg-[#14161c] border border-white/5 rounded-2xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                      <span className="font-bold text-white">{subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
                      <span>{stat.masteredChapters}/{stat.totalChapters} Ch</span>
                      <span className="text-white font-bold">{stat.percent}%</span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[#20242f] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${theme.bar}`}
                      style={{ width: `${stat.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Heatmap Accordion Toggle */}
        <div className="pt-3 border-t border-white/5">
          <button
            onClick={toggleHeatmapCollapsed}
            className="w-full flex items-center justify-between text-xs font-semibold text-zinc-400 hover:text-white transition py-1"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#55e357]" />
              <span>Full 365-Day Consistency Heatmap</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
              <span>{state.heatmapCollapsed ? 'Show' : 'Hide'}</span>
              {state.heatmapCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </div>
          </button>

          {!state.heatmapCollapsed && (
            <div className="mt-4">
              <Heatmap />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
