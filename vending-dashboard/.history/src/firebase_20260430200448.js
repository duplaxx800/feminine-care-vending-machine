import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_vVG-5Og650G6Madcb2teGcUWKm64scs",
  authDomain: "femcarevending.firebaseapp.com",
  databaseURL: "https://femcarevending-default-rtdb.firebaseio.com",
  projectId: "femcarevending",
  storageBucket: "femcarevending.firebasestorage.app",
  messagingSenderId: "131092683508",
  appId: "1:131092683508:android:d97d2cd0984cf08eb1dca1",
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);