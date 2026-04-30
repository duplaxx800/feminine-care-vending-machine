import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDpPwOsK4ZO1SHgksyeOCIY7JnhAh6VHXc",
  authDomain: "ctu-vending-machine.firebaseapp.com",
  databaseURL: "https://ctu-vending-machine-default-rtdb.firebaseio.com",
  projectId: "ctu-vending-machine",
  storageBucket: "ctu-vending-machine.firebasestorage.app",
  messagingSenderId: "290040143891",
  appId: "1:290040143891:web:cb8d7596e1b684e49cdfe6",
  measurementId: "G-EYKJLJ90R1"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);