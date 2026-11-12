import React from 'react';
import { Target, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import CountdownCard from './CountdownCard';
import DualTimer from './DualTimer';
import { usePrep } from '../context/PrepContext';

export default function Sidebar() {
  const { allChapters, state, toggleChapterAll, setSelectedChapterId } = usePrep();

  // Smart Focus Queue: find high-yield unmastered chapters first, then moderate
  const uncompletedHighYield = allChapters
    .filter((ch) => {
      const prog = state.chapterProgress[ch.id] || {};
      const isMastered = prog.ncert && prog.pyqs && prog.revision;
      return !isMastered && ch.weightage === 'High Yield';
    })
    .slice(0, 4);

  const additionalRecommendations =
    uncompletedHighYield.length < 4
      ? allChapters
          .filter((ch) => {
            const prog = state.chapterProgress[ch.id] || {};
            const isMastered = prog.ncert && prog.pyqs && prog.revision;
            return !isMastered && ch.weightage === 'Moderate';
          })
          .slice(0, 4 - uncompletedHighYield.length)
      : [];

  const focusQueue = [...uncompletedHighYield, ...additionalRecommendations];

  return (
    <aside className="space-y-5">
      <CountdownCard />
      <DualTimer />

      {/* Smart Focus Queue (Today's High Yield Picks) */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Smart Focus Queue</h3>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            High Priority
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Algorithmic picks: Unmastered high-weightage chapters with highest score impact.
        </p>

        {focusQueue.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            🎉 Incredible work! All high-yield chapters are mastered!
          </div>
        ) : (
          <div className="space-y-2">
            {focusQueue.map((ch) => {
              const prog = state.chapterProgress[ch.id] || {};
              const doneCount = ['ncert', 'pyqs', 'revision'].filter((s) => Boolean(prog[s])).length;

              return (
                <div
                  key={ch.id}
                  className="group p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {ch.subject}
                      </span>
                      <span className="text-[10px] text-slate-400">{ch.className}</span>
                    </div>
                    <button
                      onClick={() => setSelectedChapterId(ch.id)}
                      className="text-xs font-semibold text-left text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block w-full"
                      title={ch.title}
                    >
                      {ch.title}
                    </button>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>{doneCount}/3 stages completed</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setSelectedChapterId(ch.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
                      title="Set as Active Focus Timer Target"
                    >
                      <Target className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleChapterAll(ch.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
                      title="Mark all 3 stages done"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
