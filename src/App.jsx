import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SyllabusView from './components/SyllabusView';
import MockTestAnalytics from './components/MockTestAnalytics';
import FlashcardModal from './components/FlashcardModal';
import AuthModal from './components/AuthModal';
import { ThemeProvider } from './components/ThemeProvider';
import { PrepProvider, usePrep } from './context/PrepContext';
import './index.css';

function AppContent() {
  const { state, toast } = usePrep();
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0e1013] text-zinc-100 antialiased selection:bg-[#55e357] selection:text-black">
      {/* Sleek Floating Capsule Navbar */}
      <Navbar
        onOpenFlashcards={() => setIsFlashcardOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Body */}
      <main className="pb-16">
        {state.activeTab === 'syllabus' && <SyllabusView />}
        {state.activeTab === 'analytics' && <MockTestAnalytics />}
      </main>

      {/* Flashcards / Trap Deck Modal */}
      <FlashcardModal
        isOpen={isFlashcardOpen}
        onClose={() => setIsFlashcardOpen(false)}
      />

      {/* Account Login / Create Account Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Sleek Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-2.5 rounded-full shadow-sleek text-xs font-bold flex items-center gap-2 border ${
              toast.type === 'error'
                ? 'bg-rose-900/90 text-rose-200 border-rose-700/50'
                : 'bg-[#1a1d24] text-[#55e357] border-[#55e357]/40 shadow-glow-lime'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#55e357]" />
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
