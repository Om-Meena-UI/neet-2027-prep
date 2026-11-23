import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import syllabusData from '../data/syllabus.json';
import {
  calculateConsistencyStats,
  exportStateJSON,
  getLocalDateKey,
  loadState,
  loadUser,
  parseAndValidateImport,
  saveState,
  saveUser,
} from '../utils/storage';
import {
  auth,
  signInWithGooglePopup,
  loginWithEmailPass,
  registerWithEmail,
  logoutFirebase,
  onAuthStateChanged,
  saveUserStateToCloud,
  loadUserStateFromCloud,
} from '../utils/firebase';
import { DEFAULT_SETTINGS, getDefaultState } from '../utils/storage';

const PrepContext = createContext(null);

export function PrepProvider({ children }) {
  const [state, setState] = useState(() => loadState());
  const [user, setUser] = useState(() => loadUser());
  const [toast, setToast] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Save locally and auto-sync changes to Cloud Firestore in background
  useEffect(() => {
    saveState(state);

    if (user?.uid && state.settings?.autoCloudSync !== false) {
      const handler = setTimeout(() => {
        saveUserStateToCloud(user.uid, state)
          .then(() => setLastSyncTime(new Date()))
          .catch((e) => console.warn('Background cloud sync notice:', e));
      }, 1500); // 1.5s debounce to smoothly batch rapid ticks/edits

      return () => clearTimeout(handler);
    }
  }, [state, user?.uid]);

  useEffect(() => {
    saveUser(user);
  }, [user]);

  // Listen to live Firebase Auth state changes & auto-sync from Cloud on new device
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const mappedUser = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Aspirant',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          avatar: (firebaseUser.displayName || firebaseUser.email || 'A')[0].toUpperCase(),
          targetScore: '700+',
        };
        setUser(mappedUser);

        // Auto-pull latest study progress from Cloud Firestore on login
        try {
          const cloudData = await loadUserStateFromCloud(firebaseUser.uid);
          if (cloudData) {
            setState((prev) => ({
              ...prev,
              ...cloudData,
              settings: {
                ...DEFAULT_SETTINGS,
                ...(cloudData.settings || {}),
              },
            }));
            setLastSyncTime(new Date());
            showToast(`☁️ Restored prep progress from cloud for ${mappedUser.name}!`);
          } else {
            // First time login with this account: back up current state to cloud
            await saveUserStateToCloud(firebaseUser.uid, state);
            setLastSyncTime(new Date());
          }
        } catch (err) {
          console.warn('Auto cloud sync on login notice:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev && Date.now() - prev.id >= 2800 ? null : prev));
    }, 3000);
  };

  // Real Google Sign-In with Firebase Popup
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithGooglePopup();
      const fbUser = result.user;
      const mappedUser = {
        uid: fbUser.uid,
        name: fbUser.displayName || 'Aspirant',
        email: fbUser.email,
        photoURL: fbUser.photoURL,
        avatar: (fbUser.displayName || 'G')[0].toUpperCase(),
        targetScore: '700+',
      };
      setUser(mappedUser);
      showToast(`Signed in as ${mappedUser.name}!`);
      return true;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      showToast(error.message || 'Failed to sign in with Google.', 'error');
      return false;
    }
  };

  // Real Email/Password Login
  const loginWithEmail = async (email, password) => {
    try {
      const result = await loginWithEmailPass(email, password);
      const fbUser = result.user;
      const mappedUser = {
        uid: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Aspirant',
        email: fbUser.email,
        avatar: (fbUser.displayName || fbUser.email || 'A')[0].toUpperCase(),
        targetScore: '700+',
      };
      setUser(mappedUser);
      showToast(`Welcome back, ${mappedUser.name}!`);
      return true;
    } catch (error) {
      console.error('Email Login Error:', error);
      showToast(error.message || 'Login failed. Check your email or password.', 'error');
      return false;
    }
  };

  // Real Email/Password Registration
  const signUpWithEmail = async (email, password, displayName) => {
    try {
      const fbUser = await registerWithEmail(email, password, displayName);
      const mappedUser = {
        uid: fbUser.uid,
        name: displayName || email.split('@')[0],
        email: fbUser.email,
        avatar: (displayName || email)[0].toUpperCase(),
        targetScore: '700+',
      };
      setUser(mappedUser);
      showToast(`Account created! Welcome, ${mappedUser.name}`);
      return true;
    } catch (error) {
      console.error('Signup Error:', error);
      showToast(error.message || 'Failed to register account.', 'error');
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await logoutFirebase();
      setUser(null);
      showToast('Signed out successfully.');
    } catch (err) {
      setUser(null);
    }
  };

  // Flatten syllabus once
  const allChapters = useMemo(() => {
    const list = [];
    Object.entries(syllabusData).forEach(([subject, classes]) => {
      Object.entries(classes).forEach(([className, chapters]) => {
        chapters.forEach((ch) => {
          list.push({
            ...ch,
            subject,
            className,
          });
        });
      });
    });
    return list;
  }, []);

  // Compute readiness and subject progress dynamically
  const metrics = useMemo(() => {
    const stages = ['ncert', 'pyqs', 'revision'];
    const totalChapters = allChapters.length;
    const totalCheckboxes = totalChapters * stages.length;
    let completedCheckboxes = 0;
    let masteredChapters = 0;

    const subjectStats = {};
    ['Physics', 'Chemistry', 'Biology'].forEach((sub) => {
      subjectStats[sub] = {
        totalChapters: 0,
        masteredChapters: 0,
        totalCheckboxes: 0,
        completedCheckboxes: 0,
        percent: 0,
      };
    });

    allChapters.forEach((ch) => {
      const prog = state.chapterProgress[ch.id] || {};
      const doneCount = stages.filter((s) => Boolean(prog[s])).length;
      completedCheckboxes += doneCount;
      if (doneCount === 3) masteredChapters += 1;

      const subStat = subjectStats[ch.subject];
      if (subStat) {
        subStat.totalChapters += 1;
        subStat.totalCheckboxes += 3;
        subStat.completedCheckboxes += doneCount;
        if (doneCount === 3) subStat.masteredChapters += 1;
      }
    });

    Object.values(subjectStats).forEach((s) => {
      s.percent = s.totalCheckboxes
        ? Math.round((s.completedCheckboxes / s.totalCheckboxes) * 100)
        : 0;
    });

    const overallReadiness = totalCheckboxes
      ? Math.round((completedCheckboxes / totalCheckboxes) * 100)
      : 0;

    return {
      totalChapters,
      totalCheckboxes,
      completedCheckboxes,
      masteredChapters,
      overallReadiness,
      subjectStats,
    };
  }, [allChapters, state.chapterProgress]);

  const consistency = useMemo(
    () => calculateConsistencyStats(state.dailyActivity),
    [state.dailyActivity]
  );

  const [mobileSection, setMobileSection] = useState('chapters'); // 'chapters' | 'timer' | 'tasks'

  const setActiveTab = (tab) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  const toggleChapterStage = (chapterId, stage) => {
    const todayKey = getLocalDateKey();
    setState((prev) => {
      const current = prev.chapterProgress[chapterId] || {
        ncert: false,
        pyqs: false,
        revision: false,
      };
      const nextVal = !current[stage];
      const todayEntry = prev.dailyActivity[todayKey] || { minutes: 0, checks: 0 };
      const delta = nextVal ? 1 : -1;

      return {
        ...prev,
        chapterProgress: {
          ...prev.chapterProgress,
          [chapterId]: {
            ...current,
            [stage]: nextVal,
          },
        },
        dailyActivity: {
          ...prev.dailyActivity,
          [todayKey]: {
            minutes: todayEntry.minutes || 0,
            checks: Math.max(0, (todayEntry.checks || 0) + delta),
          },
        },
      };
    });
  };

  const toggleChapterAll = (chapterId) => {
    const todayKey = getLocalDateKey();
    setState((prev) => {
      const current = prev.chapterProgress[chapterId] || {};
      const currentlyMastered = Boolean(
        current.ncert && current.pyqs && current.revision
      );
      const target = !currentlyMastered;
      const existingDone = ['ncert', 'pyqs', 'revision'].filter((s) =>
        Boolean(current[s])
      ).length;
      const delta = target ? 3 - existingDone : -existingDone;
      const todayEntry = prev.dailyActivity[todayKey] || { minutes: 0, checks: 0 };

      return {
        ...prev,
        chapterProgress: {
          ...prev.chapterProgress,
          [chapterId]: {
            ncert: target,
            pyqs: target,
            revision: target,
          },
        },
        dailyActivity: {
          ...prev.dailyActivity,
          [todayKey]: {
            minutes: todayEntry.minutes || 0,
            checks: Math.max(0, (todayEntry.checks || 0) + delta),
          },
        },
      };
    });
  };

  const setChapterDifficulty = (chapterId, difficulty) => {
    setState((prev) => ({
      ...prev,
      chapterDifficulty: {
        ...(prev.chapterDifficulty || {}),
        [chapterId]: difficulty,
      },
    }));
    showToast(`Difficulty set to ${difficulty}`);
  };

  // To-Do list operations
  const addTodo = (text, priority = 'medium') => {
    if (!text.trim()) return;
    const newTodo = {
      id: `todo-${Date.now()}`,
      text: text.trim(),
      completed: false,
      priority,
    };
    setState((prev) => ({
      ...prev,
      todos: [newTodo, ...(prev.todos || [])],
    }));
    showToast('Task added to Daily To-Do!');
  };

  const toggleTodo = (id) => {
    setState((prev) => ({
      ...prev,
      todos: (prev.todos || []).map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const deleteTodo = (id) => {
    setState((prev) => ({
      ...prev,
      todos: (prev.todos || []).filter((t) => t.id !== id),
    }));
  };

  const logFocusMinutes = (minutes) => {
    if (!minutes || minutes <= 0) return;
    const todayKey = getLocalDateKey();
    setState((prev) => {
      const todayEntry = prev.dailyActivity[todayKey] || { minutes: 0, checks: 0 };
      return {
        ...prev,
        dailyActivity: {
          ...prev.dailyActivity,
          [todayKey]: {
            minutes: (todayEntry.minutes || 0) + minutes,
            checks: todayEntry.checks || 0,
          },
        },
      };
    });
    showToast(`Logged ${minutes}m focus session!`);
  };

  const setCountdownTarget = (isoTarget) => {
    setState((prev) => ({ ...prev, countdownTarget: isoTarget }));
    showToast('NEET 2027 target date updated.');
  };

  const setSelectedChapterId = (id) => {
    setState((prev) => ({ ...prev, selectedChapterId: id }));
  };

  const toggleHeatmapCollapsed = () => {
    setState((prev) => ({ ...prev, heatmapCollapsed: !prev.heatmapCollapsed }));
  };

  const addTrapCard = ({ subject, chapter, front, back }) => {
    const newCard = {
      id: `trap-${Date.now()}`,
      subject,
      chapter,
      front: front.trim(),
      back: back.trim(),
      mastered: false,
    };
    setState((prev) => ({
      ...prev,
      trapCards: [newCard, ...prev.trapCards],
    }));
    showToast('Trap flashcard added to deck!');
  };

  const toggleTrapMastered = (id) => {
    setState((prev) => ({
      ...prev,
      trapCards: prev.trapCards.map((c) =>
        c.id === id ? { ...c, mastered: !c.mastered } : c
      ),
    }));
  };

  const deleteTrapCard = (id) => {
    setState((prev) => ({
      ...prev,
      trapCards: prev.trapCards.filter((c) => c.id !== id),
    }));
  };

  const addMockTest = (test) => {
    const physics = Number(test.physics) || 0;
    const chemistry = Number(test.chemistry) || 0;
    const biology = Number(test.biology) || 0;
    const newTest = {
      id: `mock-${Date.now()}`,
      name: test.name.trim(),
      date: test.date,
      physics,
      chemistry,
      biology,
      total: physics + chemistry + biology,
      notes: test.notes ? test.notes.trim() : '',
    };
    setState((prev) => ({
      ...prev,
      mockTests: [...prev.mockTests, newTest].sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
    }));
    showToast(`Saved mock test: ${newTest.total}/720`);
  };

  const deleteMockTest = (id) => {
    setState((prev) => ({
      ...prev,
      mockTests: prev.mockTests.filter((t) => t.id !== id),
    }));
  };

  // Question Bank operations
  const addQuestion = (questionData) => {
    const newQuestion = {
      id: `qb-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      title: questionData.title?.trim() || 'Untitled Question',
      subject: questionData.subject || 'Physics',
      chapterId: questionData.chapterId || '',
      chapterTitle: questionData.chapterTitle || 'General',
      imageUrl: questionData.imageUrl || '',
      tags: Array.isArray(questionData.tags) ? questionData.tags : [],
      notes: questionData.notes?.trim() || '',
      difficulty: questionData.difficulty || 'Medium',
      isMastered: Boolean(questionData.isMastered),
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      questions: [newQuestion, ...(prev.questions || [])],
    }));

    showToast(`Saved question to ${newQuestion.chapterTitle}! 📸`);
    return newQuestion;
  };

  const updateQuestion = (id, updates) => {
    setState((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((q) =>
        q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q
      ),
    }));
    showToast('Question updated successfully!');
  };

  const deleteQuestion = (id) => {
    setState((prev) => ({
      ...prev,
      questions: (prev.questions || []).filter((q) => q.id !== id),
    }));
    showToast('Question removed from Question Bank.');
  };

  const toggleQuestionMastered = (id) => {
    setState((prev) => {
      let isNowMastered = false;
      const updated = (prev.questions || []).map((q) => {
        if (q.id === id) {
          isNowMastered = !q.isMastered;
          return { ...q, isMastered: isNowMastered };
        }
        return q;
      });
      showToast(isNowMastered ? 'Marked question as Mastered! 🏆' : 'Marked for revision.');
      return { ...prev, questions: updated };
    });
  };

  const updateSettings = (partial) => {
    setState((prev) => {
      const updatedSettings = {
        ...(prev.settings || DEFAULT_SETTINGS),
        ...partial,
      };
      const newState = {
        ...prev,
        settings: updatedSettings,
      };
      if (user?.uid && updatedSettings.autoCloudSync) {
        saveUserStateToCloud(user.uid, newState).catch((err) =>
          console.warn('Silent cloud sync failed:', err)
        );
      }
      return newState;
    });
    showToast('Settings saved!');
  };

  const syncToCloud = async () => {
    if (!user?.uid) {
      showToast('Please sign in to sync with Cloud.', 'error');
      return false;
    }
    setIsSyncing(true);
    try {
      await saveUserStateToCloud(user.uid, state);
      setLastSyncTime(new Date());
      showToast('☁️ Progress safely synced to Cloud!');
      return true;
    } catch (err) {
      console.error('syncToCloud error:', err);
      const isPermissionOrMissing =
        err.message?.includes('timed out') ||
        err.code === 'permission-denied' ||
        err.message?.includes('permission');
      if (isPermissionOrMissing) {
        showToast('Firestore database not initialized or locked in Firebase console.', 'error');
      } else {
        showToast('Cloud sync failed: ' + (err.message || 'Network error'), 'error');
      }
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const loadFromCloud = async () => {
    if (!user?.uid) {
      showToast('Please sign in first.', 'error');
      return false;
    }
    setIsSyncing(true);
    try {
      const cloudData = await loadUserStateFromCloud(user.uid);
      if (cloudData) {
        setState((prev) => ({
          ...prev,
          ...cloudData,
          settings: {
            ...DEFAULT_SETTINGS,
            ...(cloudData.settings || {}),
          },
        }));
        setLastSyncTime(new Date());
        showToast('☁️ Cloud data restored successfully!');
      } else {
        showToast('No existing cloud backup found. Backing up current state...');
        await saveUserStateToCloud(user.uid, state);
        setLastSyncTime(new Date());
      }
      return true;
    } catch (err) {
      console.error('loadFromCloud error:', err);
      showToast('Failed to pull from cloud: ' + err.message, 'error');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const resetAllState = () => {
    const defaults = getDefaultState();
    setState(defaults);
    showToast('All progress reset to default.', 'error');
  };

  const exportFullState = () => {
    const dataStr = exportStateJSON(state);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neet-2027-backup-${getLocalDateKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON exported!');
  };

  const importFullState = (jsonText, onThemeSync) => {
    try {
      const { state: imported, user: importedUser, theme } = parseAndValidateImport(jsonText);
      setState(imported);
      if (importedUser) {
        setUser(importedUser);
      }
      if (theme && onThemeSync) {
        onThemeSync(theme);
      }
      showToast('Backup restored successfully!');
      return true;
    } catch (err) {
      showToast('Invalid JSON backup file.', 'error');
      return false;
    }
  };

  const value = {
    state,
    user,
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    logout,
    syllabusData,
    allChapters,
    metrics,
    consistency,
    toast,
    showToast,
    setActiveTab,
    mobileSection,
    setMobileSection,
    toggleChapterStage,
    toggleChapterAll,
    setChapterDifficulty,
    addTodo,
    toggleTodo,
    deleteTodo,
    logFocusMinutes,
    setCountdownTarget,
    setSelectedChapterId,
    toggleHeatmapCollapsed,
    addTrapCard,
    toggleTrapMastered,
    deleteTrapCard,
    addMockTest,
    deleteMockTest,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    toggleQuestionMastered,
    exportFullState,
    importFullState,
    updateSettings,
    syncToCloud,
    loadFromCloud,
    resetAllState,
    isSyncing,
    lastSyncTime,
  };

  return <PrepContext.Provider value={value}>{children}</PrepContext.Provider>;
}

export function usePrep() {
  const ctx = useContext(PrepContext);
  if (!ctx) throw new Error('usePrep must be used inside PrepProvider');
  return ctx;
}
