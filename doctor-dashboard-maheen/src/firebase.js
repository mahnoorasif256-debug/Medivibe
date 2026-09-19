import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "ornate-collector-bnm9t",
  appId: "1:1071225599958:web:5730fcf48952164a4b9677",
  apiKey: "AIzaSyCLgeBSrnxFSyyL2sYa6BTU46JaCZtgqaY",
  authDomain: "ornate-collector-bnm9t.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-29c2490f-d867-4c20-80b8-8a8e43086b48",
  storageBucket: "ornate-collector-bnm9t.firebasestorage.app",
  messagingSenderId: "1071225599958"
};

let dbInstance = null;
let authInstance = null;
try {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(app);
  dbInstance = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
} catch (err) {
  console.warn('Firebase initialization notice:', err?.message || String(err));
}

export const auth = authInstance;
export const db = dbInstance;
export default db;
