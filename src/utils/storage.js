import defaultTraps from '../data/defaultTraps.json';

export const STORAGE_KEY = 'neet2027_command_center_v1';
export const THEME_KEY = 'neet2027_theme';
export const DEFAULT_TARGET_DATE = '2027-05-02T14:00:00+05:30';

/** Get local YYYY-MM-DD string */
export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultState() {
  return {
    version: 1,
    activeTab: 'syllabus',
    countdownTarget: DEFAULT_TARGET_DATE,
    // chapterProgress: { [chapterId]: { ncert: bool, pyqs: bool, revision: bool } }
    chapterProgress: {},
    // dailyActivity: { 'YYYY-MM-DD': { minutes: number, checks: number } }
    dailyActivity: {},
    // trapCards: array of { id, subject, chapter, front, back, mastered }
    trapCards: defaultTraps,
    // mockTests: array of { id, name, date, physics, chemistry, biology, total, notes }
    mockTests: [],
    selectedChapterId: 'phy-11-4',
    heatmapCollapsed: false,
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return getDefaultState();
    const defaults = getDefaultState();
    return {
      ...defaults,
      ...parsed,
      chapterProgress: parsed.chapterProgress || {},
      dailyActivity: parsed.dailyActivity || {},
      trapCards: Array.isArray(parsed.trapCards) ? parsed.trapCards : defaultTraps,
      mockTests: Array.isArray(parsed.mockTests) ? parsed.mockTests : [],
    };
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return getDefaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function getState() {
  return loadState();
}

export function updateField(key, value) {
  const state = loadState();
  state[key] = value;
  saveState(state);
}

export function exportStateJSON(state) {
  return JSON.stringify(
    {
      ...state,
      theme: localStorage.getItem(THEME_KEY) || 'dark',
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

export function parseAndValidateImport(jsonText) {
  const parsed = JSON.parse(jsonText);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON structure.');
  }
  const defaults = getDefaultState();
  const normalized = {
    ...defaults,
    ...parsed,
    chapterProgress:
      parsed.chapterProgress && typeof parsed.chapterProgress === 'object'
        ? parsed.chapterProgress
        : {},
    dailyActivity:
      parsed.dailyActivity && typeof parsed.dailyActivity === 'object'
        ? parsed.dailyActivity
        : {},
    trapCards: Array.isArray(parsed.trapCards) ? parsed.trapCards : defaults.trapCards,
    mockTests: Array.isArray(parsed.mockTests) ? parsed.mockTests : [],
  };
  return {
    state: normalized,
    theme: parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : null,
  };
}

/** Calculate streaks and today's focus time from dailyActivity */
export function calculateConsistencyStats(dailyActivity = {}) {
  const todayKey = getLocalDateKey();
  const todayEntry = dailyActivity[todayKey] || { minutes: 0, checks: 0 };

  const isActiveDay = (key) => {
    const entry = dailyActivity[key];
    return Boolean(entry && (entry.minutes > 0 || entry.checks > 0));
  };

  let currentStreak = 0;
  const cursor = new Date();
  if (!isActiveDay(getLocalDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (isActiveDay(getLocalDateKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
    if (currentStreak > 3650) break;
  }

  let bestStreak = currentStreak;
  const allDates = Object.keys(dailyActivity).filter(isActiveDay).sort();
  if (allDates.length > 0) {
    let run = 1;
    bestStreak = Math.max(bestStreak, 1);
    for (let i = 1; i < allDates.length; i++) {
      const prev = new Date(`${allDates[i - 1]}T00:00:00`);
      const curr = new Date(`${allDates[i]}T00:00:00`);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        run += 1;
        bestStreak = Math.max(bestStreak, run);
      } else if (diffDays > 1) {
        run = 1;
      }
    }
  }

  return {
    todayMinutes: todayEntry.minutes || 0,
    todayChecks: todayEntry.checks || 0,
    currentStreak,
    bestStreak,
  };
}
