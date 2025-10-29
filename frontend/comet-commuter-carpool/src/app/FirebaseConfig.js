// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_APP,
  authDomain: "comet-commuter-carpool.firebaseapp.com",
  projectId: "comet-commuter-carpool",
  storageBucket: "comet-commuter-carpool.firebasestorage.app",
  messagingSenderId: "221715150625",
  appId: "1:221715150625:web:a03de5f376abc96bc93060"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);