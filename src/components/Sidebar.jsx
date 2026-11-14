import React from 'react';
import { Zap, Target, CheckCircle2 } from 'lucide-react';
import CountdownCard from './CountdownCard';
import DualTimer from './DualTimer';
import TodoList from './TodoList';
import YoutubeMusicEmbed from './YoutubeMusicEmbed';
import { usePrep } from '../context/PrepContext';

export default function Sidebar() {
  const { allChapters, state, toggleChapterAll, setSelectedChapterId } = usePrep();

  // Smart Focus Queue: find unmastered high-yield chapters first
  const uncompletedHighYield = allChapters
    .filter((ch) => {
      const prog = state.chapterProgress[ch.id] || {};
      const isMastered = prog.ncert && prog.pyqs && prog.revision;
      return !isMastered && ch.weightage === 'High Yield';
    })
    .slice(0, 3);

  const additionalRecommendations =
    uncompletedHighYield.length < 3
      ? allChapters
          .filter((ch) => {
            const prog = state.chapterProgress[ch.id] || {};
            const isMastered = prog.ncert && prog.pyqs && prog.revision;
            return !isMastered && ch.weightage === 'Moderate';
          })
          .slice(0, 3 - uncompletedHighYield.length)
      : [];

  const focusQueue = [...uncompletedHighYield, ...additionalRecommendations];

  return (
    <aside className="space-y-6">
      {/* YouTube Music Widget */}
      <div id="mobile-music-section">
        <YoutubeMusicEmbed />
      </div>

      {/* Daily To-Do List Widget */}
      <div id="mobile-todo-section">
        <TodoList />
      </div>

      {/* Dual-Mode Focus Timer */}
      <div id="mobile-timer-section">
        <DualTimer />
      </div>

      {/* Countdown Card */}
      <div id="mobile-countdown-section">
        <CountdownCard />
      </div>

      {/* Smart Focus Queue */}
      <div className="sleek-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#55e357]" />
            <h3 className="font-bold text-white text-sm tracking-tight">Smart Focus Queue</h3>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#55e357]/10 text-[#55e357] border border-[#55e357]/20 uppercase tracking-wider">
            High Priority
          </span>
        </div>

        <p className="text-xs text-zinc-400">
          Algorithmic recommendations: Unmastered high-yield chapters.
        </p>

        {focusQueue.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-400">
            🎉 All high-yield chapters mastered!
          </div>
        ) : (
          <div className="space-y-2">
            {focusQueue.map((ch) => {
              const prog = state.chapterProgress[ch.id] || {};
              const doneCount = ['ncert', 'pyqs', 'revision'].filter((s) => Boolean(prog[s])).length;

              return (
                <div
                  key={ch.id}
                  className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 hover:border-white/10 hover:bg-[#191d24] transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#262a34] text-zinc-300">
                        {ch.subject}
                      </span>
                      <span className="text-[10px] text-zinc-400">{ch.className}</span>
                    </div>

                    <button
                      onClick={() => setSelectedChapterId(ch.id)}
                      className="text-xs font-semibold text-left text-white group-hover:text-[#55e357] truncate block w-full transition-colors"
                      title={ch.title}
                    >
                      {ch.title}
                    </button>

                    <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-2 font-mono">
                      <span>{doneCount}/3 stages completed</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setSelectedChapterId(ch.id)}
                      className="p-2 rounded-xl bg-[#262a34] text-zinc-400 hover:text-white hover:bg-[#323744] transition"
                      title="Set active in Focus Timer"
                    >
                      <Target className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleChapterAll(ch.id)}
                      className="p-2 rounded-xl bg-[#262a34] text-zinc-400 hover:text-[#55e357] hover:bg-[#323744] transition"
                      title="Mark all 3 stages done"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
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
