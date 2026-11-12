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
      // data: { minutes, checks }
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
    if (!value || value.count === 0) {
      return 'color-empty';
    }
    if (value.count < 30) return 'color-scale-1';
    if (value.count < 90) return 'color-scale-2';
    if (value.count < 180) return 'color-scale-3';
    return 'color-scale-4';
  };

  return (
    <div className="space-y-4">
      {/* 4 Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white leading-tight">
              {consistency.currentStreak} <span className="text-xs font-sans font-normal text-slate-500">days</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500">Current Streak</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white leading-tight">
              {consistency.bestStreak} <span className="text-xs font-sans font-normal text-slate-500">days</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500">Best Streak</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white leading-tight">
              {consistency.todayMinutes} <span className="text-xs font-sans font-normal text-slate-500">mins</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500">Today's Focus</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white leading-tight">
              {consistency.todayChecks} <span className="text-xs font-sans font-normal text-slate-500">done</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500">Checks Today</div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[650px]">
          <CalendarHeatmap
            startDate={oneYearAgo}
            endDate={today}
            values={heatmapValues}
            classForValue={getClassForValue}
            showWeekdayLabels
            tooltipDataAttrs={(value) => {
              if (!value || !value.date) {
                return { 'data-tip': 'No study logged' };
              }
              return {
                'data-tip': `${value.date}: ${value.minutes || 0}m focus, ${value.checks || 0} checks`,
              };
            }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
        <span>Less consistent</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-800 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-950 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-800 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-400 inline-block" />
        </div>
        <span>High focus (3h+)</span>
      </div>
    </div>
  );
}
