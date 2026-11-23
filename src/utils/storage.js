import defaultTraps from '../data/defaultTraps.json';

export const STORAGE_KEY = 'neet2027_command_center_v1';
export const USER_KEY = 'neet2027_user_auth';
export const THEME_KEY = 'neet2027_theme';
export const DEFAULT_TARGET_DATE = '2027-05-02T14:00:00+05:30';

/** Get local YYYY-MM-DD string */
export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const defaultTodos = [
  { id: 'todo-1', text: 'Solve 30 PYQs for Ray Optics', completed: false, priority: 'high' },
  { id: 'todo-2', text: 'Revise Periodic Table trends & exceptions', completed: true, priority: 'medium' },
  { id: 'todo-3', text: 'Read NCERT Biology summary for Genetics', completed: false, priority: 'high' },
];

export function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveUser(user) {
  if (!user) {
    localStorage.removeItem(USER_KEY);
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export const DEFAULT_SETTINGS = {
  targetScore: 700,
  dreamCollege: 'AIIMS New Delhi',
  dailyHoursGoal: 8,
  pomodoroFocusMin: 25,
  pomodoroBreakMin: 5,
  soundAlerts: true,
  cardDensity: 'comfortable',
  autoCloudSync: true,
};

export function getDefaultState() {
  return {
    version: 1,
    activeTab: 'syllabus',
    countdownTarget: DEFAULT_TARGET_DATE,
    settings: DEFAULT_SETTINGS,
    // chapterProgress: { [chapterId]: { ncert: bool, pyqs: bool, revision: bool } }
    chapterProgress: {},
    // chapterDifficulty: { [chapterId]: 'Easy' | 'Medium' | 'Hard' }
    chapterDifficulty: {},
    // dailyActivity: { 'YYYY-MM-DD': { minutes: number, checks: number } }
    dailyActivity: {},
    // trapCards: array of { id, subject, chapter, front, back, mastered }
    trapCards: defaultTraps,
    // mockTests: array of { id, name, date, physics, chemistry, biology, total, notes }
    mockTests: [],
    // todos: array of { id, text, completed, priority }
    todos: defaultTodos,
    // questionBank: array of { id, title, subject, chapterId, chapterTitle, imageUrl, tags, notes, difficulty, isMastered, createdAt }
    questions: [],
    selectedChapterId: 'phy-11-4',
    heatmapCollapsed: false,
  };
}

export function getStorageKeyForUser(uid = null) {
  if (!uid) return 'neet2027_guest_state';
  return `neet2027_user_${uid}`;
}

export function loadState(uid = null) {
  try {
    const key = getStorageKeyForUser(uid);
    let raw = localStorage.getItem(key);

    // Migration logic: If user is logged in, and user-specific key does not exist yet,
    // look for legacy STORAGE_KEY and migrate it into the user's personal key
    if (!raw && uid) {
      const legacyRaw = localStorage.getItem(STORAGE_KEY);
      if (legacyRaw) {
        raw = legacyRaw;
        try {
          localStorage.setItem(key, legacyRaw);
          // Remove legacy key so it does not bleed into logged-out/guest mode
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {}
      }
    }

    // For logged-out / guest users: if no separate guest state exists, return clean default state
    if (!raw) return getDefaultState();

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return getDefaultState();
    const defaults = getDefaultState();
    return {
      ...defaults,
      ...parsed,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
      },
      chapterProgress: parsed.chapterProgress || {},
      chapterDifficulty: parsed.chapterDifficulty || {},
      dailyActivity: parsed.dailyActivity || {},
      trapCards: Array.isArray(parsed.trapCards) ? parsed.trapCards : defaultTraps,
      mockTests: Array.isArray(parsed.mockTests) ? parsed.mockTests : [],
      todos: Array.isArray(parsed.todos) ? parsed.todos : defaultTodos,
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
    };
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return getDefaultState();
  }
}

export function saveState(state, uid = null) {
  try {
    const key = getStorageKeyForUser(uid);
    localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function clearLoggedOutData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('neet2027_guest_state');
  } catch (e) {}
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
      user: loadUser(),
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
    chapterDifficulty:
      parsed.chapterDifficulty && typeof parsed.chapterDifficulty === 'object'
        ? parsed.chapterDifficulty
        : {},
    dailyActivity:
      parsed.dailyActivity && typeof parsed.dailyActivity === 'object'
        ? parsed.dailyActivity
        : {},
    trapCards: Array.isArray(parsed.trapCards) ? parsed.trapCards : defaults.trapCards,
    mockTests: Array.isArray(parsed.mockTests) ? parsed.mockTests : [],
    todos: Array.isArray(parsed.todos) ? parsed.todos : defaults.todos,
    questions: Array.isArray(parsed.questions) ? parsed.questions : [],
  };
  return {
    state: normalized,
    user: parsed.user || null,
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
