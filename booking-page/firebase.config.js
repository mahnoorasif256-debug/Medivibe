import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAKfL5nOF5nMsJXAolll5-kNFvjuOK63Ng",
    authDomain: "medivibe-f6e7b.firebaseapp.com",
    projectId: "medivibe-f6e7b",
    storageBucket: "medivibe-f6e7b.firebasestorage.app",
    messagingSenderId: "358773330898",
    appId: "1:358773330898:web:10a546f0661f8aa912ee0b"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);