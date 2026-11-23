import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckSquare,
  Sparkles,
  X,
  Target,
  Flame,
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import AnalyticsStrip from './AnalyticsStrip';
import Sidebar, { SmartFocusQueue } from './Sidebar';
import DualTimer from './DualTimer';
import TodoList from './TodoList';
import CountdownCard from './CountdownCard';
import YoutubeMusicEmbed from './YoutubeMusicEmbed';
import { usePrep } from '../context/PrepContext';

export default function SyllabusView() {
  const {
    allChapters,
    state,
    toggleChapterStage,
    incrementChapterRevision,
    toggleChapterAll,
    setChapterDifficulty,
    setSelectedChapterId,
    mobileSection,
    setMobileSection,
    showToast,
  } = usePrep();

  const [activeSubject, setActiveSubject] = useState('Physics'); // 'Physics' | 'Chemistry' | 'Biology' | 'All'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedWeightage, setSelectedWeightage] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'Active' | 'Mastered'
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  const activeFiltersCount = [
    searchTerm !== '',
    selectedClass !== 'All',
    selectedDifficulty !== 'All',
    selectedWeightage !== 'All',
    selectedStatus !== 'All',
  ].filter(Boolean).length;

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
      const revCount =
        typeof prog.revisions === 'number'
          ? prog.revisions
          : prog.revision
          ? 1
          : 0;
      const isMastered = Boolean(prog.ncert && prog.pyqs && revCount > 0);
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

  const totalMatchingChapters = Object.values(chaptersBySubject).reduce(
    (acc, list) => acc + list.length,
    0
  );

  const handleSelectChapterForFocus = (chapter) => {
    setSelectedChapterId(chapter.id);
    showToast(`Loaded ${chapter.title} into Focus Timer! 🎯`);
    // On mobile, automatically switch to timer view so the user doesn't have to scroll
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && setMobileSection) {
      setMobileSection('timer');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Top Hero / Analytics Strip */}
      <AnalyticsStrip />

      {/* MOBILE-ONLY VIEW SWITCHER (Desktop unaffected: lg:hidden) */}
      <div className="lg:hidden flex items-center bg-[#14161c] p-1.5 rounded-2xl border border-white/5 text-xs font-semibold gap-1 shadow-lg">
        <button
          onClick={() => setMobileSection && setMobileSection('chapters')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95 ${
            mobileSection === 'chapters'
              ? 'bg-[#262a34] text-white shadow-inner font-bold border border-white/10'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#55e357]" />
          <span>Chapters ({totalMatchingChapters})</span>
        </button>

        <button
          onClick={() => setMobileSection && setMobileSection('timer')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95 ${
            mobileSection === 'timer'
              ? 'bg-[#262a34] text-[#55e357] shadow-inner font-bold border border-white/10'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 text-[#55e357]" />
          <span>Focus Timer</span>
        </button>

        <button
          onClick={() => setMobileSection && setMobileSection('tasks')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95 ${
            mobileSection === 'tasks'
              ? 'bg-[#262a34] text-sky-400 shadow-inner font-bold border border-white/10'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span>Daily Tasks</span>
        </button>
      </div>

      {/* Main Grid: 2 columns on desktop (lg:grid-cols-12), stacked / sectioned on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chapters by Subject (Always shown on desktop; shown on mobile if mobileSection === 'chapters') */}
        <section
          className={`space-y-6 ${
            mobileSection === 'chapters' ? 'block' : 'hidden lg:block'
          } lg:col-span-8`}
        >
          {/* Controls: Search, Subject Switcher, Class Switcher, and Filters */}
          <div className="sleek-card p-4 sm:p-5 space-y-3.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search chapters (e.g. Optics, Genetics, Chemical Bonding)..."
                className="w-full pl-11 pr-10 py-3 text-xs sm:text-sm rounded-full bg-[#14161c] border border-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#55e357]/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Subject Tabs (Swipeable on mobile, flex on desktop) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {['Physics', 'Chemistry', 'Biology', 'All'].map((sub) => {
                const count =
                  sub === 'All'
                    ? Object.values(chaptersBySubject).reduce(
                        (acc, list) => acc + list.length,
                        0
                      )
                    : chaptersBySubject[sub]?.length || 0;

                return (
                  <button
                    key={sub}
                    onClick={() => setActiveSubject(sub)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all min-h-[42px] whitespace-nowrap active:scale-95 flex-shrink-0 ${
                      activeSubject === sub
                        ? 'bg-[#55e357] text-black shadow-glow-lime'
                        : 'bg-[#14161c] text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    <span>{sub}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        activeSubject === sub
                          ? 'bg-black/20 text-black'
                          : 'bg-[#262a34] text-zinc-300'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* One-Tap Class 11 / Class 12 Switcher on Mobile (Desktop also uses clean pill) */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="flex items-center bg-[#14161c] p-1 rounded-2xl border border-white/5 text-xs font-semibold flex-1 sm:flex-initial">
                {[
                  { label: 'All Classes', value: 'All' },
                  { label: 'Class 11', value: 'Class 11' },
                  { label: 'Class 12', value: 'Class 12' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setSelectedClass(item.value)}
                    className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-xl min-h-[38px] transition-all text-center text-xs font-semibold active:scale-95 ${
                      selectedClass === item.value
                        ? 'bg-[#262a34] text-white font-bold border border-white/10 shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Mobile Filter Toggle Accordion Button */}
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className={`sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-2xl min-h-[38px] border text-xs font-semibold transition active:scale-95 ${
                  hasActiveFilters
                    ? 'bg-[#55e357]/15 text-[#55e357] border-[#55e357]/30'
                    : 'bg-[#14161c] text-zinc-400 border-white/5'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#55e357] text-black text-[9px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
                {mobileFiltersOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Detailed Filters (Collapsible on mobile, always visible on sm/desktop) */}
            <div
              className={`${
                mobileFiltersOpen ? 'flex' : 'hidden sm:flex'
              } flex-wrap items-center gap-2 text-xs pt-1 border-t border-white/5 sm:border-0`}
            >
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-xl sm:rounded-full bg-[#14161c] border border-white/10 text-zinc-300 text-xs focus:outline-none cursor-pointer flex-1 sm:flex-initial"
              >
                <option value="All">All Status</option>
                <option value="Active">Active (Uncompleted)</option>
                <option value="Mastered">Mastered (3/3)</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-xl sm:rounded-full bg-[#14161c] border border-white/10 text-zinc-300 text-xs focus:outline-none cursor-pointer flex-1 sm:flex-initial"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                value={selectedWeightage}
                onChange={(e) => setSelectedWeightage(e.target.value)}
                className="px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-xl sm:rounded-full bg-[#14161c] border border-white/10 text-zinc-300 text-xs focus:outline-none cursor-pointer flex-1 sm:flex-initial"
              >
                <option value="All">All Yields</option>
                <option value="High Yield">High Yield ★</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-1 px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-xl sm:rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition text-xs font-semibold active:scale-95 flex-1 sm:flex-initial"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
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
                  /* Modern Rounded Grid Layout (1 col on mobile, 2 col on sm+) */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {chapters.map((ch) => {
                      const progress = state.chapterProgress[ch.id] || {
                        ncert: false,
                        pyqs: false,
                        revision: false,
                        revisions: 0,
                      };
                      const revisionCount =
                        typeof progress.revisions === 'number'
                          ? progress.revisions
                          : progress.revision
                          ? 1
                          : 0;
                      const isMastered = progress.ncert && progress.pyqs && revisionCount > 0;
                      const completedStages = [
                        progress.ncert,
                        progress.pyqs,
                        revisionCount > 0,
                      ].filter(Boolean).length;
                      const isSelectedForFocus = state.selectedChapterId === ch.id;
                      const currentDiff = ch.difficulty;
                      const diffStyle = difficultyConfig[currentDiff] || difficultyConfig.Medium;

                      return (
                        <div
                          key={ch.id}
                          className={`${
                            isCompact ? 'p-3.5 sm:p-3.5' : 'p-4 sm:p-5'
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
                                  High Yield ★
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* 3-Bar Micro Checkpoint Progress */}
                              <div
                                className="flex items-center gap-1"
                                title={`NCERT: ${progress.ncert ? '✓ Done' : 'Pending'} • PYQs: ${
                                  progress.pyqs ? '✓ Done' : 'Pending'
                                } • Revisions: ${revisionCount}x`}
                              >
                                <span
                                  className={`h-1.5 w-3 rounded-full transition-colors ${
                                    progress.ncert ? 'bg-[#55e357]' : 'bg-white/10'
                                  }`}
                                />
                                <span
                                  className={`h-1.5 w-3 rounded-full transition-colors ${
                                    progress.pyqs ? 'bg-[#55e357]' : 'bg-white/10'
                                  }`}
                                />
                                <span
                                  className={`h-1.5 w-3 rounded-full transition-colors ${
                                    revisionCount >= 3
                                      ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                                      : revisionCount > 0
                                      ? 'bg-[#38bdf8]'
                                      : 'bg-white/10'
                                  }`}
                                />
                              </div>

                              {/* Difficulty Selector */}
                              <select
                                value={currentDiff}
                                onChange={(e) => setChapterDifficulty(ch.id, e.target.value)}
                                className={`text-[10px] font-bold px-2.5 py-1 sm:py-0.5 rounded-full border cursor-pointer focus:outline-none bg-[#14161c] ${diffStyle.badge}`}
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
                              onClick={() => handleSelectChapterForFocus(ch)}
                              className="text-sm sm:text-sm font-bold text-left text-white group-hover:text-[#55e357] transition-colors leading-snug line-clamp-2 block w-full py-1"
                              title="Tap to focus chapter in timer"
                            >
                              {ch.title}
                            </button>
                          </div>

                          {/* Bottom Card Controls with tactile capsule toggles */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-auto">
                            <div className="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => toggleChapterStage(ch.id, 'ncert')}
                                className={`flex-1 sm:flex-initial px-2.5 sm:px-2.5 py-2 sm:py-1 min-h-[38px] sm:min-h-0 rounded-xl text-xs sm:text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                                  progress.ncert
                                    ? 'bg-[#55e357]/20 text-[#55e357] border border-[#55e357]/40 shadow-sm'
                                    : 'bg-[#14161c] text-zinc-400 hover:text-white border border-white/5'
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
                                className={`flex-1 sm:flex-initial px-2.5 sm:px-2.5 py-2 sm:py-1 min-h-[38px] sm:min-h-0 rounded-xl text-xs sm:text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                                  progress.pyqs
                                    ? 'bg-[#55e357]/20 text-[#55e357] border border-[#55e357]/40 shadow-sm'
                                    : 'bg-[#14161c] text-zinc-400 hover:text-white border border-white/5'
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

                              {/* Multi-Revision Stepper Capsule */}
                              <div
                                className={`flex items-center rounded-xl border transition-all ${
                                  revisionCount > 0
                                    ? revisionCount >= 3
                                      ? 'bg-amber-400/15 border-amber-400/40 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.15)]'
                                      : 'bg-[#38bdf8]/20 border-[#38bdf8]/40 text-[#38bdf8] shadow-sm'
                                    : 'bg-[#14161c] border-white/5 text-zinc-400'
                                }`}
                              >
                                {revisionCount > 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      incrementChapterRevision(ch.id, -1);
                                    }}
                                    className="px-2 py-2 sm:py-1 hover:text-white transition rounded-l-xl text-xs font-bold active:scale-95 border-r border-white/10"
                                    title="Decrease revision count (-1)"
                                  >
                                    -
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => incrementChapterRevision(ch.id, 1)}
                                  className={`px-2.5 py-2 sm:py-1 min-h-[38px] sm:min-h-0 text-xs sm:text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                                    revisionCount === 0 ? 'hover:text-white' : ''
                                  }`}
                                  title={`Completed ${revisionCount} revisions. Click to log Revision #${
                                    revisionCount + 1
                                  }!`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      revisionCount >= 3
                                        ? 'bg-amber-400'
                                        : revisionCount > 0
                                        ? 'bg-[#38bdf8]'
                                        : 'bg-zinc-600'
                                    }`}
                                  />
                                  <span>
                                    {revisionCount === 0
                                      ? '+ Rev'
                                      : `Rev ${revisionCount}x${
                                          revisionCount >= 3 ? ' ★' : ''
                                        }`}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    incrementChapterRevision(ch.id, 1);
                                  }}
                                  className="px-2 py-2 sm:py-1 hover:text-white transition rounded-r-xl text-xs font-bold active:scale-95 border-l border-white/10"
                                  title="Log another revision (+1)"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Quick Action buttons */}
                            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => handleSelectChapterForFocus(ch)}
                                className={`p-2.5 sm:p-1.5 min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-xl transition active:scale-95 ${
                                  isSelectedForFocus
                                    ? 'text-[#55e357] bg-[#55e357]/15 border border-[#55e357]/40 shadow-sm'
                                    : 'text-zinc-400 hover:text-white bg-[#14161c] border border-white/5'
                                }`}
                                title="Load into Focus Timer"
                              >
                                <Target className="w-4 h-4 text-[#55e357]" />
                              </button>

                              <button
                                onClick={() => toggleChapterAll(ch.id)}
                                title={isMastered ? 'Mark uncompleted' : 'Mark all 3 stages done'}
                                className={`p-2.5 sm:p-1.5 min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-xl transition active:scale-95 ${
                                  isMastered
                                    ? 'bg-[#55e357] text-black font-bold shadow-glow-lime'
                                    : 'bg-[#262a34] text-zinc-400 hover:text-white hover:bg-[#323744] border border-white/5'
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

        {/* MOBILE TIMER VIEW: Instant access on mobile when Timer tab is active (Zero scrolling!) */}
        {mobileSection === 'timer' && (
          <div className="lg:hidden space-y-6 animate-in fade-in duration-150">
            <DualTimer />
            <SmartFocusQueue />
            <CountdownCard />
          </div>
        )}

        {/* MOBILE TASKS VIEW: Instant access on mobile when Tasks tab is active */}
        {mobileSection === 'tasks' && (
          <div className="lg:hidden space-y-6 animate-in fade-in duration-150">
            <TodoList />
            <YoutubeMusicEmbed />
          </div>
        )}

        {/* DESKTOP SIDEBAR: Persistent & sticky on the right side even after scrolling past */}
        <div className="hidden lg:block lg:col-span-4 relative">
          <div className="sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto no-scrollbar space-y-5 pb-6">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
