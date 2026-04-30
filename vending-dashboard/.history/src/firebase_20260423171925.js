import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Paste your actual Firebase credentials here from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDpPwOsK4ZO1SHgksyeOCIY7JnhAh6VHXc",
  authDomain: "ctu-vending-machine.firebaseapp.com",
  projectId: "ctu-vending-machine",
  storageBucket: "ctu-vending-machine.firebasestorage.app",
  messagingSenderId: "290040143891",
  appId: "1:290040143891:web:cb8d7596e1b684e49cdfe6",
  measurementId: "G-EYKJLJ90R1"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);