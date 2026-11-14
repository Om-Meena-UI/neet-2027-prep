import React, { useState } from 'react';
import { Award, Plus, Trash2, TrendingUp, AlertCircle, X } from 'lucide-react';
import { usePrep } from '../context/PrepContext';

export default function MockTestAnalytics() {
  const { state, addMockTest, deleteMockTest } = usePrep();
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().slice(0, 10),
    physics: '',
    chemistry: '',
    biology: '',
    notes: '',
  });

  const mockTests = state.mockTests || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    addMockTest(formData);
    setFormData({
      name: '',
      date: new Date().toISOString().slice(0, 10),
      physics: '',
      chemistry: '',
      biology: '',
      notes: '',
    });
    setShowAddModal(false);
  };

  const totalTests = mockTests.length;
  const bestScore = mockTests.reduce((max, t) => Math.max(max, t.total || 0), 0);
  const avgScore = totalTests
    ? Math.round(mockTests.reduce((sum, t) => sum + (t.total || 0), 0) / totalTests)
    : 0;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="sleek-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#55e357]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#55e357]">
              Performance Dashboard
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Mock Test Analytics
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            NTA Standard NEET Score Trajectory (Max 720: 180 Phy + 180 Chem + 360 Bio)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#55e357] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#42ca44] shadow-glow-lime transition self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Log Mock Score
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sleek-card p-5">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
            Total Mocks Taken
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {totalTests}
          </div>
        </div>

        <div className="sleek-card p-5">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
            Highest Score
          </div>
          <div className="text-3xl font-black font-mono text-[#55e357]">
            {bestScore} <span className="text-xs font-sans font-normal text-zinc-400">/ 720</span>
          </div>
        </div>

        <div className="sleek-card p-5">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
            Average Score
          </div>
          <div className="text-3xl font-black font-mono text-sky-400">
            {avgScore} <span className="text-xs font-sans font-normal text-zinc-400">/ 720</span>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="sleek-card p-6">
        <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#55e357]" />
          Historical Test Log
        </h3>

        {mockTests.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-xs">
            <AlertCircle className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
            No tests logged yet. Click "Log Mock Score" above to add your first exam test.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Test Name</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-center">Physics (180)</th>
                  <th className="pb-3 text-center">Chemistry (180)</th>
                  <th className="pb-3 text-center">Biology (360)</th>
                  <th className="pb-3 text-center">Total (720)</th>
                  <th className="pb-3">Notes</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockTests.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 pl-2 font-semibold text-white">{t.name}</td>
                    <td className="py-3 text-zinc-400">{t.date}</td>
                    <td className="py-3 text-center font-mono text-sky-400">{t.physics}</td>
                    <td className="py-3 text-center font-mono text-[#55e357]">{t.chemistry}</td>
                    <td className="py-3 text-center font-mono text-emerald-400">{t.biology}</td>
                    <td className="py-3 text-center font-mono font-bold text-white">
                      {t.total}
                    </td>
                    <td className="py-3 text-zinc-400 max-w-xs truncate">{t.notes || '—'}</td>
                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => deleteMockTest(t.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-[#262a34] transition"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="sleek-card p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Record Mock Test Result</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Test Title / Series
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Allen Major Test 1, Aakash AIATS"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-[#14161c] border border-white/10 text-white focus:outline-none focus:border-[#55e357]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-[#14161c] border border-white/10 text-white focus:outline-none focus:border-[#55e357]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Physics (/180)
                  </label>
                  <input
                    type="number"
                    max="180"
                    min="0"
                    value={formData.physics}
                    onChange={(e) => setFormData({ ...formData, physics: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#14161c] border border-white/10 text-white focus:outline-none focus:border-[#55e357]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Chemistry (/180)
                  </label>
                  <input
                    type="number"
                    max="180"
                    min="0"
                    value={formData.chemistry}
                    onChange={(e) => setFormData({ ...formData, chemistry: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#14161c] border border-white/10 text-white focus:outline-none focus:border-[#55e357]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Biology (/360)
                  </label>
                  <input
                    type="number"
                    max="360"
                    min="0"
                    value={formData.biology}
                    onChange={(e) => setFormData({ ...formData, biology: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#14161c] border border-white/10 text-white focus:outline-none focus:border-[#55e357]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Analysis Notes (Mistakes made, weak areas)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Negative marking in ray optics, missed NCERT biology line"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-[#14161c] border border-white/10 text-white focus:outline-none focus:border-[#55e357]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full bg-[#262a34] text-xs font-medium text-zinc-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#55e357] text-black text-xs font-bold hover:bg-[#42ca44] transition shadow-glow-lime"
                >
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
