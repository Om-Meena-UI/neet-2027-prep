import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckSquare, Sparkles, X, Target, Flame } from 'lucide-react';
import AnalyticsStrip from './AnalyticsStrip';
import Sidebar from './Sidebar';
import { usePrep } from '../context/PrepContext';

export default function SyllabusView() {
  const {
    allChapters,
    state,
    toggleChapterStage,
    toggleChapterAll,
    setChapterDifficulty,
    setSelectedChapterId,
  } = usePrep();

  const [activeSubject, setActiveSubject] = useState('Physics'); // 'Physics' | 'Chemistry' | 'Biology' | 'All'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedWeightage, setSelectedWeightage] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'Active' | 'Mastered'

  const isCompact = state.settings?.cardDensity === 'compact';

  // Difficulty badge & theme styles
  const difficultyConfig = {
    Easy: {
      label: 'Easy',
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    Medium: {
      label: 'Medium',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    Hard: {
      label: 'Hard',
      badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-500',
    },
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedClass !== 'All' ||
    selectedDifficulty !== 'All' ||
    selectedWeightage !== 'All' ||
    selectedStatus !== 'All';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass('All');
    setSelectedDifficulty('All');
    setSelectedWeightage('All');
    setSelectedStatus('All');
  };

  // Group chapters by Subject
  const chaptersBySubject = useMemo(() => {
    const subjects = { Physics: [], Chemistry: [], Biology: [] };

    allChapters.forEach((ch) => {
      // Search term filter
      if (
        searchTerm &&
        !ch.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !ch.id.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return;
      }

      // Class filter
      if (selectedClass !== 'All' && ch.className !== selectedClass) {
        return;
      }

      // Weightage filter
      if (selectedWeightage !== 'All' && ch.weightage !== selectedWeightage) {
        return;
      }

      // Difficulty filter
      const diff = state.chapterDifficulty?.[ch.id] || 'Medium';
      if (selectedDifficulty !== 'All' && diff !== selectedDifficulty) {
        return;
      }

      // Status filter
      const prog = state.chapterProgress?.[ch.id] || {};
      const isMastered = Boolean(prog.ncert && prog.pyqs && prog.revision);
      if (selectedStatus === 'Active' && isMastered) {
        return;
      }
      if (selectedStatus === 'Mastered' && !isMastered) {
        return;
      }

      if (subjects[ch.subject]) {
        subjects[ch.subject].push({
          ...ch,
          difficulty: diff,
        });
      }
    });

    return subjects;
  }, [
    allChapters,
    searchTerm,
    selectedClass,
    selectedWeightage,
    selectedDifficulty,
    selectedStatus,
    state.chapterDifficulty,
    state.chapterProgress,
  ]);

  const displayedSubjects =
    activeSubject === 'All'
      ? ['Physics', 'Chemistry', 'Biology']
      : [activeSubject];

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Top Hero / Analytics Strip */}
      <AnalyticsStrip />

      {/* Main Grid: 2 columns (Left: Subject Grid, Right: Timer & Countdown Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chapters by Subject in Grid Form */}
        <section className="lg:col-span-8 space-y-6">
          {/* Controls: Search, Subject Switcher, and Filters */}
          <div className="sleek-card p-4 sm:p-5 space-y-3.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search chapters in grid (e.g., Optics, Genetics, Chemical Bonding)..."
                className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-full bg-[#14161c] border border-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#55e357]/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Subject Tabs (Physics, Chemistry, Biology) */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-1.5 bg-[#14161c] p-1.5 rounded-full border border-white/5">
                {['Physics', 'Chemistry', 'Biology', 'All'].map((sub) => {
                  const count =
                    sub === 'All'
                      ? Object.values(chaptersBySubject).reduce((acc, list) => acc + list.length, 0)
                      : chaptersBySubject[sub]?.length || 0;

                  return (
                    <button
                      key={sub}
                      onClick={() => setActiveSubject(sub)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeSubject === sub
                          ? 'bg-[#55e357] text-black shadow-glow-lime'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>{sub}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          activeSubject === sub ? 'bg-black/20 text-black' : 'bg-[#262a34] text-zinc-300'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-full bg-[#14161c] border border-white/5 text-zinc-300 text-xs focus:outline-none cursor-pointer hover:border-white/10"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active (Uncompleted)</option>
                  <option value="Mastered">Mastered (3/3)</option>
                </select>

                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 rounded-full bg-[#14161c] border border-white/5 text-zinc-300 text-xs focus:outline-none cursor-pointer hover:border-white/10"
                >
                  <option value="All">All Classes</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-1.5 rounded-full bg-[#14161c] border border-white/5 text-zinc-300 text-xs focus:outline-none cursor-pointer hover:border-white/10"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <select
                  value={selectedWeightage}
                  onChange={(e) => setSelectedWeightage(e.target.value)}
                  className="px-3 py-1.5 rounded-full bg-[#14161c] border border-white/5 text-zinc-300 text-xs focus:outline-none cursor-pointer hover:border-white/10"
                >
                  <option value="All">All Yields</option>
                  <option value="High Yield">High Yield ⭐</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Low">Low</option>
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition text-xs font-semibold"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Divided by Subject: Each with a Responsive Grid of Cards */}
          {displayedSubjects.map((subjectName) => {
            const chapters = chaptersBySubject[subjectName] || [];

            return (
              <div key={subjectName} className="space-y-4">
                {/* Subject Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#55e357] shadow-glow-lime inline-block" />
                    <h2 className="text-xl font-black tracking-tight text-white">{subjectName}</h2>
                    <span className="text-xs text-zinc-400 font-mono">
                      ({chapters.length} chapters)
                    </span>
                  </div>
                </div>

                {chapters.length === 0 ? (
                  <div className="sleek-card p-8 text-center text-zinc-400 text-xs">
                    No chapters match the selected filter in {subjectName}.
                  </div>
                ) : (
                  /* Modern Rounded Grid Layout */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {chapters.map((ch) => {
                      const progress = state.chapterProgress[ch.id] || {
                        ncert: false,
                        pyqs: false,
                        revision: false,
                      };
                      const isMastered = progress.ncert && progress.pyqs && progress.revision;
                      const completedStages = ['ncert', 'pyqs', 'revision'].filter(
                        (s) => Boolean(progress[s])
                      ).length;
                      const isSelectedForFocus = state.selectedChapterId === ch.id;
                      const currentDiff = ch.difficulty;
                      const diffStyle = difficultyConfig[currentDiff] || difficultyConfig.Medium;

                      return (
                        <div
                          key={ch.id}
                          className={`${
                            isCompact ? 'p-3 sm:p-3.5' : 'p-4 sm:p-5'
                          } rounded-3xl border flex flex-col justify-between transition-all duration-200 group relative ${
                            isSelectedForFocus
                              ? 'border-[#55e357]/50 shadow-glow-lime bg-[#1d2328]'
                              : isMastered
                              ? 'bg-[#151c17] border-[#55e357]/25 hover:border-[#55e357]/40'
                              : 'bg-[#1a1d24] border-white/5 hover:border-white/10 hover:bg-[#1d212a]'
                          }`}
                        >
                          {/* Top Card Row */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#262a34] text-zinc-300">
                                {ch.className}
                              </span>
                              {ch.weightage === 'High Yield' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30">
                                  High Yield ⭐
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* 3-Bar Micro Checkpoint Progress */}
                              <div
                                className="flex items-center gap-1"
                                title={`${completedStages}/3 checkpoints mastered`}
                              >
                                {[1, 2, 3].map((step) => (
                                  <span
                                    key={step}
                                    className={`h-1.5 w-3 rounded-full transition-colors ${
                                      completedStages >= step ? 'bg-[#55e357]' : 'bg-white/10'
                                    }`}
                                  />
                                ))}
                              </div>

                              {/* Difficulty Selector */}
                              <select
                                value={currentDiff}
                                onChange={(e) => setChapterDifficulty(ch.id, e.target.value)}
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer focus:outline-none bg-[#14161c] ${diffStyle.badge}`}
                                title="Click to change chapter difficulty"
                              >
                                <option value="Easy" className="bg-[#1a1d24] text-emerald-400">
                                  ● Easy
                                </option>
                                <option value="Medium" className="bg-[#1a1d24] text-amber-300">
                                  ● Medium
                                </option>
                                <option value="Hard" className="bg-[#1a1d24] text-rose-400">
                                  ● Hard
                                </option>
                              </select>
                            </div>
                          </div>

                          {/* Middle: Title */}
                          <div className="my-2">
                            <button
                              onClick={() => setSelectedChapterId(ch.id)}
                              className="text-sm font-bold text-left text-white group-hover:text-[#55e357] transition-colors leading-snug line-clamp-2"
                              title={ch.title}
                            >
                              {ch.title}
                            </button>
                          </div>

                          {/* Bottom Card Controls with tactile capsule toggles */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-auto">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => toggleChapterStage(ch.id, 'ncert')}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                                  progress.ncert
                                    ? 'bg-[#55e357]/20 text-[#55e357] border border-[#55e357]/40 shadow-sm'
                                    : 'bg-[#14161c] text-zinc-400 hover:text-white border border-white/5 hover:border-white/10'
                                }`}
                                title="Toggle NCERT Reading"
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    progress.ncert ? 'bg-[#55e357]' : 'bg-zinc-600'
                                  }`}
                                />
                                <span>NCERT</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleChapterStage(ch.id, 'pyqs')}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                                  progress.pyqs
                                    ? 'bg-[#55e357]/20 text-[#55e357] border border-[#55e357]/40 shadow-sm'
                                    : 'bg-[#14161c] text-zinc-400 hover:text-white border border-white/5 hover:border-white/10'
                                }`}
                                title="Toggle Previous Year Questions"
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    progress.pyqs ? 'bg-[#55e357]' : 'bg-zinc-600'
                                  }`}
                                />
                                <span>PYQs</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleChapterStage(ch.id, 'revision')}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                                  progress.revision
                                    ? 'bg-[#55e357]/20 text-[#55e357] border border-[#55e357]/40 shadow-sm'
                                    : 'bg-[#14161c] text-zinc-400 hover:text-white border border-white/5 hover:border-white/10'
                                }`}
                                title="Toggle Multi-Stage Revision"
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    progress.revision ? 'bg-[#55e357]' : 'bg-zinc-600'
                                  }`}
                                />
                                <span>Rev</span>
                              </button>
                            </div>

                            {/* Quick Action buttons */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedChapterId(ch.id)}
                                className={`p-1.5 rounded-full transition ${
                                  isSelectedForFocus
                                    ? 'text-[#55e357] bg-[#55e357]/10'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                                title="Set as Active Focus Timer Chapter"
                              >
                                <Target className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => toggleChapterAll(ch.id)}
                                title={isMastered ? 'Mark uncompleted' : 'Mark all 3 stages done'}
                                className={`p-1.5 rounded-xl transition ${
                                  isMastered
                                    ? 'bg-[#55e357] text-black font-bold shadow-glow-lime'
                                    : 'bg-[#262a34] text-zinc-400 hover:text-white hover:bg-[#323744]'
                                }`}
                              >
                                <CheckSquare className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Right Column: Sticky Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
