import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SyllabusView from './components/SyllabusView';
import MockTestAnalytics from './components/MockTestAnalytics';
import QuestionBankView from './components/QuestionBankView';
import FlashcardModal from './components/FlashcardModal';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import FloatingBottomPlayer from './components/FloatingBottomPlayer';
import MobileBottomNav from './components/MobileBottomNav';
import { ThemeProvider } from './components/ThemeProvider';
import { PrepProvider, usePrep } from './context/PrepContext';
import { MusicProvider } from './context/MusicContext';
import './index.css';

function AppContent() {
  const { state, toast } = usePrep();
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#0e1013] text-zinc-100 antialiased selection:bg-[#55e357] selection:text-black pb-36 sm:pb-28">
      {/* Sleek Floating Capsule Top Navbar */}
      <Navbar
        onOpenFlashcards={() => setIsFlashcardOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Body */}
      <main className="pb-8">
        {state.activeTab === 'syllabus' && <SyllabusView />}
        {state.activeTab === 'analytics' && <MockTestAnalytics />}
        {state.activeTab === 'questions' && <QuestionBankView />}
      </main>

      {/* Mobile Quick Navigation Pill */}
      <MobileBottomNav
        onOpenFlashcards={() => setIsFlashcardOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Persistent Floating Bottom Audio Player Bar (Fully Synced with YouTube Music Embed) */}
      <FloatingBottomPlayer />

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

      {/* Impeccable Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Sleek Toast Notification */}
      {toast && (
        <div className="fixed bottom-28 sm:bottom-24 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 ease-out">
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
        <MusicProvider>
          <AppContent />
        </MusicProvider>
      </PrepProvider>
    </ThemeProvider>
  );
}
