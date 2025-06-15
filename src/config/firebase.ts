// Firebase configuration
import { initializeApp } from "firebase/app";
import {
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

// Firebase config - uses environment variables
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyBtMX2XRFQ2W5GJ8qKZ9aP3dN7fR2mK1Qc",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "chemouflage-edu.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chemouflage-edu",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "chemouflage-edu.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "117112518336326671589",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:117112518336326671589:web:abc123def456ghi789",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ABCD123456",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Configure providers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

const facebookProvider = new FacebookAuthProvider();

// For development - uncomment to use Firebase Auth emulator
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, "http://localhost:9099");
// }

export { auth, facebookProvider, googleProvider };
export default app;
