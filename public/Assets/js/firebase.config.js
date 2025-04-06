import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  updateEmail,
  updatePassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  sendSignInLinkToEmail
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  onSnapshot,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  limit,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZhvD2WwJkWDU8QAS9Yf4uIMahvi9PzEM",
  authDomain: "worlog-webapp-6cb3f.firebaseapp.com",
  projectId: "worlog-webapp-6cb3f",
  storageBucket: "worlog-webapp-6cb3f.firebasestorage.app",
  messagingSenderId: "211638053410",
  appId: "1:211638053410:web:e872826dffb56d5516b87b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  updatePassword,
  updateProfile,
  onAuthStateChanged,
  db,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  onSnapshot,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  updateEmail,
  sendSignInLinkToEmail,
  limit
};
