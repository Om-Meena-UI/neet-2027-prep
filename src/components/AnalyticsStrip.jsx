import React from 'react';
import { Target, ChevronDown, ChevronUp, Sparkles, CheckCircle } from 'lucide-react';
import Heatmap from './Heatmap';
import { usePrep } from '../context/PrepContext';

export default function AnalyticsStrip() {
  const { metrics, state, toggleHeatmapCollapsed } = usePrep();
  const { overallReadiness, subjectStats, totalChapters, masteredChapters } = metrics;

  const subjectPillTheme = {
    Physics: { dot: 'bg-sky-400', bar: 'bg-sky-400' },
    Chemistry: { dot: 'bg-[#55e357]', bar: 'bg-[#55e357]' },
    Biology: { dot: 'bg-emerald-400', bar: 'bg-emerald-400' },
  };

  return (
    <div className="sleek-card p-6 relative overflow-hidden">
      {/* Background radial accent glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#55e357]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Big Hero Headline with Neon Accent, styled like "Miles Together Stories Forever!" */}
        <div className="md:col-span-5 flex flex-col justify-center pr-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#55e357] animate-ping" />
            <span className="text-xs uppercase font-bold tracking-widest text-[#55e357]">
              Syllabus Progress
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Target <span className="text-[#55e357]">NEET 2027</span>
            <br />
            Mission 700+
          </h2>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl sm:text-5xl font-mono font-black text-white">
              {overallReadiness}%
            </span>
            <span className="text-xs text-zinc-400">
              ({masteredChapters} of {totalChapters} chapters complete)
            </span>
          </div>
        </div>

        {/* Right: Subject progress bars in sleek pill containers */}
        <div className="md:col-span-7 space-y-3">
          {Object.entries(subjectStats).map(([subject, stat]) => {
            const theme = subjectPillTheme[subject] || { dot: 'bg-[#55e357]', bar: 'bg-[#55e357]' };
            return (
              <div key={subject} className="bg-[#14161c] border border-white/5 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                    <span className="font-semibold text-white">{subject}</span>
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

      {/* Heatmap Section Toggle */}
      <div className="mt-6 pt-4 border-t border-white/5">
        <button
          onClick={toggleHeatmapCollapsed}
          className="w-full flex items-center justify-between text-xs font-semibold text-zinc-400 hover:text-white transition py-1"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#55e357]" />
            <span>Consistency & 365-Day Activity Log</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <span>{state.heatmapCollapsed ? 'Show Heatmap' : 'Hide Heatmap'}</span>
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
  );
}
