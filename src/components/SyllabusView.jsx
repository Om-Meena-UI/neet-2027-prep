import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, CheckSquare, Sparkles } from 'lucide-react';
import AnalyticsStrip from './AnalyticsStrip';
import Sidebar from './Sidebar';
import { usePrep } from '../context/PrepContext';

export default function SyllabusView() {
  const { syllabusData, state, toggleChapterStage, toggleChapterAll, setSelectedChapterId } = usePrep();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [weightageFilter, setWeightageFilter] = useState('All');

  // Filtered structure
  const filteredData = useMemo(() => {
    const result = {};

    Object.entries(syllabusData).forEach(([subject, classes]) => {
      if (selectedSubject !== 'All' && selectedSubject !== subject) return;

      const matchedClasses = {};
      Object.entries(classes).forEach(([className, chapters]) => {
        if (selectedClass !== 'All' && selectedClass !== className) return;

        const matchedChapters = chapters.filter((ch) => {
          const matchesSearch =
            ch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ch.id.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesWeightage =
            weightageFilter === 'All' || ch.weightage === weightageFilter;
          return matchesSearch && matchesWeightage;
        });

        if (matchedChapters.length > 0) {
          matchedClasses[className] = matchedChapters;
        }
      });

      if (Object.keys(matchedClasses).length > 0) {
        result[subject] = matchedClasses;
      }
    });

    return result;
  }, [syllabusData, searchTerm, selectedSubject, selectedClass, weightageFilter]);

  const weightageBadgeColor = {
    'High Yield': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    'Moderate': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    'Low': 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner / Analytics Strip */}
      <AnalyticsStrip />

      {/* Main Grid: 2 columns (70% Syllabus Checklist, 30% Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols ~ 67-70%) */}
        <section className="lg:col-span-8 space-y-5">
          {/* Controls: Search & Filters */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search chapters by keyword (e.g., Optics, Genetics, Thermodynamics)..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium">
              <span className="text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>

              {/* Subject Select */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Subjects</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
              </select>

              {/* Class Select */}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">Class 11 & 12</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>

              {/* Weightage Select */}
              <select
                value={weightageFilter}
                onChange={(e) => setWeightageFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Weightages</option>
                <option value="High Yield">High Yield ⭐</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low</option>
              </select>

              {(searchTerm || selectedSubject !== 'All' || selectedClass !== 'All' || weightageFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSubject('All');
                    setSelectedClass('All');
                    setWeightageFilter('All');
                  }}
                  className="text-xs text-indigo-500 hover:text-indigo-600 underline ml-auto"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Chapters Groups */}
          {Object.keys(filteredData).length === 0 ? (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500">
              No chapters match your search or filter criteria.
            </div>
          ) : (
            Object.entries(filteredData).map(([subject, classes]) => (
              <div key={subject} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{subject}</h2>
                  <span className="text-xs text-slate-500">
                    ({Object.values(classes).reduce((sum, chs) => sum + chs.length, 0)} chapters)
                  </span>
                </div>

                {Object.entries(classes).map(([className, chapters]) => (
                  <div
                    key={`${subject}-${className}`}
                    className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {className}
                      </h3>
                      <span className="text-xs text-slate-500">{chapters.length} chapters</span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {chapters.map((ch) => {
                        const progress = state.chapterProgress[ch.id] || {
                          ncert: false,
                          pyqs: false,
                          revision: false,
                        };
                        const isMastered = progress.ncert && progress.pyqs && progress.revision;
                        const isSelectedForFocus = state.selectedChapterId === ch.id;

                        return (
                          <div
                            key={ch.id}
                            className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors rounded-xl px-2 -mx-2 ${
                              isSelectedForFocus
                                ? 'bg-indigo-50/50 dark:bg-indigo-950/20'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                    weightageBadgeColor[ch.weightage] || weightageBadgeColor['Moderate']
                                  }`}
                                >
                                  {ch.weightage}
                                </span>
                                {isMastered && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    Mastered
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => setSelectedChapterId(ch.id)}
                                className="text-sm font-medium text-left text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 leading-snug"
                              >
                                {ch.title}
                              </button>
                            </div>

                            {/* 3 Checkpoints + Quick Done button */}
                            <div className="flex items-center gap-3 self-end sm:self-center">
                              <div className="flex items-center gap-2 text-xs font-medium">
                                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(progress.ncert)}
                                    onChange={() => toggleChapterStage(ch.id, 'ncert')}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                  <span>NCERT</span>
                                </label>

                                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(progress.pyqs)}
                                    onChange={() => toggleChapterStage(ch.id, 'pyqs')}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                  <span>PYQs</span>
                                </label>

                                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(progress.revision)}
                                    onChange={() => toggleChapterStage(ch.id, 'revision')}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                  <span>Rev</span>
                                </label>
                              </div>

                              <button
                                onClick={() => toggleChapterAll(ch.id)}
                                title={isMastered ? 'Mark uncompleted' : 'Mark all 3 stages done'}
                                className={`p-1.5 rounded-lg border transition ${
                                  isMastered
                                    ? 'bg-emerald-500 text-white border-emerald-600'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                <CheckSquare className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </section>

        {/* Right Column (4 cols ~ 30-33%) */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-5">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
