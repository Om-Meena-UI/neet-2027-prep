import React, { useState } from 'react';
import {
  Compass,
  BarChart2,
  Calendar,
  Layers,
  Music,
  CheckCircle2,
} from 'lucide-react';
import { usePrep } from '../context/PrepContext';

export default function MobileBottomNav({ onOpenFlashcards }) {
  const { state, setActiveTab } = usePrep();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sm:hidden fixed bottom-18 inset-x-4 z-40">
      <div className="bg-[#14161c]/95 backdrop-blur-xl border border-white/10 rounded-full px-3 py-2 shadow-2xl flex items-center justify-around">
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all ${
            state.activeTab === 'syllabus'
              ? 'text-[#55e357] font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px]">Roadmap</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('syllabus');
            setTimeout(() => scrollToSection('mobile-timer-section'), 100);
          }}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-full text-zinc-400 hover:text-white transition-all"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px]">Timer</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('syllabus');
            setTimeout(() => scrollToSection('mobile-todo-section'), 100);
          }}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-full text-zinc-400 hover:text-white transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-[10px]">Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all ${
            state.activeTab === 'analytics'
              ? 'text-[#55e357] font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span className="text-[10px]">Mocks</span>
        </button>
      </div>
    </nav>
  );
}
