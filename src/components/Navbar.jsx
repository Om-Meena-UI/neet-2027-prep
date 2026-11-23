import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Search,
  Zap,
  Download,
  Upload,
  User,
  Activity,
  LogIn,
  ListTodo,
  CheckCircle2,
  Calendar,
  Layers,
  Settings,
  FileQuestion,
} from 'lucide-react';
import { usePrep } from '../context/PrepContext';
import logoImg from '../assets/logo.png';

export default function Navbar({ onOpenFlashcards, onOpenAuth, onOpenSettings }) {
  const { state, user, setActiveTab, exportFullState, importFullState } = usePrep();
  const fileInputRef = React.useRef(null);

  const pendingTrapsCount = (state.trapCards || []).filter((c) => !c.mastered).length;
  const questionCount = (state.questions || []).length;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      importFullState(ev.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-30 pt-3 pb-2 px-3 sm:px-6">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2">
        {/* Left Floating Capsule: Logo & View Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1a1d24] border border-white/5 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-sleek">
          {/* Logo badge */}
          <div className="flex items-center gap-2 pr-1.5 sm:pr-2 border-r border-white/10">
            <div className="w-7 h-7 rounded-xl bg-black flex items-center justify-center border border-white/10 overflow-hidden shadow-inner">
              <img src={logoImg} alt="NEET 2027" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xs sm:text-sm tracking-tight text-white hidden sm:inline">
              NEET<span className="text-[#55e357]">27</span>
            </span>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                state.activeTab === 'syllabus'
                  ? 'bg-[#262a34] text-white shadow-inner border border-white/10'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] inline-block animate-pulse" />
              <span>Roadmap</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                state.activeTab === 'analytics'
                  ? 'bg-[#262a34] text-white shadow-inner border border-white/10'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#55e357] inline-block" />
              <span>Mocks</span>
            </button>
          </div>

          {/* Trap Cards Pill */}
          <button
            onClick={onOpenFlashcards}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#262a34]/60 hover:bg-[#262a34] text-zinc-300 hover:text-white transition border border-white/5"
            title="NEET Trap Cards"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">Traps</span>
            {pendingTrapsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30">
                {pendingTrapsCount}
              </span>
            )}
          </button>

          {/* Question Bank Pill */}
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              state.activeTab === 'questions'
                ? 'bg-[#262a34] text-white shadow-inner border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Question Bank Vault"
          >
            <FileQuestion className="w-3.5 h-3.5 text-sky-400" />
            <span>Question Bank</span>
            {questionCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {questionCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Floating Capsule: Export/Import & Profile / Sign In */}
        <div className="flex items-center gap-1 sm:gap-2 bg-[#1a1d24] border border-white/5 rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-sleek">
          {/* Export JSON (Hidden on tiny mobile, visible from sm up) */}
          <button
            onClick={exportFullState}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#262a34] transition"
            title="Download full progress backup"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Backup</span>
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#262a34] transition"
            title="Restore JSON backup"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Restore</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#262a34] transition border border-white/5"
            title="Command Center Settings"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Settings</span>
          </button>

          {/* Profile / Login Button */}
          <div className="sm:pl-1.5 sm:border-l sm:border-white/10">
            {user ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-[#14161c] hover:bg-[#262a34] border border-white/5 transition"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-[#55e357]/40"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#55e357]/20 text-[#55e357] flex items-center justify-center text-xs font-bold border border-[#55e357]/40">
                    {user.avatar || user.name[0]}
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-white leading-tight truncate max-w-[90px]">
                    {user.name}
                  </div>
                  <div className="text-[9px] text-[#55e357] leading-none">Target 700+</div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#55e357] text-black text-xs font-bold hover:bg-[#42ca44] transition shadow-glow-lime"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
