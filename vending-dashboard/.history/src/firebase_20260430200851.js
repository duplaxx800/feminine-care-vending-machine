import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKavhDn5PXAymdl-jRbMFA_wRZ-L5YuZM",
  authDomain: "femcarevending.firebaseapp.com",
  databaseURL: "https://femcarevending-default-rtdb.firebaseio.com",
  projectId: "femcarevending",
  storageBucket: "femcarevending.firebasestorage.app",
  messagingSenderId: "131092683508",
  appId: "1:131092683508:web:9dcce9fe0cb09448b1dca1"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);