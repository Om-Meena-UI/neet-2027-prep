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

export { onAuthStateChanged };
