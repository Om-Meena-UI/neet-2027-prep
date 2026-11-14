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

const PrepContext = createContext(null);

export function PrepProvider({ children }) {
  const [state, setState] = useState(() => loadState());
  const [user, setUser] = useState(() => loadUser());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    saveUser(user);
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev && Date.now() - prev.id >= 2800 ? null : prev));
    }, 3000);
  };

  // User Auth Actions
  const loginWithEmail = (email, name) => {
    const formattedUser = {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email: email.trim(),
      provider: 'email',
      targetScore: '700+',
      avatar: (name || email)[0].toUpperCase(),
    };
    setUser(formattedUser);
    showToast(`Welcome back, ${formattedUser.name}!`);
  };

  const loginWithGoogle = () => {
    const googleUser = {
      id: `usr-google-${Date.now()}`,
      name: 'Google User',
      email: 'neet.aspirant@gmail.com',
      provider: 'google',
      targetScore: '710+',
      avatar: 'G',
    };
    setUser(googleUser);
    showToast('Signed in with Google!');
  };

  const logout = () => {
    setUser(null);
    showToast('Signed out successfully.');
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
    loginWithGoogle,
    logout,
    syllabusData,
    allChapters,
    metrics,
    consistency,
    toast,
    showToast,
    setActiveTab,
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
    exportFullState,
    importFullState,
  };

  return <PrepContext.Provider value={value}>{children}</PrepContext.Provider>;
}

export function usePrep() {
  const ctx = useContext(PrepContext);
  if (!ctx) throw new Error('usePrep must be used inside PrepProvider');
  return ctx;
}
