import React, { useState } from 'react';
import { Award, Plus, Trash2, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
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

  // Compute key stats
  const totalTests = mockTests.length;
  const bestScore = mockTests.reduce((max, t) => Math.max(max, t.total || 0), 0);
  const avgScore = totalTests
    ? Math.round(mockTests.reduce((sum, t) => sum + (t.total || 0), 0) / totalTests)
    : 0;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Quick stats */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-500" />
            Mock Test Performance Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track your score trajectories towards NEET 2027 (Max 720: 180 Phy + 180 Chem + 360 Bio)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-500/20 transition self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Log Mock Score
        </button>
      </div>

      {/* 3 Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Mocks Taken
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
            {totalTests}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Highest Score
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {bestScore} <span className="text-sm font-sans font-normal text-slate-500">/ 720</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Average Score
          </div>
          <div className="text-3xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {avgScore} <span className="text-sm font-sans font-normal text-slate-500">/ 720</span>
          </div>
        </div>
      </div>

      {/* Score History Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Test Logs & Sectional Breakdown
        </h3>

        {mockTests.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
            No mock tests logged yet. Click "Log Mock Score" above to record your first exam result!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {mockTests.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                    <td className="py-3 pl-2 font-medium text-slate-900 dark:text-slate-100">{t.name}</td>
                    <td className="py-3 text-slate-500">{t.date}</td>
                    <td className="py-3 text-center font-mono">{t.physics}</td>
                    <td className="py-3 text-center font-mono">{t.chemistry}</td>
                    <td className="py-3 text-center font-mono">{t.biology}</td>
                    <td className="py-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {t.total}
                    </td>
                    <td className="py-3 text-slate-500 max-w-xs truncate">{t.notes || '—'}</td>
                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => deleteMockTest(t.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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

      {/* Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record New Mock Test</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Test Title / Provider
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Allen Major Test 1, Aakash AIATS"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Test Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Physics (/180)
                  </label>
                  <input
                    type="number"
                    max="180"
                    min="0"
                    value={formData.physics}
                    onChange={(e) => setFormData({ ...formData, physics: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Chemistry (/180)
                  </label>
                  <input
                    type="number"
                    max="180"
                    min="0"
                    value={formData.chemistry}
                    onChange={(e) => setFormData({ ...formData, chemistry: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Biology (/360)
                  </label>
                  <input
                    type="number"
                    max="360"
                    min="0"
                    value={formData.biology}
                    onChange={(e) => setFormData({ ...formData, biology: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Analysis Notes (Mistakes made, weak areas)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Calculation errors in kinematics, forgot plant hormones"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
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
