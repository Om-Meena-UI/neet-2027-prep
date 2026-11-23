import React, { useState, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  CheckCircle2,
  Edit3,
  Trash2,
  Tag,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { PRESET_TAGS } from './AddQuestionModal';

export default function QuestionLightbox({
  question,
  isOpen,
  onClose,
  onToggleMastered,
  onEdit,
  onDelete,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Reset transforms whenever question changes or modal opens
  useEffect(() => {
    setZoomLevel(1);
    setRotation(0);
  }, [question, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !question) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.7));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const getTagColor = (tagId) => {
    const found = PRESET_TAGS.find((p) => p.id === tagId);
    return found ? found.color : 'bg-zinc-800 text-zinc-300 border-zinc-700';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[94vh] bg-[#14161c] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#191d24] z-10">
          {/* Left Title & Chapter */}
          <div className="min-w-0 flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                question.subject === 'Physics'
                  ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                  : question.subject === 'Chemistry'
                  ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                  : 'bg-[#55e357] shadow-[0_0_8px_rgba(85,227,87,0.8)]'
              }`}
            />
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                {question.title}
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono truncate">
                {question.subject} • {question.chapterTitle}
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-[#14161c] px-2 py-1 rounded-xl border border-white/5">
              <button
                onClick={handleZoomOut}
                className="p-1 text-zinc-400 hover:text-white transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-zinc-300 px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 text-zinc-400 hover:text-white transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Rotate Button */}
            <button
              onClick={handleRotate}
              className="p-2 rounded-xl bg-[#262a34] text-zinc-300 hover:text-white transition border border-white/5"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Mastered Status Toggle */}
            <button
              onClick={() => onToggleMastered(question.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border active:scale-95 ${
                question.isMastered
                  ? 'bg-[#55e357]/20 text-[#55e357] border-[#55e357]/40 shadow-glow-lime'
                  : 'bg-[#262a34] text-zinc-300 border-white/10 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {question.isMastered ? 'Mastered' : 'Mark Solved'}
              </span>
            </button>

            {/* Edit */}
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(question);
                }}
                className="p-2 rounded-xl bg-[#262a34] text-zinc-300 hover:text-white transition border border-white/5"
                title="Edit Question"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {/* Delete */}
            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm('Delete this question from your Question Bank?')) {
                    onDelete(question.id);
                    onClose();
                  }
                }}
                className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition border border-rose-500/20"
                title="Delete Question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Main Area: Split Screen (Image + Notes Sidebar) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-black/40">
          {/* Left / Top: Interactive Image Viewer */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 select-none relative">
            <div
              className="transition-transform duration-150 ease-out flex items-center justify-center max-w-full max-h-full"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              }}
            >
              <img
                src={question.imageUrl}
                alt={question.title}
                className="max-h-[55vh] lg:max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                draggable={false}
              />
            </div>
          </div>

          {/* Right / Bottom: Question Insights & Notes Drawer */}
          <div className="w-full lg:w-80 bg-[#161922] border-t lg:border-t-0 lg:border-l border-white/5 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto space-y-4">
            <div className="space-y-4">
              {/* Tags Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-sky-400" />
                  <span>Categorized Tags</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(question.tags || []).map((t) => (
                    <span
                      key={t}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getTagColor(
                        t
                      )}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Subject & Difficulty Card */}
              <div className="p-3 rounded-2xl bg-[#1a1d26] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Subject</span>
                  <span className="font-bold text-white">{question.subject}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Chapter</span>
                  <span className="font-bold text-white truncate max-w-[150px]">
                    {question.chapterTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Difficulty</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      question.difficulty === 'Hard'
                        ? 'bg-rose-500/15 text-rose-400'
                        : question.difficulty === 'Medium'
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {question.difficulty || 'Medium'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Status</span>
                  <span
                    className={`font-bold text-xs ${
                      question.isMastered ? 'text-[#55e357]' : 'text-amber-400'
                    }`}
                  >
                    {question.isMastered ? 'Mastered 🏆' : 'Needs Practice ⚠️'}
                  </span>
                </div>
              </div>

              {/* Notes / Solutions */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Solution Notes & Traps
                </span>
                {question.notes ? (
                  <div className="p-3.5 rounded-2xl bg-[#14161c] border border-white/5 text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {question.notes}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic p-2">
                    No solution notes added. Tap Edit to add formulas, shortcuts, or key learnings.
                  </p>
                )}
              </div>
            </div>

            {/* Added date info */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <span>Saved in Bank</span>
              <span>
                {question.createdAt
                  ? new Date(question.createdAt).toLocaleDateString()
                  : 'Recently'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
