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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="sleek-card max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#f97316]/10 text-[#f97316] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                NEET Trap Cards & Mnemonics
              </h3>
              <p className="text-[11px] text-zinc-400">
                Examiner pitfalls & high-frequency tricky exceptions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-[#262a34] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar styled as capsule pills */}
        <div className="px-5 py-3 bg-[#14161c] border-b border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => {
                setFilter('all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
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
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                filter === 'pending'
                  ? 'bg-[#f97316] text-black'
                  : 'text-zinc-400 hover:text-white'
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
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                filter === 'mastered'
                  ? 'bg-[#55e357] text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Mastered ({trapCards.filter((c) => c.mastered).length})
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#262a34] text-white hover:bg-[#323744] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAddForm ? 'Deck' : '+ Card'}
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-center">
          {showAddForm ? (
            <form onSubmit={handleCreate} className="space-y-3">
              <h4 className="font-bold text-sm text-white">Create Custom Trap Flashcard</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-[#14161c] text-white"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Chapter Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Thermodynamics"
                    value={newChapter}
                    onChange={(e) => setNewChapter(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-[#14161c] text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Front (Question / Trap Prompt)</label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Sign of work done during gas compression in Physics vs Chemistry?"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-[#14161c] text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Back (Explanation / Solution)</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Physics: ΔQ = ΔU + W. Chemistry: ΔU = q + w..."
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-[#14161c] text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#55e357] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#42ca44] transition shadow-glow-lime"
              >
                Save Flashcard
              </button>
            </form>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-10 text-zinc-400 text-xs">
              No flashcards in this filter view.
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[220px] p-6 rounded-3xl bg-[#14161c] border border-white/5 hover:border-white/10 cursor-pointer flex flex-col justify-between shadow-sleek relative select-none transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-widest text-[#55e357] text-[11px]">
                    {currentCard.subject} • {currentCard.chapter}
                  </span>
                  <span className="text-[11px] flex items-center gap-1 text-zinc-400">
                    <RotateCw className="w-3.5 h-3.5" />
                    {isFlipped ? 'Answer (Click to flip)' : 'Question (Click to flip)'}
                  </span>
                </div>

                <div className="my-auto py-5 text-center">
                  <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-3 border-t border-white/5">
                  <span>Card {currentIndex + 1} of {filteredCards.length}</span>
                  {currentCard.mastered ? (
                    <span className="text-[#55e357] font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Mastered
                    </span>
                  ) : (
                    <span className="text-[#f97316] font-medium">Needs Practice</span>
                  )}
                </div>
              </div>

              {/* Action Buttons for Card */}
              <div className="flex items-center justify-between w-full mt-5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleTrapMastered(currentCard.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                      currentCard.mastered
                        ? 'bg-[#55e357]/10 text-[#55e357] border border-[#55e357]/30'
                        : 'bg-[#262a34] text-zinc-300 hover:text-white'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {currentCard.mastered ? 'Mastered' : 'Mark as Mastered'}
                  </button>

                  <button
                    onClick={() => deleteTrapCard(currentCard.id)}
                    className="p-2 rounded-full bg-[#262a34] text-zinc-400 hover:text-rose-400 transition"
                    title="Delete card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={filteredCards.length <= 1}
                    className="p-2.5 rounded-full bg-[#262a34] text-zinc-300 hover:text-white disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={filteredCards.length <= 1}
                    className="p-2.5 rounded-full bg-[#262a34] text-zinc-300 hover:text-white disabled:opacity-40 transition"
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
