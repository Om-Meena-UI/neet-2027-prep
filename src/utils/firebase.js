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
      selectedChapterId: state.selectedChapterId || '',
      updatedAt: serverTimestamp(),
    };
    await setDoc(userDocRef, statePayload, { merge: true });
    return true;
  } catch (err) {
    console.error('Firestore saveUserStateToCloud error:', err);
    throw err;
  }
};

export const loadUserStateFromCloud = async (uid) => {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (err) {
    console.error('Firestore loadUserStateFromCloud error:', err);
    throw err;
  }
};

export { onAuthStateChanged };
