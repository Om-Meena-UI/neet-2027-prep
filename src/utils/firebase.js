import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCyIhRIKBDo9ZhRPdHn-ycIkBrjiVJ8q5o",
  authDomain: "neet-2027-prep.firebaseapp.com",
  projectId: "neet-2027-prep",
  storageBucket: "neet-2027-prep.firebasestorage.app",
  messagingSenderId: "310376992388",
  appId: "1:310376992388:web:c70b12d08cb0cdb19ffcd1",
  measurementId: "G-K8NBJ6ZRRL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const signInWithGooglePopup = () => {
  return signInWithPopup(auth, googleProvider);
};

export const registerWithEmail = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential.user;
};

export const loginWithEmailPass = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutFirebase = () => {
  return signOut(auth);
};

// Safe promise wrapper with timeout to prevent hanging on uninitialized Firestore or locked security rules
const withTimeout = (promise, ms = 7000, errorMsg = 'Firestore timed out. Please ensure Cloud Firestore Database is created and rules are open in your Firebase Console.') => {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMsg)), ms);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise,
  ]);
};

// Cloud Firestore Sync Helpers
export const saveUserStateToCloud = async (uid, state) => {
  if (!uid) return false;
  try {
    const userDocRef = doc(db, 'users', uid);
    // Sanitize state for Firestore serialization
    const statePayload = {
      version: state.version || 1,
      countdownTarget: state.countdownTarget || null,
      settings: state.settings || {},
      chapterProgress: state.chapterProgress || {},
      chapterDifficulty: state.chapterDifficulty || {},
      dailyActivity: state.dailyActivity || {},
      todos: state.todos || [],
      mockTests: state.mockTests || [],
      trapCards: state.trapCards || [],
      selectedChapterId: state.selectedChapterId || '',
      updatedAt: serverTimestamp(),
    };

    // If total questions payload is compact (<700KB), embed directly in user document for fast atomic load
    const questionsArr = Array.isArray(state.questions) ? state.questions : [];
    const questionsJson = JSON.stringify(questionsArr);
    if (questionsJson.length < 700000) {
      statePayload.questions = questionsArr;
    }

    await withTimeout(setDoc(userDocRef, statePayload, { merge: true }), 7000);

    // Also persist each question into subcollection users/{uid}/questions/{id}
    // This allows students to store hundreds of photo questions without ever exceeding the 1MB Firestore document limit!
    if (questionsArr.length > 0) {
      const qColl = collection(db, 'users', uid, 'questions');
      const writePromises = questionsArr.map((q) =>
        setDoc(doc(qColl, q.id), q, { merge: true }).catch((e) =>
          console.warn(`Question cloud sync error for ${q.id}:`, e)
        )
      );
      await Promise.all(writePromises);
    }

    return true;
  } catch (err) {
    console.error('Firestore saveUserStateToCloud error:', err);
    throw err;
  }
};

export const deleteQuestionFromCloud = async (uid, questionId) => {
  if (!uid || !questionId) return;
  try {
    await deleteDoc(doc(db, 'users', uid, 'questions', questionId));
  } catch (err) {
    console.warn('Failed to delete question from cloud database:', err);
  }
};

export const loadUserStateFromCloud = async (uid) => {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await withTimeout(getDoc(userDocRef), 7000);

    // Also load any questions stored in the questions subcollection
    let subcollectionQuestions = [];
    try {
      const qColl = collection(db, 'users', uid, 'questions');
      const qSnap = await withTimeout(getDocs(qColl), 6000);
      if (!qSnap.empty) {
        subcollectionQuestions = qSnap.docs.map((d) => d.data());
      }
    } catch (qErr) {
      console.warn('Subcollection questions fetch notice:', qErr);
    }

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Combine questions from subcollection and main doc, preferring subcollection if present
      const embeddedQuestions = Array.isArray(data.questions) ? data.questions : [];
      const questionsMap = new Map();

      embeddedQuestions.forEach((q) => {
        if (q && q.id) questionsMap.set(q.id, q);
      });
      subcollectionQuestions.forEach((q) => {
        if (q && q.id) questionsMap.set(q.id, q);
      });

      return {
        ...data,
        questions: Array.from(questionsMap.values()),
      };
    } else if (subcollectionQuestions.length > 0) {
      return {
        questions: subcollectionQuestions,
      };
    }

    return null;
  } catch (err) {
    console.error('Firestore loadUserStateFromCloud error:', err);
    throw err;
  }
};

export { onAuthStateChanged };
