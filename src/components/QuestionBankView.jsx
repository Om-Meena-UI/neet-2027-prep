import React, { useState, useMemo } from 'react';
import {
  Camera,
  Upload,
  Search,
  Filter,
  Tag,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Plus,
  Flame,
  Star,
  Eye,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Layers,
  X,
  FileQuestion,
} from 'lucide-react';
import { usePrep } from '../context/PrepContext';
import AddQuestionModal, { PRESET_TAGS } from './AddQuestionModal';
import QuestionLightbox from './QuestionLightbox';

export default function QuestionBankView() {
  const {
    state,
    allChapters,
    deleteQuestion,
    toggleQuestionMastered,
    showToast,
  } = usePrep();

  const questions = state.questions || [];

  // Filter state
  const [activeSubject, setActiveSubject] = useState('All'); // 'All' | 'Physics' | 'Chemistry' | 'Biology'
  const [selectedTag, setSelectedTag] = useState('All'); // 'All' | specific tag
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'Active' | 'Mastered'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalInitialSubject, setModalInitialSubject] = useState('Physics');
  const [modalInitialChapterId, setModalInitialChapterId] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Lightbox state
  const [lightboxQuestion, setLightboxQuestion] = useState(null);

  // Filter questions according to search, tags, and status
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Subject Filter
      if (activeSubject !== 'All' && q.subject !== activeSubject) {
        return false;
      }

      // Tag Filter
      if (selectedTag !== 'All' && !(q.tags || []).includes(selectedTag)) {
        return false;
      }

      // Status Filter
      if (selectedStatus === 'Active' && q.isMastered) return false;
      if (selectedStatus === 'Mastered' && !q.isMastered) return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = (q.title || '').toLowerCase().includes(query);
        const matchesChapter = (q.chapterTitle || '').toLowerCase().includes(query);
        const matchesNotes = (q.notes || '').toLowerCase().includes(query);
        const matchesTags = (q.tags || []).some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesChapter && !matchesNotes && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [questions, activeSubject, selectedTag, selectedStatus, searchQuery]);

  // Group filtered questions by Subject, then by Chapter
  const categorizedData = useMemo(() => {
    const subjects = ['Physics', 'Chemistry', 'Biology'];
    const displayedSubjects =
      activeSubject === 'All' ? subjects : [activeSubject];

    const result = {};

    displayedSubjects.forEach((sub) => {
      // Find all questions for this subject
      const subQuestions = filteredQuestions.filter((q) => q.subject === sub);

      // Group these questions by chapterId
      const chaptersMap = {};

      subQuestions.forEach((q) => {
        const chId = q.chapterId || 'general';
        if (!chaptersMap[chId]) {
          const chObj = allChapters.find((c) => c.id === chId);
          chaptersMap[chId] = {
            chapterId: chId,
            chapterTitle: q.chapterTitle || chObj?.title || 'General / Unassigned',
            className: chObj?.className || 'Class 11 & 12',
            weightage: chObj?.weightage || 'Moderate',
            questions: [],
          };
        }
        chaptersMap[chId].questions.push(q);
      });

      result[sub] = Object.values(chaptersMap);
    });

    return result;
  }, [filteredQuestions, activeSubject, allChapters]);

  // Overall Statistics for badges
  const stats = useMemo(() => {
    const total = questions.length;
    const physics = questions.filter((q) => q.subject === 'Physics').length;
    const chemistry = questions.filter((q) => q.subject === 'Chemistry').length;
    const biology = questions.filter((q) => q.subject === 'Biology').length;
    const hots = questions.filter((q) => (q.tags || []).includes('HOTS')).length;
    const faqs = questions.filter((q) =>
      (q.tags || []).includes('Frequently Asked Question')
    ).length;
    const factBased = questions.filter((q) =>
      (q.tags || []).includes('Fact Based')
    ).length;
    const mastered = questions.filter((q) => q.isMastered).length;
    const pending = total - mastered;

    return {
      total,
      physics,
      chemistry,
      biology,
      hots,
      faqs,
      factBased,
      mastered,
      pending,
    };
  }, [questions]);

  const handleOpenAddForChapter = (sub, chId) => {
    setModalInitialSubject(sub);
    setModalInitialChapterId(chId);
    setEditingQuestion(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setIsAddModalOpen(true);
  };

  const getTagColor = (tagId) => {
    const found = PRESET_TAGS.find((p) => p.id === tagId);
    return found ? found.color : 'bg-zinc-800 text-zinc-300 border-zinc-700';
  };

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* 1. Header Hero Card with Quick Actions */}
      <div className="sleek-card p-5 sm:p-7 relative overflow-hidden bg-gradient-to-r from-[#171922] via-[#14161c] to-[#12141a] border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Personal High-Yield Archive
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Question Bank</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold font-mono">
                {questions.length} saved
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Snap photos of tricky questions, tag them with HOTS, FAQ, or Fact-Based labels, and revise them chapter-by-chapter.
            </p>
          </div>

          {/* Quick Upload / Camera Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setEditingQuestion(null);
                setModalInitialSubject(activeSubject !== 'All' ? activeSubject : 'Physics');
                setModalInitialChapterId('');
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 shadow-md"
            >
              <Camera className="w-4 h-4" />
              <span>Snap / Add Question</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Top Stats Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Total Questions */}
        <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
            <FileQuestion className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold font-mono text-white leading-tight">
              {stats.total}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">Total Questions</div>
          </div>
        </div>

        {/* HOTS Questions */}
        <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold font-mono text-rose-300 leading-tight">
              {stats.hots}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">HOTS (High Order)</div>
          </div>
        </div>

        {/* FAQs Questions */}
        <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Star className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold font-mono text-amber-300 leading-tight">
              {stats.faqs}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">Frequently Asked</div>
          </div>
        </div>

        {/* Fact Based */}
        <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold font-mono text-emerald-300 leading-tight">
              {stats.factBased}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">Fact Based</div>
          </div>
        </div>

        {/* Mastered */}
        <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#55e357]/10 text-[#55e357] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold font-mono text-[#55e357] leading-tight">
              {stats.mastered}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">Mastered / Solved</div>
          </div>
        </div>

        {/* Pending Practice */}
        <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#f97316]/10 text-[#f97316] flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold font-mono text-[#f97316] leading-tight">
              {stats.pending}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">Needs Practice</div>
          </div>
        </div>
      </div>

      {/* 3. Filtering & Search Controls */}
      <div className="sleek-card p-4 sm:p-5 space-y-4">
        {/* Search Bar & Status Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by question title, chapter, notes, or tags..."
              className="w-full pl-11 pr-10 py-2.5 text-xs sm:text-sm rounded-full bg-[#14161c] border border-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#14161c] p-1 rounded-2xl border border-white/5 self-start sm:self-auto">
            {['All', 'Active', 'Mastered'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                  selectedStatus === status
                    ? 'bg-[#262a34] text-white border border-white/10 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {status === 'Active' ? 'Needs Practice' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 border-t border-white/5 pt-3">
          {[
            { id: 'All', label: 'All Subjects', count: stats.total },
            { id: 'Physics', label: 'Physics', count: stats.physics, color: '#38bdf8' },
            { id: 'Chemistry', label: 'Chemistry', count: stats.chemistry, color: '#f59e0b' },
            { id: 'Biology', label: 'Biology', count: stats.biology, color: '#55e357' },
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition flex-shrink-0 active:scale-95 border ${
                activeSubject === sub.id
                  ? 'bg-[#262a34] text-white border-white/15 shadow-inner'
                  : 'bg-[#14161c] text-zinc-400 border-white/5 hover:text-white'
              }`}
            >
              {sub.color && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: sub.color }}
                />
              )}
              <span>{sub.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/5 text-zinc-300">
                {sub.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tag Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3 text-sky-400" />
            <span>Tags:</span>
          </span>

          <button
            onClick={() => setSelectedTag('All')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex-shrink-0 border ${
              selectedTag === 'All'
                ? 'bg-white text-black border-white'
                : 'bg-[#14161c] text-zinc-400 border-white/5 hover:text-white'
            }`}
          >
            All Tags
          </button>

          {PRESET_TAGS.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTag(selectedTag === t.id ? 'All' : t.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex-shrink-0 border active:scale-95 ${
                selectedTag === t.id
                  ? `${t.color} ring-1 ring-white/30 shadow-sm`
                  : 'bg-[#14161c] text-zinc-400 border-white/5 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Categorized Questions Content: Subject -> Chapter */}
      {questions.length === 0 ? (
        /* Empty State: First Time User */
        <div className="sleek-card p-10 sm:p-14 text-center space-y-5 bg-[#14161c]">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-inner">
            <Camera className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-white">Your Question Bank is Empty</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Whenever you solve mock tests, practice papers, or coaching modules, take a photo of tricky questions, tag them as <span className="text-rose-400 font-semibold">HOTS</span>, <span className="text-amber-400 font-semibold">FAQ</span>, or <span className="text-sky-400 font-semibold">Fact-Based</span>, and build your personalized NEET revision vault!
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setEditingQuestion(null);
                setModalInitialSubject('Physics');
                setModalInitialChapterId('');
                setIsAddModalOpen(true);
              }}
              className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition active:scale-95 shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Question</span>
            </button>
          </div>
        </div>
      ) : filteredQuestions.length === 0 ? (
        /* Filter matched 0 questions */
        <div className="sleek-card p-10 text-center space-y-3 bg-[#14161c]">
          <p className="text-sm font-semibold text-zinc-300">
            No questions match your current search and filters.
          </p>
          <button
            onClick={() => {
              setActiveSubject('All');
              setSelectedTag('All');
              setSelectedStatus('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-[#262a34] text-xs font-bold text-white hover:bg-[#323744] transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        /* Categorized List by Subject then Chapter */
        <div className="space-y-8">
          {Object.entries(categorizedData).map(([subjectName, chapterGroups]) => {
            if (chapterGroups.length === 0) return null;

            return (
              <div key={subjectName} className="space-y-4">
                {/* Subject Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        subjectName === 'Physics'
                          ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                          : subjectName === 'Chemistry'
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                          : 'bg-[#55e357] shadow-[0_0_8px_rgba(85,227,87,0.8)]'
                      }`}
                    />
                    <h2 className="text-xl font-black tracking-tight text-white">
                      {subjectName}
                    </h2>
                    <span className="text-xs text-zinc-400 font-mono">
                      (
                      {chapterGroups.reduce(
                        (acc, g) => acc + g.questions.length,
                        0
                      )}{' '}
                      questions)
                    </span>
                  </div>
                </div>

                {/* Chapter Groups under this Subject */}
                <div className="space-y-5">
                  {chapterGroups.map((group) => (
                    <div
                      key={group.chapterId}
                      className="sleek-card p-4 sm:p-5 space-y-4 border border-white/5 bg-[#14161c]"
                    >
                      {/* Chapter Title Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-sky-400" />
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            {group.chapterTitle}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#262a34] text-zinc-300">
                            {group.className}
                          </span>
                          {group.weightage === 'High Yield' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30">
                              High Yield ★
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400 font-mono">
                            {group.questions.length} saved
                          </span>

                          <button
                            onClick={() =>
                              handleOpenAddForChapter(subjectName, group.chapterId)
                            }
                            className="px-2.5 py-1 rounded-xl bg-[#262a34] hover:bg-[#323744] text-[11px] font-bold text-white transition flex items-center gap-1 active:scale-95"
                            title="Add another question to this chapter"
                          >
                            <Plus className="w-3.5 h-3.5 text-sky-400" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>

                      {/* Question Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                        {group.questions.map((q) => (
                          <div
                            key={q.id}
                            className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between transition-all duration-200 group relative ${
                              q.isMastered
                                ? 'bg-[#151c17] border-[#55e357]/20 hover:border-[#55e357]/40'
                                : 'bg-[#191d26] border-white/5 hover:border-white/15'
                            }`}
                          >
                            {/* Card Top Row: Thumbnail + Quick Zoom Button */}
                            <div
                              onClick={() => setLightboxQuestion(q)}
                              className="relative h-44 rounded-xl overflow-hidden bg-black/60 cursor-pointer group/img border border-white/5 mb-3"
                            >
                              <img
                                src={q.imageUrl}
                                alt={q.title}
                                className="w-full h-full object-contain p-1 transition-transform duration-200 group-hover/img:scale-105"
                              />

                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                <span className="px-3 py-1.5 rounded-xl bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View & Zoom</span>
                                </span>
                              </div>

                              {/* Difficulty Badge on Image */}
                              <span
                                className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md ${
                                  q.difficulty === 'Hard'
                                    ? 'bg-rose-500/80 text-white'
                                    : q.difficulty === 'Medium'
                                    ? 'bg-amber-500/80 text-black'
                                    : 'bg-emerald-500/80 text-black'
                                }`}
                              >
                                {q.difficulty || 'Medium'}
                              </span>

                              {/* Mastered Badge on Image */}
                              {q.isMastered && (
                                <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#55e357] text-black shadow-glow-lime">
                                  Solved 🏆
                                </span>
                              )}
                            </div>

                            {/* Card Info: Title */}
                            <div className="space-y-2 flex-1">
                              <h4
                                onClick={() => setLightboxQuestion(q)}
                                className="text-xs sm:text-sm font-bold text-white hover:text-sky-400 transition-colors cursor-pointer line-clamp-2 leading-snug"
                                title={q.title}
                              >
                                {q.title}
                              </h4>

                              {/* Tag Badges */}
                              <div className="flex flex-wrap gap-1">
                                {(q.tags || []).map((t) => (
                                  <span
                                    key={t}
                                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getTagColor(
                                      t
                                    )}`}
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>

                              {/* Snippet of Notes if available */}
                              {q.notes && (
                                <p className="text-[11px] text-zinc-400 line-clamp-2 italic pt-1 border-t border-white/5">
                                  "{q.notes}"
                                </p>
                              )}
                            </div>

                            {/* Card Bottom Actions */}
                            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-3">
                              {/* Mastered Toggle */}
                              <button
                                onClick={() => toggleQuestionMastered(q.id)}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 active:scale-95 border ${
                                  q.isMastered
                                    ? 'bg-[#55e357]/20 text-[#55e357] border-[#55e357]/40 shadow-sm'
                                    : 'bg-[#14161c] text-zinc-400 border-white/5 hover:text-white'
                                }`}
                                title={
                                  q.isMastered
                                    ? 'Mark for revision'
                                    : 'Mark as mastered/solved'
                                }
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{q.isMastered ? 'Mastered' : 'Solve'}</span>
                              </button>

                              {/* Edit & Delete */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEdit(q)}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
                                  title="Edit Question"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        'Delete this question from your Question Bank?'
                                      )
                                    ) {
                                      deleteQuestion(q.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                  title="Delete Question"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Question Modal */}
      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialSubject={modalInitialSubject}
        initialChapterId={modalInitialChapterId}
        editingQuestion={editingQuestion}
      />

      {/* Question Full Image Lightbox */}
      <QuestionLightbox
        question={lightboxQuestion}
        isOpen={Boolean(lightboxQuestion)}
        onClose={() => setLightboxQuestion(null)}
        onToggleMastered={toggleQuestionMastered}
        onEdit={handleOpenEdit}
        onDelete={deleteQuestion}
      />
    </div>
  );
}
