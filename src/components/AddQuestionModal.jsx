import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Tag,
  Check,
  Plus,
  BookOpen,
  AlertCircle,
  HelpCircle,
  RotateCw,
  Crop,
} from 'lucide-react';
import { usePrep } from '../context/PrepContext';
import { compressImageFile, extractImageFromClipboard } from '../utils/imageCompressor';
import ImageCropper from './ImageCropper';

// Preset tags with distinctive color themes
export const PRESET_TAGS = [
  { id: 'HOTS', label: 'HOTS', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  { id: 'Frequently Asked Question', label: 'Frequently Asked Question', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { id: 'Fact Based', label: 'Fact Based', color: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  { id: 'Assertion & Reason', label: 'Assertion & Reason', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { id: 'Calculation Intensive', label: 'Calculation Intensive', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  { id: 'Diagram Based', label: 'Diagram Based', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
];

export default function AddQuestionModal({
  isOpen,
  onClose,
  initialSubject = 'Physics',
  initialChapterId = '',
  editingQuestion = null,
}) {
  const { allChapters, syllabusData, addQuestion, updateQuestion, showToast } = usePrep();

  const [subject, setSubject] = useState(initialSubject);
  const [chapterId, setChapterId] = useState(initialChapterId);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [tags, setTags] = useState(['Frequently Asked Question']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isMastered, setIsMastered] = useState(false);

  // Image State
  const [imageUrl, setImageUrl] = useState('');
  const [rawImageUrl, setRawImageUrl] = useState('');
  const [imageMeta, setImageMeta] = useState(null); // { sizeKb, width, height }
  const [isCompressing, setIsCompressing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Reset or initialize form
  useEffect(() => {
    setIsCropping(false);
    if (editingQuestion) {
      setSubject(editingQuestion.subject || 'Physics');
      setChapterId(editingQuestion.chapterId || '');
      setTitle(editingQuestion.title || '');
      setNotes(editingQuestion.notes || '');
      setDifficulty(editingQuestion.difficulty || 'Medium');
      setTags(editingQuestion.tags || ['Frequently Asked Question']);
      setImageUrl(editingQuestion.imageUrl || '');
      setRawImageUrl(editingQuestion.imageUrl || '');
      setIsMastered(Boolean(editingQuestion.isMastered));
      setImageMeta(null);
    } else {
      setSubject(initialSubject || 'Physics');
      setChapterId(initialChapterId || '');
      setTitle('');
      setNotes('');
      setDifficulty('Medium');
      setTags(['Frequently Asked Question']);
      setImageUrl('');
      setRawImageUrl('');
      setIsMastered(false);
      setImageMeta(null);
    }
  }, [editingQuestion, initialSubject, initialChapterId, isOpen]);

  // If chapterId is empty or doesn't belong to selected subject, auto-select first chapter of subject
  useEffect(() => {
    const chaptersForSubject = allChapters.filter((c) => c.subject === subject);
    const isValidChapter = chaptersForSubject.some((c) => c.id === chapterId);
    if (!isValidChapter && chaptersForSubject.length > 0) {
      setChapterId(chaptersForSubject[0].id);
    }
  }, [subject, allChapters, chapterId]);

  // Handle Clipboard Paste (Ctrl+V) when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e) => {
      const file = extractImageFromClipboard(e);
      if (file) {
        e.preventDefault();
        await processImageFile(file);
        showToast('Pasted screenshot from clipboard! 📋');
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const processImageFile = async (file) => {
    if (!file) return;
    try {
      setIsCompressing(true);
      const res = await compressImageFile(file, 1400, 0.88);
      setRawImageUrl(res.dataUrl);
      setImageUrl(res.dataUrl);
      setImageMeta({
        sizeKb: res.sizeKb,
        originalSizeKb: res.originalSizeKb,
        width: res.width,
        height: res.height,
      });
      setIsCropping(true);
      // If title is empty, prefill a nice default
      if (!title.trim()) {
        const found = allChapters.find((c) => c.id === chapterId);
        setTitle(found ? `${found.title} - Question` : 'Important NEET Question');
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to process image', 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const toggleTag = (tagId) => {
    setTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageUrl) {
      showToast('Please click or upload a question image first.', 'error');
      return;
    }

    const selectedChapter = allChapters.find((c) => c.id === chapterId);
    const chapterTitle = selectedChapter ? selectedChapter.title : 'General';

    const questionData = {
      title: title.trim() || `${chapterTitle} Question`,
      subject,
      chapterId: chapterId || (selectedChapter?.id || ''),
      chapterTitle,
      imageUrl,
      tags: tags.length > 0 ? tags : ['Frequently Asked Question'],
      notes: notes.trim(),
      difficulty,
      isMastered,
    };

    if (editingQuestion) {
      updateQuestion(editingQuestion.id, questionData);
    } else {
      addQuestion(questionData);
    }

    onClose();
  };

  if (!isOpen) return null;

  const currentSubjectChapters = allChapters.filter((c) => c.subject === subject);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#14161c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-[#191d24]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {editingQuestion ? 'Edit Saved Question' : 'Upload Question to Bank'}
              </h2>
              <p className="text-xs text-zinc-400">
                Snap, tag, and categorize into your high-yield vault
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Image Upload / Capture Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span>Question Image / Photo *</span>
              {imageMeta && (
                <span className="text-[10px] text-zinc-400 font-mono normal-case">
                  Compressed: {imageMeta.sizeKb} KB ({imageMeta.width}x{imageMeta.height}px)
                </span>
              )}
            </label>

            {/* Hidden file & camera inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {imageUrl ? (
              isCropping ? (
                <ImageCropper
                  imageSrc={rawImageUrl || imageUrl}
                  onCropComplete={(cropped) => {
                    setImageUrl(cropped.dataUrl);
                    setImageMeta({
                      sizeKb: cropped.sizeKb,
                      width: cropped.width,
                      height: cropped.height,
                    });
                    setIsCropping(false);
                    showToast('Image cropped! ✂️');
                  }}
                  onCancel={() => setIsCropping(false)}
                />
              ) : (
                /* Image Preview Box with persistent mobile-friendly action bar */
                <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/60">
                  <img
                    src={imageUrl}
                    alt="Question Preview"
                    className="w-full max-h-72 object-contain mx-auto"
                  />

                  <div className="p-2.5 bg-[#191d24] border-t border-white/10 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCropping(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#55e357]/15 hover:bg-[#55e357]/25 text-[#55e357] text-xs font-bold flex items-center gap-1.5 border border-[#55e357]/30 transition active:scale-95"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>Crop / Rotate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5 text-sky-400" />
                      <span>Retake</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setRawImageUrl('');
                        setImageMeta(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-rose-500/30 transition active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* Drop / Upload Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all ${
                  isDragging
                    ? 'border-[#55e357] bg-[#55e357]/10'
                    : 'border-white/10 bg-[#171920] hover:border-white/20'
                }`}
              >
                {isCompressing ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-zinc-300">
                      Compressing and optimizing question photo...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-inner">
                      <ImageIcon className="w-7 h-7" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white">
                        Click a photo or upload question image
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Take a camera picture, drag & drop, or paste screenshot (<kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px]">Ctrl+V</kbd>)
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-md"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Take Photo (Camera)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-[#262a34] hover:bg-[#323744] text-white font-semibold text-xs flex items-center gap-2 border border-white/10 transition active:scale-95"
                      >
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span>Choose File / Screenshot</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subject & Chapter Selection (Categorization) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                1. Select Subject *
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'Physics', color: '#38bdf8' },
                  { id: 'Chemistry', color: '#f59e0b' },
                  { id: 'Biology', color: '#55e357' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSubject(sub.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border active:scale-95 ${
                      subject === sub.id
                        ? 'bg-[#262a34] text-white border-white/20 shadow-inner'
                        : 'bg-[#181a20] text-zinc-400 border-white/5 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span>{sub.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                2. Select Chapter *
              </label>
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a20] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {currentSubjectChapters.map((ch) => (
                  <option key={ch.id} value={ch.id} className="bg-[#14161c] text-white">
                    {ch.className}: {ch.title} {ch.weightage === 'High Yield' ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Question Title / Concept
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NEET 2023 - Rotational inertia of hollow sphere with cavity"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a20] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Tags Selection (Multi-select) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-400" />
                <span>Multiple Tags *</span>
              </label>
              <span className="text-[10px] text-zinc-400">
                Tap to toggle multiple tags
              </span>
            </div>

            {/* Preset Tags Chips */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((t) => {
                const isSelected = tags.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 flex items-center gap-1.5 ${
                      isSelected
                        ? `${t.color} shadow-sm ring-1 ring-white/20`
                        : 'bg-[#181a20] text-zinc-400 border-white/5 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Tags Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                placeholder="Add custom tag (e.g. Formula Trap, 2024 PYQ)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[#181a20] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 rounded-xl bg-[#262a34] hover:bg-[#323744] text-xs font-bold text-white border border-white/10 transition active:scale-95 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Custom tags active chips */}
            {tags.filter((t) => !PRESET_TAGS.some((p) => p.id === t)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags
                  .filter((t) => !PRESET_TAGS.some((p) => p.id === t))
                  .map((customTag) => (
                    <span
                      key={customTag}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center gap-1.5"
                    >
                      <span>#{customTag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(customTag)}
                        className="hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Difficulty and Mastered status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border active:scale-95 ${
                      difficulty === diff
                        ? diff === 'Easy'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                          : diff === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm'
                        : 'bg-[#181a20] text-zinc-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Mastered status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Status
              </label>
              <button
                type="button"
                onClick={() => setIsMastered(!isMastered)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-2 active:scale-95 ${
                  isMastered
                    ? 'bg-[#55e357]/20 text-[#55e357] border-[#55e357]/40 shadow-glow-lime'
                    : 'bg-[#181a20] text-zinc-400 border-white/5 hover:text-white'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isMastered ? 'bg-[#55e357]' : 'bg-zinc-600'
                  }`}
                />
                <span>{isMastered ? 'Mastered / Solved 🏆' : 'Needs Revision ⚠️'}</span>
              </button>
            </div>
          </div>

          {/* Solution / Key Learning Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Key Solution Notes / Trap to Avoid
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Common mistake is forgetting friction on the inclined plane. Remember formula: a = g(sinθ - μcosθ)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a20] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-sky-500 leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#55e357] hover:bg-[#48ce4a] text-black transition shadow-glow-lime active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingQuestion ? 'Update Question' : 'Save to Question Bank'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
