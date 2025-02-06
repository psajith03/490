// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Import Firestore and Authentication
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMPv4gETaHTfjgLFD3XLCu75m17rkszQI",
  authDomain: "c490-81e1c.firebaseapp.com",
  projectId: "c490-81e1c",
  storageBucket: "c490-81e1c.firebasestorage.app",
  messagingSenderId: "584683601020",
  appId: "1:584683601020:web:cfac24f8b1a2bfc2d51df9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase App Initialized:", app);

export default app;