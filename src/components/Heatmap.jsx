import React, { useState, useMemo, useRef, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Flame, Award, Clock, CheckCircle2, Sparkles, Calendar, ChevronRight, X } from 'lucide-react';
import { usePrep } from '../context/PrepContext';

export default function Heatmap() {
  const { state, consistency } = usePrep();
  const scrollContainerRef = useRef(null);

  const dailyHoursGoal = state.settings?.dailyHoursGoal || 8;
  const targetMinutes = dailyHoursGoal * 60;
  const isTodayTargetExceeded = (consistency.todayMinutes || 0) >= targetMinutes && targetMinutes > 0;

  // Selected day for interactive mobile tap inspection
  const [selectedDay, setSelectedDay] = useState(null);

  // Mobile mode: 'fit' shows the entire 365 days on screen at once; 'scroll' enables zoomed horizontal scrolling
  const [mobileMode, setMobileMode] = useState('fit');

  const today = useMemo(() => new Date(), []);

  // Standard 365-day (1 year) range with compact, sleek GitHub-style cells
  const startDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d;
  }, []);

  // Auto-scroll to today (far right) on mount so recent activity is instantly in view on mobile
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      setTimeout(() => {
        el.scrollLeft = el.scrollWidth;
      }, 50);
    }
  }, []);

  const heatmapValues = useMemo(() => {
    return Object.entries(state.dailyActivity || {}).map(([date, data]) => {
      const mins = data.minutes || 0;
      const chks = data.checks || 0;
      const intensity = mins + chks * 15;
      const exceededTarget = mins >= targetMinutes && targetMinutes > 0;

      return {
        date,
        count: intensity,
        minutes: mins,
        checks: chks,
        exceededTarget,
      };
    });
  }, [state.dailyActivity, targetMinutes]);

  const getClassForValue = (value) => {
    if (!value || value.count === 0) return 'color-empty';
    // Special Radiant Golden Tier when daily study target is met or exceeded
    if (value.exceededTarget) return 'color-scale-gold';
    if (value.count < 30) return 'color-scale-1';
    if (value.count < 90) return 'color-scale-2';
    if (value.count < 180) return 'color-scale-3';
    return 'color-scale-4';
  };

  const getTitleForValue = (value) => {
    if (!value || !value.date) return 'No study recorded';
    const hrs = (value.minutes / 60).toFixed(1);
    if (value.exceededTarget) {
      return `⭐ ${value.date}: ${value.minutes}m (${hrs} hrs) — TARGET EXCEEDED! (Goal: ${dailyHoursGoal}h) • ${value.checks} checks`;
    }
    return `${value.date}: ${value.minutes} mins (${hrs} hrs) study • ${value.checks} checks`;
  };

  const handleCellClick = (val) => {
    if (val && val.date) {
      setSelectedDay(val);
    } else {
      setSelectedDay(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 4 Stat Badges styled in soft rounded cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#f97316]/10 text-[#f97316] flex items-center justify-center flex-shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold font-mono text-white leading-tight truncate">
              {consistency.currentStreak} <span className="text-[10px] font-sans font-normal text-zinc-400">days</span>
            </div>
            <div className="text-[10px] font-medium text-zinc-400 truncate">Current Streak</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold font-mono text-white leading-tight truncate">
              {consistency.bestStreak} <span className="text-[10px] font-sans font-normal text-zinc-400">days</span>
            </div>
            <div className="text-[10px] font-medium text-zinc-400 truncate">Best Streak</div>
          </div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
            isTodayTargetExceeded
              ? 'bg-[#181a20] border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.15)] ring-1 ring-amber-400/30'
              : 'bg-[#14161c] border-white/5'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              isTodayTargetExceeded
                ? 'bg-amber-400 text-black shadow-md font-bold'
                : 'bg-[#55e357]/10 text-[#55e357]'
            }`}
          >
            {isTodayTargetExceeded ? <Sparkles className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold font-mono text-white leading-tight flex items-center gap-1.5 truncate">
              <span>{consistency.todayMinutes}</span>
              <span className="text-[10px] font-sans font-normal text-zinc-400">mins</span>
              {isTodayTargetExceeded && (
                <span className="text-[8px] font-black uppercase px-1 py-0.5 rounded bg-amber-400 text-black hidden sm:inline">
                  Goal Met! 🏆
                </span>
              )}
            </div>
            <div className="text-[10px] font-medium text-zinc-400 truncate">
              Today ({dailyHoursGoal}h goal)
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold font-mono text-white leading-tight truncate">
              {consistency.todayChecks} <span className="text-[10px] font-sans font-normal text-zinc-400">done</span>
            </div>
            <div className="text-[10px] font-medium text-zinc-400 truncate">Checks Today</div>
          </div>
        </div>
      </div>

      {/* Heatmap Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#14161c] border border-white/5 space-y-3">
        {/* Top Bar inside Heatmap */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar className="w-4 h-4 text-[#55e357] flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide uppercase truncate">
              Consistency Map
            </span>
          </div>

          {/* Mobile Display Mode Pill: Fit Year (100% of year visible) vs Scroll */}
          <div className="sm:hidden flex items-center bg-[#1a1d24] p-0.5 rounded-xl border border-white/5 text-[10px] font-bold flex-shrink-0">
            <button
              type="button"
              onClick={() => setMobileMode('fit')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all active:scale-95 ${
                mobileMode === 'fit'
                  ? 'bg-[#55e357] text-black shadow-glow-lime'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Fit Year
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMode('scroll');
                setTimeout(() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
                  }
                }, 50);
              }}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all active:scale-95 ${
                mobileMode === 'scroll'
                  ? 'bg-[#55e357] text-black shadow-glow-lime'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Scroll
            </button>
          </div>

          <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
            Today is on the right 👉
          </span>
        </div>

        {/* Heatmap Rendering */}
        {mobileMode === 'fit' ? (
          /* FIT SCREEN MODE: Fits the ENTIRE 365-day year on the mobile screen at once with zero horizontal scrolling */
          <div className="w-full py-1">
            <CalendarHeatmap
              startDate={startDate}
              endDate={today}
              values={heatmapValues}
              classForValue={getClassForValue}
              titleForValue={getTitleForValue}
              onClick={handleCellClick}
              showWeekdayLabels={false}
            />
          </div>
        ) : (
          /* ZOOM SCROLL MODE: Scrollable detailed view with auto-scroll to today */
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto no-scrollbar scroll-smooth py-1"
          >
            <div className="min-w-[680px]">
              <CalendarHeatmap
                startDate={startDate}
                endDate={today}
                values={heatmapValues}
                classForValue={getClassForValue}
                titleForValue={getTitleForValue}
                onClick={handleCellClick}
                showWeekdayLabels
              />
            </div>
          </div>
        )}

        {/* Context Cue for Mobile */}
        <div className="sm:hidden flex items-center justify-between text-[10px] text-zinc-400 px-1 pt-0.5">
          {mobileMode === 'fit' ? (
            <>
              <span className="text-[#55e357]">● Whole 365 days on screen</span>
              <span>Tap square to inspect 👆</span>
            </>
          ) : (
            <>
              <span>👈 Swipe to view earlier months</span>
              <span className="font-mono text-[#55e357]">Today is on the right 👉</span>
            </>
          )}
        </div>

        {/* Interactive Tap-to-Inspect Card for Mobile Users */}
        {selectedDay && (
          <div className="p-3 rounded-2xl bg-[#191d24] border border-white/10 flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-3 h-3 rounded-md flex-shrink-0 ${
                  selectedDay.exceededTarget
                    ? 'bg-[#fbbf24] shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : selectedDay.minutes > 0
                    ? 'bg-[#55e357]'
                    : 'bg-[#181b22] border border-white/10'
                }`}
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  <span>{selectedDay.date}</span>
                  {selectedDay.exceededTarget && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-400 text-black font-black uppercase">
                      Target Exceeded ⭐
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono truncate">
                  {selectedDay.minutes > 0
                    ? `${selectedDay.minutes}m (${(selectedDay.minutes / 60).toFixed(1)}h) focus • ${selectedDay.checks || 0} checks completed`
                    : 'No study logged on this day'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition flex-shrink-0"
              title="Close inspection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Detailed Study Hours Color Scale Legend (Horizontally scrollable on mobile) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#14161c] border border-white/5 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white uppercase tracking-wider text-[10px]">
            Study Hours Color Scale
          </span>
          <span className="text-[11px] text-zinc-400">
            Target: <span className="font-bold text-amber-400">{dailyHoursGoal}h / day</span>
          </span>
        </div>

        {/* Horizontal swipeable bar on mobile, 6-col grid on desktop */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:grid sm:grid-cols-3 lg:grid-cols-6 pt-1">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1a1d24] border border-white/5 flex-shrink-0 sm:flex-shrink">
            <span className="w-3.5 h-3.5 rounded-md bg-[#181b22] border border-white/10 flex-shrink-0" />
            <div className="whitespace-nowrap sm:whitespace-normal">
              <div className="text-[11px] font-bold text-zinc-300">0 Hours</div>
              <div className="text-[9px] text-zinc-500">Rest / No log</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1a1d24] border border-white/5 flex-shrink-0 sm:flex-shrink">
            <span className="w-3.5 h-3.5 rounded-md bg-[#1f4727] flex-shrink-0" />
            <div className="whitespace-nowrap sm:whitespace-normal">
              <div className="text-[11px] font-bold text-emerald-400">&lt; 30 Mins</div>
              <div className="text-[9px] text-zinc-400">Quick review</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1a1d24] border border-white/5 flex-shrink-0 sm:flex-shrink">
            <span className="w-3.5 h-3.5 rounded-md bg-[#277735] flex-shrink-0" />
            <div className="whitespace-nowrap sm:whitespace-normal">
              <div className="text-[11px] font-bold text-emerald-300">30m – 1.5h</div>
              <div className="text-[9px] text-zinc-400">1–2 Pomodoros</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1a1d24] border border-white/5 flex-shrink-0 sm:flex-shrink">
            <span className="w-3.5 h-3.5 rounded-md bg-[#39b54a] flex-shrink-0" />
            <div className="whitespace-nowrap sm:whitespace-normal">
              <div className="text-[11px] font-bold text-[#55e357]">1.5h – 3h</div>
              <div className="text-[9px] text-zinc-400">Deep block</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1a1d24] border border-[#55e357]/20 flex-shrink-0 sm:flex-shrink">
            <span className="w-3.5 h-3.5 rounded-md bg-[#55e357] shadow-sm flex-shrink-0" />
            <div className="whitespace-nowrap sm:whitespace-normal">
              <div className="text-[11px] font-bold text-[#55e357]">3+ Hours</div>
              <div className="text-[9px] text-zinc-400">Marathon</div>
            </div>
          </div>

          {/* Golden Tier: Target Met / Exceeded */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1e1c15] border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.18)] flex-shrink-0 sm:flex-shrink">
            <span className="w-3.5 h-3.5 rounded-md bg-[#fbbf24] border border-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.7)] flex-shrink-0" />
            <div className="whitespace-nowrap sm:whitespace-normal">
              <div className="text-[11px] font-black text-amber-400 flex items-center gap-1">
                <span>{dailyHoursGoal}+ Hours</span>
                <span className="text-[10px]">⭐</span>
              </div>
              <div className="text-[9px] text-amber-300/80 font-medium">Goal Exceeded</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
