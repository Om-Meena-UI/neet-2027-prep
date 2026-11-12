import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SyllabusView from './components/SyllabusView';
import MockTestAnalytics from './components/MockTestAnalytics';
import FlashcardModal from './components/FlashcardModal';
import { ThemeProvider } from './components/ThemeProvider';
import { PrepProvider, usePrep } from './context/PrepContext';
import './index.css';

function AppContent() {
  const { state, toast } = usePrep();
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Navbar with Flashcard opener, Export/Import, Theme Switcher */}
      <Navbar onOpenFlashcards={() => setIsFlashcardOpen(true)} />

      {/* Main Body depending on active tab */}
      <main className="pb-12">
        {state.activeTab === 'syllabus' && <SyllabusView />}
        {state.activeTab === 'analytics' && <MockTestAnalytics />}
      </main>

      {/* Flashcards / Trap Deck Modal */}
      <FlashcardModal
        isOpen={isFlashcardOpen}
        onClose={() => setIsFlashcardOpen(false)}
      />

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-emerald-600 text-white border-emerald-700'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PrepProvider>
        <AppContent />
      </PrepProvider>
    </ThemeProvider>
  );
}
