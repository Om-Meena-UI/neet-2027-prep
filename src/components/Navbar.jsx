import React, { useRef } from 'react';
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  Download,
  Moon,
  Sun,
  Upload,
  Zap,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { usePrep } from '../context/PrepContext';

export default function Navbar({ onOpenFlashcards }) {
  const { theme, toggleTheme, setTheme } = useTheme();
  const { state, setActiveTab, exportFullState, importFullState } = usePrep();
  const fileInputRef = useRef(null);

  const pendingTrapsCount = state.trapCards.filter((c) => !c.mastered).length;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      importFullState(ev.target.result, setTheme);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-[#F8FAFC]/90 dark:bg-[#0B0F19]/85 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              NEET 2027 Prep Command Center
            </h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              NTA Rationalized Syllabus • Target 700+
            </p>
          </div>
        </div>

        {/* Primary View Switcher Tabs */}
        <nav
          aria-label="Primary Views"
          className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800"
        >
          <button
            type="button"
            onClick={() => setActiveTab('syllabus')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              state.activeTab === 'syllabus'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpenCheck className="w-4 h-4" />
            <span>Syllabus & Daily Prep</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              state.activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Mock Test Analytics</span>
          </button>
        </nav>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenFlashcards}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span className="hidden md:inline">Review All Traps</span>
            <span className="md:hidden">Traps</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[11px] bg-amber-500/20 dark:bg-amber-400/20 tabular-nums">
              {pendingTrapsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={exportFullState}
            title="Export JSON Backup"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-emerald-500/50 transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Import JSON Backup"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-emerald-500/50 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Light/Dark Theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
