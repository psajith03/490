// app/front/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDMPv4gETaHTfjgLFD3XLCu75m17rkszQI",
  authDomain: "c490-81e1c.firebaseapp.com",
  projectId: "c490-81e1c",
  storageBucket: "c490-81e1c.firebasestorage.app",
  messagingSenderId: "584683601020",
  appId: "1:584683601020:web:cfac24f8b1a2bfc2d51df9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Expose auth to the global window for debugging
window.auth = auth;

export { auth };