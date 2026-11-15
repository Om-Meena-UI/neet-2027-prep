import React, { useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Flame, Award, Clock, CheckCircle2 } from 'lucide-react';
import { usePrep } from '../context/PrepContext';

export default function Heatmap() {
  const { state, consistency } = usePrep();

  const today = useMemo(() => new Date(), []);
  const oneYearAgo = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d;
  }, []);

  const heatmapValues = useMemo(() => {
    return Object.entries(state.dailyActivity || {}).map(([date, data]) => {
      const intensity = (data.minutes || 0) + (data.checks || 0) * 15;
      return {
        date,
        count: intensity,
        minutes: data.minutes || 0,
        checks: data.checks || 0,
      };
    });
  }, [state.dailyActivity]);

  const getClassForValue = (value) => {
    if (!value || value.count === 0) return 'color-empty';
    if (value.count < 30) return 'color-scale-1';
    if (value.count < 90) return 'color-scale-2';
    if (value.count < 180) return 'color-scale-3';
    return 'color-scale-4';
  };

  const getTitleForValue = (value) => {
    if (!value || !value.date) return 'No study recorded';
    const hrs = (value.minutes / 60).toFixed(1);
    return `${value.date}: ${value.minutes} mins (${hrs} hrs) study • ${value.checks} checks`;
  };

  return (
    <div className="space-y-4">
      {/* 4 Stat Badges styled in soft rounded cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#f97316]/10 text-[#f97316] flex items-center justify-center flex-shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white leading-tight">
              {consistency.currentStreak} <span className="text-[10px] font-sans font-normal text-zinc-400">days</span>
            </div>
            <div className="text-[10px] font-medium text-zinc-400">Current Streak</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white leading-tight">
              {consistency.bestStreak} <span className="text-[10px] font-sans font-normal text-zinc-400">days</span>
            </div>
            <div className="text-[10px] font-medium text-zinc-400">Best Streak</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#55e357]/10 text-[#55e357] flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white leading-tight">
              {consistency.todayMinutes} <span className="text-[10px] font-sans font-normal text-zinc-400">mins</span>
            </div>
            <div className="text-[10px] font-medium text-zinc-400">Today's Focus</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white leading-tight">
              {consistency.todayChecks} <span className="text-[10px] font-sans font-normal text-zinc-400">done</span>
            </div>
            <div className="text-[10px] font-medium text-zinc-400">Checks Today</div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid in rounded container */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#14161c] border border-white/5 overflow-x-auto">
        <div className="min-w-[650px]">
          <CalendarHeatmap
            startDate={oneYearAgo}
            endDate={today}
            values={heatmapValues}
            classForValue={getClassForValue}
            titleForValue={getTitleForValue}
            showWeekdayLabels
          />
        </div>
      </div>

      {/* Detailed Study Hours Color Scale Legend */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#14161c] border border-white/5 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white uppercase tracking-wider text-[10px]">
            Study Hours Color Scale
          </span>
          <span className="text-[11px] text-zinc-400">Hover over any square for exact hours & checks</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1a1d24] border border-white/5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#181b22] border border-white/10 flex-shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-zinc-300">0 Hours</div>
              <div className="text-[9px] text-zinc-500">Rest / No log</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1a1d24] border border-white/5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#1f4727] flex-shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-emerald-400">&lt; 30 Mins</div>
              <div className="text-[9px] text-zinc-400">Quick review</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1a1d24] border border-white/5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#277735] flex-shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-emerald-300">30m – 1.5h</div>
              <div className="text-[9px] text-zinc-400">1–2 Pomodoros</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1a1d24] border border-white/5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#39b54a] flex-shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-[#55e357]">1.5h – 3h</div>
              <div className="text-[9px] text-zinc-400">Deep study block</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1a1d24] border border-[#55e357]/20 shadow-glow-lime">
            <span className="w-3.5 h-3.5 rounded-md bg-[#55e357] shadow-sm flex-shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-[#55e357]">3+ Hours</div>
              <div className="text-[9px] text-zinc-300 font-medium">NEET Marathon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
