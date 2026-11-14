import React, { useRef } from 'react';
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
} from 'lucide-react';
import { usePrep } from '../context/PrepContext';

export default function Navbar({ onOpenFlashcards, onOpenAuth }) {
  const { state, user, setActiveTab, exportFullState, importFullState } = usePrep();
  const fileInputRef = useRef(null);

  const pendingTrapsCount = (state.trapCards || []).filter((c) => !c.mastered).length;

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
    <header className="sticky top-0 z-30 pt-4 pb-2 px-4 sm:px-6">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left Floating Capsule: Logo & Navigation Tabs */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 bg-[#1a1d24] border border-white/5 rounded-full px-4 py-2 shadow-sleek">
          {/* Logo badge with neon flame / pulse */}
          <div className="flex items-center gap-2.5 pr-2 border-r border-white/10">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#13151a] to-[#262a34] flex items-center justify-center border border-white/10 text-[#55e357]">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
              NEET<span className="text-[#55e357]">27</span>
            </span>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                state.activeTab === 'syllabus'
                  ? 'bg-[#262a34] text-white shadow-inner border border-white/10'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#f97316] inline-block animate-pulse" />
              Roadmap
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                state.activeTab === 'analytics'
                  ? 'bg-[#262a34] text-white shadow-inner border border-white/10'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#55e357] inline-block" />
              Mock Analytics
            </button>
          </div>

          {/* Trap Cards Pill */}
          <button
            onClick={onOpenFlashcards}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#262a34]/60 hover:bg-[#262a34] text-zinc-300 hover:text-white transition border border-white/5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Traps</span>
            {pendingTrapsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30">
                {pendingTrapsCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Floating Capsule: Data Export/Import & Profile / Sign In */}
        <div className="w-full md:w-auto flex items-center justify-end gap-2 bg-[#1a1d24] border border-white/5 rounded-full px-4 py-2 shadow-sleek">
          {/* Export JSON */}
          <button
            onClick={exportFullState}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#262a34] transition"
            title="Download full progress backup"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Backup</span>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#262a34] transition"
            title="Restore JSON backup"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Restore</span>
          </button>

          {/* Profile / Login Button */}
          <div className="pl-2 border-l border-white/10">
            {user ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#14161c] hover:bg-[#262a34] border border-white/5 transition"
              >
                <div className="w-6 h-6 rounded-full bg-[#55e357]/20 text-[#55e357] flex items-center justify-center text-xs font-bold border border-[#55e357]/40">
                  {user.avatar || user.name[0]}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight truncate max-w-[100px]">
                    {user.name}
                  </div>
                  <div className="text-[9px] text-[#55e357] leading-none">Target 700+</div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#55e357] text-black text-xs font-bold hover:bg-[#42ca44] transition shadow-glow-lime"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
