import React from 'react';
import {
  Compass,
  BarChart2,
  Clock,
  CheckCircle2,
  Settings,
  FileQuestion,
} from 'lucide-react';
import { usePrep } from '../context/PrepContext';

export default function MobileBottomNav({ onOpenFlashcards, onOpenSettings }) {
  const { state, setActiveTab, mobileSection, setMobileSection } = usePrep();

  const handleNavClick = (tab, section = 'chapters') => {
    setActiveTab(tab);
    if (section) setMobileSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isRoadmapActive = state.activeTab === 'syllabus' && mobileSection === 'chapters';
  const isTimerActive = state.activeTab === 'syllabus' && mobileSection === 'timer';
  const isTasksActive = state.activeTab === 'syllabus' && mobileSection === 'tasks';
  const isMocksActive = state.activeTab === 'analytics';

  return (
    <nav className="lg:hidden fixed bottom-20 inset-x-2.5 sm:inset-x-4 z-40">
      <div className="bg-[#14161c]/95 backdrop-blur-2xl border border-white/10 rounded-full px-1.5 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex items-center justify-between gap-0.5">
        {/* Roadmap (Chapters) */}
        <button
          onClick={() => handleNavClick('syllabus', 'chapters')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-full min-h-[44px] transition-all active:scale-95 ${
            isRoadmapActive
              ? 'bg-[#55e357]/20 text-[#55e357] font-bold border border-[#55e357]/30 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4 flex-shrink-0" />
          <span className="text-[10px] tracking-tight truncate max-w-full">Roadmap</span>
        </button>

        {/* Focus Timer */}
        <button
          onClick={() => handleNavClick('syllabus', 'timer')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-full min-h-[44px] transition-all active:scale-95 ${
            isTimerActive
              ? 'bg-[#55e357]/20 text-[#55e357] font-bold border border-[#55e357]/30 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span className="text-[10px] tracking-tight truncate max-w-full">Timer</span>
        </button>

        {/* Daily Tasks */}
        <button
          onClick={() => handleNavClick('syllabus', 'tasks')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-full min-h-[44px] transition-all active:scale-95 ${
            isTasksActive
              ? 'bg-[#55e357]/20 text-[#55e357] font-bold border border-[#55e357]/30 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="text-[10px] tracking-tight truncate max-w-full">Tasks</span>
        </button>

        {/* Mock Analytics */}
        <button
          onClick={() => handleNavClick('analytics')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-full min-h-[44px] transition-all active:scale-95 ${
            isMocksActive
              ? 'bg-[#55e357]/20 text-[#55e357] font-bold border border-[#55e357]/30 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4 flex-shrink-0" />
          <span className="text-[10px] tracking-tight truncate max-w-full">Mocks</span>
        </button>

        {/* Question Bank */}
        <button
          onClick={() => handleNavClick('questions')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-full min-h-[44px] transition-all active:scale-95 ${
            state.activeTab === 'questions'
              ? 'bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileQuestion className="w-4 h-4 flex-shrink-0" />
          <span className="text-[10px] tracking-tight truncate max-w-full">Q-Bank</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-full min-h-[44px] text-zinc-400 hover:text-white transition-all active:scale-95"
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span className="text-[10px] tracking-tight truncate max-w-full">Settings</span>
        </button>
      </div>
    </nav>
  );
}
