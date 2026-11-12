import React from 'react';
import { Target, ChevronDown, ChevronUp } from 'lucide-react';
import Heatmap from './Heatmap';
import { usePrep } from '../context/PrepContext';

export default function AnalyticsStrip() {
  const { metrics, state, toggleHeatmapCollapsed } = usePrep();
  const { overallReadiness, subjectStats, totalChapters, masteredChapters } = metrics;

  const subjectTheme = {
    Physics: { bar: 'bg-indigo-500', text: 'text-indigo-500' },
    Chemistry: { bar: 'bg-emerald-500', text: 'text-emerald-500' },
    Biology: { bar: 'bg-teal-500', text: 'text-teal-500' },
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Top row: Readiness dial & subject progress */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Overall Readiness Metric */}
        <div className="md:col-span-4 flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-4 md:pb-0 md:pr-4">
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-700 ease-out"
                strokeDasharray={`${overallReadiness}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white leading-none">
                {overallReadiness}%
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              Syllabus Readiness
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {masteredChapters} of {totalChapters} chapters done
            </div>
            <p className="text-[11px] text-slate-500">3 checkpoints per chapter (NCERT, PYQs, Revision)</p>
          </div>
        </div>

        {/* Right: 3 Subject Progress Bars */}
        <div className="md:col-span-8 space-y-3">
          {Object.entries(subjectStats).map(([subject, stat]) => {
            const theme = subjectTheme[subject] || { bar: 'bg-indigo-500', text: 'text-indigo-500' };
            return (
              <div key={subject} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">
                      {stat.masteredChapters}/{stat.totalChapters} chapters
                    </span>
                    <span className={`font-mono ${theme.text}`}>{stat.percent}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${theme.bar}`}
                    style={{ width: `${stat.percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap header toggle */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={toggleHeatmapCollapsed}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition py-1"
        >
          <span>Daily Consistency Heatmap (Last 365 Days)</span>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>{state.heatmapCollapsed ? 'Show Heatmap' : 'Hide Heatmap'}</span>
            {state.heatmapCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </button>

        {!state.heatmapCollapsed && (
          <div className="mt-3">
            <Heatmap />
          </div>
        )}
      </div>
    </div>
  );
}
