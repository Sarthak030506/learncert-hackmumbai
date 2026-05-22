import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const cleanEnvVar = (val: string | undefined): string => {
  if (!val || val === "undefined" || val === "null") return "";
  let clean = val.trim();
  if (clean.startsWith('"') && clean.endsWith('"')) {
    clean = clean.slice(1, -1);
  }
  if (clean.startsWith("'") && clean.endsWith("'")) {
    clean = clean.slice(1, -1);
  }
  return clean.trim();
};

const apiKey = cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
const authDomain = cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
const projectId = cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
const storageBucket = cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
const messagingSenderId = cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
const appId = cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

if (typeof window === "undefined") {
  console.log(`[Firebase Server Debug] Loaded API Key length: ${apiKey.length}, First 5 chars: "${apiKey.substring(0, 5)}", AuthDomain: "${authDomain}"`);
} else {
  console.log(`[Firebase Client Debug] Loaded API Key length: ${apiKey.length}, First 5 chars: "${apiKey.substring(0, 5)}", AuthDomain: "${authDomain}"`);
}

let isFirebaseConfigured = !!(apiKey && apiKey.length >= 35);

if (typeof window !== "undefined" && !isFirebaseConfigured) {
  console.warn(
    "⚠️ Firebase Environment Variables are not configured. Falling back to local development mock config."
  );
}

const firebaseConfig = {
  apiKey: isFirebaseConfigured ? apiKey : "MOCK_FIREBASE_API_KEY_FOR_LOCAL_DEV",
  authDomain: authDomain || "credify-mock.firebaseapp.com",
  projectId: projectId || "credify-mock",
  storageBucket: storageBucket || "credify-mock.appspot.com",
  messagingSenderId: messagingSenderId || "123456789012",
  appId: appId || "1:123456789012:web:1234567890abcdef123456",
};

let app: any = {};
let auth: any = {};
let db: any = {};
let storage: any = {};

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Failed to initialize Firebase. Falling back to local development mock.", error);
    isFirebaseConfigured = false;
  }
}

export { app, auth, db, storage, isFirebaseConfigured };

