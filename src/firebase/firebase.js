import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA0Lnvcp3ZHtkXRC4eb7HWh7e3rZcNm_tI",
  authDomain: "mymess-7b1df.firebaseapp.com",
  projectId: "mymess-7b1df",
  storageBucket: "mymess-7b1df.firebasestorage.app",
  messagingSenderId: "522472509981",
  appId: "1:522472509981:web:cea1c77d8abe7ebae96cf4",
  measurementId: "G-RRQLRSFK04",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch(() => {
  return setPersistence(auth, browserSessionPersistence);
});