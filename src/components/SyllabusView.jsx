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

      // Difficulty filter (custom user difficulty or fallback to Medium)
      const diff = state.chapterDifficulty?.[ch.id] || 'Medium';
      if (selectedDifficulty !== 'All' && diff !== selectedDifficulty) {
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
  }, [allChapters, searchTerm, selectedClass, selectedWeightage, selectedDifficulty, state.chapterDifficulty]);

  const displayedSubjects =
    activeSubject === 'All'
      ? ['Physics', 'Chemistry', 'Biology']
      : [activeSubject];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 space-y-6">
      {/* Top Hero / Analytics Strip */}
      <AnalyticsStrip />

      {/* Main Grid: 2 columns (Left: Subject Grid, Right: Timer & Countdown Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chapters by Subject in Grid Form */}
        <section className="lg:col-span-8 space-y-6">
          {/* Controls: Search, Subject Switcher, and Filters */}
          <div className="sleek-card p-4 space-y-3">
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

            {/* Subject Tabs (Physics, Chemistry, Biology) styled like reference image */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 bg-[#14161c] p-1 rounded-full border border-white/5">
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
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          activeSubject === sub ? 'bg-black/20 text-black' : 'bg-[#262a34] text-zinc-300'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Filters: Class & Difficulty */}
              <div className="flex items-center gap-2 text-xs">
                {/* Class selector */}
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 rounded-full bg-[#14161c] border border-white/5 text-zinc-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="All">All Classes</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>

                {/* Difficulty Filter */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-1.5 rounded-full bg-[#14161c] border border-white/5 text-zinc-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                {/* Weightage Filter */}
                <select
                  value={selectedWeightage}
                  onChange={(e) => setSelectedWeightage(e.target.value)}
                  className="px-3 py-1.5 rounded-full bg-[#14161c] border border-white/5 text-zinc-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="All">All Yields</option>
                  <option value="High Yield">High Yield ⭐</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Low">Low</option>
                </select>
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
                  /* RESPONSIVE GRID LAYOUT FOR CHAPTERS */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {chapters.map((ch) => {
                      const progress = state.chapterProgress[ch.id] || {
                        ncert: false,
                        pyqs: false,
                        revision: false,
                      };
                      const isMastered = progress.ncert && progress.pyqs && progress.revision;
                      const isSelectedForFocus = state.selectedChapterId === ch.id;
                      const currentDiff = ch.difficulty;
                      const diffStyle = difficultyConfig[currentDiff] || difficultyConfig.Medium;

                      return (
                        <div
                          key={ch.id}
                          className={`sleek-card p-4 flex flex-col justify-between transition-all duration-200 group relative ${
                            isSelectedForFocus
                              ? 'border-[#55e357]/40 shadow-glow-lime bg-[#191d24]'
                              : 'hover:border-white/10 hover:bg-[#1a1e27]'
                          }`}
                        >
                          {/* Top Card Row: Class badge + Weightage + Difficulty Selector */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#262a34] text-zinc-300">
                                {ch.className}
                              </span>
                              {ch.weightage === 'High Yield' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/30">
                                  High Yield ⭐
                                </span>
                              )}
                            </div>

                            {/* Difficulty Selector Dropdown */}
                            <div className="relative">
                              <select
                                value={currentDiff}
                                onChange={(e) => setChapterDifficulty(ch.id, e.target.value)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none bg-[#14161c] ${diffStyle.badge}`}
                                title="Click to change chapter difficulty"
                              >
                                <option value="Easy" className="bg-[#1a1d24] text-emerald-400">● Easy</option>
                                <option value="Medium" className="bg-[#1a1d24] text-amber-300">● Medium</option>
                                <option value="Hard" className="bg-[#1a1d24] text-rose-400">● Hard</option>
                              </select>
                            </div>
                          </div>

                          {/* Middle: Title & Target button */}
                          <div className="my-2">
                            <button
                              onClick={() => setSelectedChapterId(ch.id)}
                              className="text-sm font-bold text-left text-white group-hover:text-[#55e357] transition-colors leading-snug line-clamp-2"
                              title={ch.title}
                            >
                              {ch.title}
                            </button>
                          </div>

                          {/* Bottom Card Controls: 3 Checkpoints + Master All Button */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-auto">
                            {/* Checkbox pills */}
                            <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-300">
                              <label className="flex items-center gap-1 cursor-pointer hover:text-white select-none">
                                <input
                                  type="checkbox"
                                  checked={Boolean(progress.ncert)}
                                  onChange={() => toggleChapterStage(ch.id, 'ncert')}
                                  className="w-3.5 h-3.5 rounded bg-zinc-800 border-zinc-600 text-[#55e357] focus:ring-0 cursor-pointer accent-[#55e357]"
                                />
                                <span>NCERT</span>
                              </label>

                              <label className="flex items-center gap-1 cursor-pointer hover:text-white select-none">
                                <input
                                  type="checkbox"
                                  checked={Boolean(progress.pyqs)}
                                  onChange={() => toggleChapterStage(ch.id, 'pyqs')}
                                  className="w-3.5 h-3.5 rounded bg-zinc-800 border-zinc-600 text-[#55e357] focus:ring-0 cursor-pointer accent-[#55e357]"
                                />
                                <span>PYQs</span>
                              </label>

                              <label className="flex items-center gap-1 cursor-pointer hover:text-white select-none">
                                <input
                                  type="checkbox"
                                  checked={Boolean(progress.revision)}
                                  onChange={() => toggleChapterStage(ch.id, 'revision')}
                                  className="w-3.5 h-3.5 rounded bg-zinc-800 border-zinc-600 text-[#55e357] focus:ring-0 cursor-pointer accent-[#55e357]"
                                />
                                <span>Rev</span>
                              </label>
                            </div>

                            {/* Quick Master toggle */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setSelectedChapterId(ch.id)}
                                className={`p-1.5 rounded-lg text-zinc-400 hover:text-white transition ${
                                  isSelectedForFocus ? 'text-[#55e357]' : ''
                                }`}
                                title="Set as Active Focus Timer Chapter"
                              >
                                <Target className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => toggleChapterAll(ch.id)}
                                title={isMastered ? 'Mark uncompleted' : 'Mark all 3 stages done'}
                                className={`p-1.5 rounded-lg transition ${
                                  isMastered
                                    ? 'bg-[#55e357] text-black font-bold'
                                    : 'bg-[#262a34] text-zinc-400 hover:text-white'
                                }`}
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
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

        {/* Right Column: Sticky Sidebar (Countdown & Dual Timer) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
