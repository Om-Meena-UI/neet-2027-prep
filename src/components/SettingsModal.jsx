import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Target,
  Clock,
  Cloud,
  Sliders,
  ShieldAlert,
  Check,
  RefreshCw,
  Download,
  Upload,
  Calendar,
  Award,
  Bell,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import { usePrep } from '../context/PrepContext';

const DREAM_COLLEGES = [
  'AIIMS New Delhi',
  'MAMC New Delhi',
  'JIPMER Puducherry',
  'VMMC New Delhi',
  'AFMC Pune',
  'KGMU Lucknow',
  'BJHMC Ahmedabad',
];

export default function SettingsModal({ isOpen, onClose }) {
  const {
    state,
    user,
    updateSettings,
    setCountdownTarget,
    exportFullState,
    importFullState,
    syncToCloud,
    loadFromCloud,
    resetAllState,
    isSyncing,
    lastSyncTime,
  } = usePrep();

  const fileInputRef = React.useRef(null);
  const currentSettings = state.settings || {};

  const [activeTab, setActiveTab] = useState('targets'); // 'targets' | 'timers' | 'cloud' | 'interface'
  const [targetScore, setTargetScore] = useState(currentSettings.targetScore || 700);
  const [dreamCollege, setDreamCollege] = useState(currentSettings.dreamCollege || 'AIIMS New Delhi');
  const [customCollege, setCustomCollege] = useState('');
  const [examDate, setExamDate] = useState(
    state.countdownTarget ? state.countdownTarget.split('T')[0] : '2027-05-02'
  );
  const [dailyHoursGoal, setDailyHoursGoal] = useState(currentSettings.dailyHoursGoal || 8);
  const [pomodoroFocusMin, setPomodoroFocusMin] = useState(currentSettings.pomodoroFocusMin || 25);
  const [pomodoroBreakMin, setPomodoroBreakMin] = useState(currentSettings.pomodoroBreakMin || 5);
  const [soundAlerts, setSoundAlerts] = useState(
    currentSettings.soundAlerts !== undefined ? currentSettings.soundAlerts : true
  );
  const [cardDensity, setCardDensity] = useState(currentSettings.cardDensity || 'comfortable');
  const [autoCloudSync, setAutoCloudSync] = useState(
    currentSettings.autoCloudSync !== undefined ? currentSettings.autoCloudSync : true
  );

  // Danger zone reset confirm text
  const [resetConfirmation, setResetConfirmation] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Sync state if external changes happen
  useEffect(() => {
    if (state.settings) {
      setTargetScore(state.settings.targetScore || 700);
      setDreamCollege(state.settings.dreamCollege || 'AIIMS New Delhi');
      setDailyHoursGoal(state.settings.dailyHoursGoal || 8);
      setPomodoroFocusMin(state.settings.pomodoroFocusMin || 25);
      setPomodoroBreakMin(state.settings.pomodoroBreakMin || 5);
      setSoundAlerts(state.settings.soundAlerts !== undefined ? state.settings.soundAlerts : true);
      setCardDensity(state.settings.cardDensity || 'comfortable');
      setAutoCloudSync(
        state.settings.autoCloudSync !== undefined ? state.settings.autoCloudSync : true
      );
    }
    if (state.countdownTarget) {
      setExamDate(state.countdownTarget.split('T')[0]);
    }
  }, [state.settings, state.countdownTarget]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const saveTargetSettings = () => {
    const chosenCollege = customCollege.trim() || dreamCollege;
    updateSettings({
      targetScore: Number(targetScore),
      dreamCollege: chosenCollege,
    });
    if (examDate) {
      setCountdownTarget(`${examDate}T14:00:00+05:30`);
    }
  };

  const saveTimerSettings = (newFocus, newBreak, newDaily, newSound) => {
    const f = newFocus !== undefined ? newFocus : pomodoroFocusMin;
    const b = newBreak !== undefined ? newBreak : pomodoroBreakMin;
    const d = newDaily !== undefined ? newDaily : dailyHoursGoal;
    const s = newSound !== undefined ? newSound : soundAlerts;

    setPomodoroFocusMin(f);
    setPomodoroBreakMin(b);
    setDailyHoursGoal(d);
    setSoundAlerts(s);

    updateSettings({
      pomodoroFocusMin: f,
      pomodoroBreakMin: b,
      dailyHoursGoal: d,
      soundAlerts: s,
    });
  };

  const handleCardDensityChange = (density) => {
    setCardDensity(density);
    updateSettings({ cardDensity: density });
  };

  const handleAutoCloudSyncToggle = () => {
    const newVal = !autoCloudSync;
    setAutoCloudSync(newVal);
    updateSettings({ autoCloudSync: newVal });
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      importFullState(ev.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmReset = () => {
    if (resetConfirmation === 'RESET') {
      resetAllState();
      setResetConfirmation('');
      setIsResetConfirmOpen(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-[#14161c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#191c24]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#262a34] flex items-center justify-center border border-white/10 text-[#55e357]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Command Center Settings</h2>
              <p className="text-xs text-zinc-400">Configure your targets, timers, cloud sync & routines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs Pill */}
        <div className="px-5 sm:px-6 pt-3 pb-2 bg-[#121419] border-b border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('targets')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'targets'
                ? 'bg-[#262a34] text-white border border-white/15 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-[#55e357]" />
            <span>Target & Goals</span>
          </button>

          <button
            onClick={() => setActiveTab('timers')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'timers'
                ? 'bg-[#262a34] text-white border border-white/15 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Timers & Routine</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'cloud'
                ? 'bg-[#262a34] text-white border border-white/15 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Cloud & Data</span>
          </button>

          <button
            onClick={() => setActiveTab('interface')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'interface'
                ? 'bg-[#262a34] text-white border border-white/15 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>Interface</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: TARGETS & GOALS */}
          {activeTab === 'targets' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Target Score Card */}
              <div className="p-4 rounded-2xl bg-[#191d24] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#55e357]" />
                    <label className="text-xs font-bold uppercase tracking-wider text-white">
                      Target NEET Score (out of 720)
                    </label>
                  </div>
                  <span className="text-sm font-black px-3 py-0.5 rounded-full bg-[#55e357]/15 text-[#55e357] border border-[#55e357]/30">
                    {targetScore} / 720
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="600"
                    max="720"
                    step="5"
                    value={targetScore}
                    onChange={(e) => {
                      setTargetScore(Number(e.target.value));
                      updateSettings({ targetScore: Number(e.target.value) });
                    }}
                    className="flex-1 accent-[#55e357] h-2 bg-[#262a34] rounded-lg cursor-pointer"
                  />
                  <div className="flex gap-1.5">
                    {[650, 680, 700, 715].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setTargetScore(preset);
                          updateSettings({ targetScore: preset });
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold transition ${
                          targetScore === preset
                            ? 'bg-[#55e357] text-black font-bold'
                            : 'bg-[#262a34] text-zinc-300 hover:text-white'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400">
                  {targetScore >= 700
                    ? '🌟 Target: AIIMS New Delhi / Top 50 National AIR Rank'
                    : targetScore >= 660
                    ? '🎯 Target: Premier Central Government Medical College (MAMC, VMMC)'
                    : '🩺 Target: Top State Government Medical College'}
                </p>
              </div>

              {/* Dream Medical College */}
              <div className="p-4 rounded-2xl bg-[#191d24] border border-white/5 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-white block">
                  Dream Medical College
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DREAM_COLLEGES.map((col) => (
                    <button
                      key={col}
                      onClick={() => {
                        setDreamCollege(col);
                        setCustomCollege('');
                        updateSettings({ dreamCollege: col });
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full transition ${
                        dreamCollege === col && !customCollege
                          ? 'bg-[#55e357] text-black font-bold shadow-glow-lime'
                          : 'bg-[#262a34] text-zinc-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Or enter custom college name..."
                    value={customCollege}
                    onChange={(e) => {
                      setCustomCollege(e.target.value);
                      if (e.target.value.trim()) {
                        updateSettings({ dreamCollege: e.target.value.trim() });
                      }
                    }}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#14161c] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#55e357]"
                  />
                </div>
              </div>

              {/* Target Exam Date */}
              <div className="p-4 rounded-2xl bg-[#191d24] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#f97316]" />
                    <label className="text-xs font-bold uppercase tracking-wider text-white">
                      Target Exam Date
                    </label>
                  </div>
                  <span className="text-xs text-zinc-400">Default: May 2, 2027</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => {
                      setExamDate(e.target.value);
                      if (e.target.value) {
                        setCountdownTarget(`${e.target.value}T14:00:00+05:30`);
                      }
                    }}
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-[#14161c] border border-white/10 text-white focus:outline-none focus:border-[#55e357]"
                  />
                  <button
                    onClick={() => {
                      setExamDate('2027-05-02');
                      setCountdownTarget('2027-05-02T14:00:00+05:30');
                    }}
                    className="text-xs px-3 py-2.5 rounded-xl bg-[#262a34] text-zinc-300 hover:text-white font-medium transition"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMERS & ROUTINE */}
          {activeTab === 'timers' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Daily Study Target Hours */}
              <div className="p-4 rounded-2xl bg-[#191d24] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <label className="text-xs font-bold uppercase tracking-wider text-white">
                      Daily Study Target (Hours/Day)
                    </label>
                  </div>
                  <span className="text-sm font-bold text-amber-400">{dailyHoursGoal} Hours</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[6, 8, 10, 12, 14].map((hrs) => (
                    <button
                      key={hrs}
                      onClick={() => saveTimerSettings(undefined, undefined, hrs, undefined)}
                      className={`py-2 rounded-xl text-xs font-semibold transition ${
                        dailyHoursGoal === hrs
                          ? 'bg-amber-400 text-black font-bold'
                          : 'bg-[#262a34] text-zinc-300 hover:text-white'
                      }`}
                    >
                      {hrs} hrs
                    </button>
                  ))}
                </div>
              </div>

              {/* Pomodoro Focus & Break Presets */}
              <div className="p-4 rounded-2xl bg-[#191d24] border border-white/5 space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-white block">
                  Pomodoro Intervals
                </label>

                {/* Focus duration */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span>Focus Session Duration</span>
                    <span className="font-bold text-[#55e357]">{pomodoroFocusMin} Minutes</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 45, 50, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => saveTimerSettings(mins, undefined, undefined, undefined)}
                        className={`py-2 rounded-xl text-xs font-semibold transition ${
                          pomodoroFocusMin === mins
                            ? 'bg-[#55e357] text-black font-bold'
                            : 'bg-[#262a34] text-zinc-300 hover:text-white'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Break duration */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span>Short Break Duration</span>
                    <span className="font-bold text-sky-400">{pomodoroBreakMin} Minutes</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => saveTimerSettings(undefined, mins, undefined, undefined)}
                        className={`py-2 rounded-xl text-xs font-semibold transition ${
                          pomodoroBreakMin === mins
                            ? 'bg-sky-400 text-black font-bold'
                            : 'bg-[#262a34] text-zinc-300 hover:text-white'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sound Notifications */}
              <div className="p-4 rounded-2xl bg-[#191d24] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-300">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Timer Audio Chimes</div>
                    <div className="text-[11px] text-zinc-400">Play gentle audio chime when study session finishes</div>
                  </div>
                </div>
                <button
                  onClick={() => saveTimerSettings(undefined, undefined, undefined, !soundAlerts)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    soundAlerts ? 'bg-[#55e357]' : 'bg-[#262a34]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      soundAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CLOUD SYNC & DATA */}
          {activeTab === 'cloud' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Cloud Account Status Card */}
              <div className="p-4 rounded-2xl bg-[#191d24] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Firebase Cloud Sync
                    </span>
                  </div>
                  {user ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#55e357]">
                      <span className="w-2 h-2 rounded-full bg-[#55e357] animate-pulse" />
                      Connected ({user.email || user.name})
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-zinc-400">
                      Not Signed In (Local-Only)
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400">
                  {user
                    ? 'Your study streak, chapters, timers, and test scores sync securely to your Firebase account across all devices.'
                    : 'Sign in from the top navbar to automatically sync and access your prep center across phone, tablet, and laptop.'}
                </p>

                {/* Cloud Actions */}
                {user && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      onClick={syncToCloud}
                      disabled={isSyncing}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-bold transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync to Cloud Now'}</span>
                    </button>

                    <button
                      onClick={loadFromCloud}
                      disabled={isSyncing}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#262a34] hover:bg-white/10 text-zinc-200 text-xs font-medium transition disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Pull Latest from Cloud</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Offline JSON Backup & Restore */}
              <div className="p-4 rounded-2xl bg-[#191d24] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white">
                    Offline JSON Backup
                  </label>
                  <span className="text-[11px] text-zinc-400">Export or restore full offline snapshot</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={exportFullState}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#262a34] hover:bg-white/10 text-white text-xs font-semibold transition border border-white/5"
                  >
                    <Download className="w-3.5 h-3.5 text-[#55e357]" />
                    <span>Download JSON Backup</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileImport}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#262a34] hover:bg-white/10 text-white text-xs font-semibold transition border border-white/5"
                  >
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>Restore from JSON File</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone: Reset All Progress */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 space-y-3">
                <div className="flex items-center gap-2 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Danger Zone</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Permanently clear your local chapter ticks, timers, and mock tests. This cannot be undone.
                </p>

                {!isResetConfirmOpen ? (
                  <button
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition"
                  >
                    Reset All Prep Data...
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-black/40 border border-rose-500/30 space-y-2">
                    <p className="text-[11px] text-rose-300">
                      Type <span className="font-bold underline">RESET</span> to confirm wiping all progress:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type RESET"
                        value={resetConfirmation}
                        onChange={(e) => setResetConfirmation(e.target.value)}
                        className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-black border border-rose-800 text-rose-200 focus:outline-none focus:border-rose-500 font-mono"
                      />
                      <button
                        onClick={handleConfirmReset}
                        disabled={resetConfirmation !== 'RESET'}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold transition"
                      >
                        Confirm Wipe
                      </button>
                      <button
                        onClick={() => {
                          setIsResetConfirmOpen(false);
                          setResetConfirmation('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-xs transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: INTERFACE & DISPLAY */}
          {activeTab === 'interface' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Chapter Card Density */}
              <div className="p-4 rounded-2xl bg-[#191d24] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-purple-400" />
                    <label className="text-xs font-bold uppercase tracking-wider text-white">
                      Chapter Card Layout Density
                    </label>
                  </div>
                  <span className="text-xs capitalize font-semibold text-purple-300">
                    {cardDensity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => handleCardDensityChange('comfortable')}
                    className={`p-3 rounded-xl text-left border transition ${
                      cardDensity === 'comfortable'
                        ? 'bg-purple-950/30 border-purple-500/50 text-white'
                        : 'bg-[#262a34] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Comfortable (Standard)</div>
                    <div className="text-[11px] text-zinc-400">
                      Spacious cards with full stage tags & badges.
                    </div>
                  </button>

                  <button
                    onClick={() => handleCardDensityChange('compact')}
                    className={`p-3 rounded-xl text-left border transition ${
                      cardDensity === 'compact'
                        ? 'bg-purple-950/30 border-purple-500/50 text-white'
                        : 'bg-[#262a34] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Compact (Condensed)</div>
                    <div className="text-[11px] text-zinc-400">
                      High-density layout to view more chapters per screen.
                    </div>
                  </button>
                </div>
              </div>

              {/* Automatic Cloud Sync on Edit */}
              <div className="p-4 rounded-2xl bg-[#191d24] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-300">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Auto-Sync on Changes</div>
                    <div className="text-[11px] text-zinc-400">
                      Automatically push ticks and changes to Firebase in background
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleAutoCloudSyncToggle}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    autoCloudSync ? 'bg-[#55e357]' : 'bg-[#262a34]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      autoCloudSync ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* About Command Center */}
              <div className="p-4 rounded-2xl bg-[#191d24] border border-white/5 space-y-1 text-center">
                <div className="text-xs font-bold text-white">NEET 2027 Command Center v1.2</div>
                <div className="text-[11px] text-zinc-500">
                  Engineered with obsession for 700+ NEET aspirants.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-white/10 flex items-center justify-between bg-[#191c24]">
          <div className="text-[11px] text-zinc-400">
            {lastSyncTime ? `Last synced: ${new Date(lastSyncTime).toLocaleTimeString()}` : 'Changes saved locally'}
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#55e357] hover:bg-[#42ca44] text-black text-xs font-bold transition shadow-glow-lime"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
