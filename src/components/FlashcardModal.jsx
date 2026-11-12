import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle, RotateCw, Plus, Sparkles, Trash2 } from 'lucide-react';
import { usePrep } from '../context/PrepContext';

export default function FlashcardModal({ isOpen, onClose }) {
  const { state, toggleTrapMastered, addTrapCard, deleteTrapCard } = usePrep();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'mastered'
  const [showAddForm, setShowAddForm] = useState(false);

  // New trap card form state
  const [newSubject, setNewSubject] = useState('Physics');
  const [newChapter, setNewChapter] = useState('');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  if (!isOpen) return null;

  const trapCards = state.trapCards || [];

  const filteredCards = trapCards.filter((card) => {
    if (filter === 'pending') return !card.mastered;
    if (filter === 'mastered') return card.mastered;
    return true;
  });

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    addTrapCard({
      subject: newSubject,
      chapter: newChapter || 'General',
      front: newFront,
      back: newBack,
    });
    setNewFront('');
    setNewBack('');
    setNewChapter('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                NEET Trap Cards & Mnemonics
              </h3>
              <p className="text-[11px] text-slate-500">
                High-frequency examiner traps & recurring trick questions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Actions */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => {
                setFilter('all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
              }`}
            >
              All ({trapCards.length})
            </button>
            <button
              onClick={() => {
                setFilter('pending');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'pending'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
              }`}
            >
              Unmastered ({trapCards.filter((c) => !c.mastered).length})
            </button>
            <button
              onClick={() => {
                setFilter('mastered');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'mastered'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
              }`}
            >
              Mastered ({trapCards.filter((c) => c.mastered).length})
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAddForm ? 'View Cards' : 'Add Card'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-center">
          {showAddForm ? (
            <form onSubmit={handleCreate} className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Create Custom Trap Card</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Chapter Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Thermodynamics"
                    value={newChapter}
                    onChange={(e) => setNewChapter(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Front (Question / Trap Prompt)</label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Sign of work done during gas compression in Physics vs Chemistry?"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Back (Explanation / Solution)</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Physics: ΔQ = ΔU + W. Chemistry: ΔU = q + w..."
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                Save Flashcard
              </button>
            </form>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No flashcards in this filter view.
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[220px] p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 cursor-pointer flex flex-col justify-between shadow-inner relative select-none hover:border-indigo-400 dark:hover:border-indigo-700 transition"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {currentCard.subject} • {currentCard.chapter}
                  </span>
                  <span className="text-[11px] flex items-center gap-1 text-slate-400">
                    <RotateCw className="w-3.5 h-3.5" />
                    {isFlipped ? 'Answer' : 'Question (Click to flip)'}
                  </span>
                </div>

                <div className="my-auto py-4 text-center">
                  <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                  <span>Card {currentIndex + 1} of {filteredCards.length}</span>
                  {currentCard.mastered ? (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Mastered
                    </span>
                  ) : (
                    <span className="text-amber-500 font-medium">Needs Practice</span>
                  )}
                </div>
              </div>

              {/* Action Buttons for Card */}
              <div className="flex items-center justify-between w-full mt-5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleTrapMastered(currentCard.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      currentCard.mastered
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {currentCard.mastered ? 'Mastered' : 'Mark as Mastered'}
                  </button>

                  <button
                    onClick={() => deleteTrapCard(currentCard.id)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Delete card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={filteredCards.length <= 1}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={filteredCards.length <= 1}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
