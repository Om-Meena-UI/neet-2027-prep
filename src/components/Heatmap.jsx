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
            showWeekdayLabels
          />
        </div>
      </div>

      {/* Sleek Legend with rounded pill badges */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-2">
        <span>Less consistent</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#181b22] inline-block border border-white/5" />
          <span className="w-3 h-3 rounded-md bg-[#1f4727] inline-block" />
          <span className="w-3 h-3 rounded-md bg-[#277735] inline-block" />
          <span className="w-3 h-3 rounded-md bg-[#39b54a] inline-block" />
          <span className="w-3 h-3 rounded-md bg-[#55e357] inline-block shadow-glow-lime" />
        </div>
        <span className="text-[#55e357] font-semibold">High focus (3h+)</span>
      </div>
    </div>
  );
}
