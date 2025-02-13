// app/front/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from './firebase';
import Form from './components/Form';
import Home from './components/Home';
import OnboardingQuestionnaire from './components/OnboardingQuestionnaire';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    // Set authentication persistence
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("Auth persistence set to local storage");
      })
      .catch((error) => {
        console.error("Error setting auth persistence:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const idToken = await user.getIdToken(true); // Force refresh token
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setIsOnboardingComplete(userData.isOnboardingComplete || false);
          } else {
            if (response.status === 404) {
              await auth.signOut();
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setIsOnboardingComplete(false);
        }
      } else {
        setUser(null);
        setIsOnboardingComplete(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            user ? (
              isOnboardingComplete ? <Navigate to="/home" replace /> : <Navigate to="/onboarding" replace />
            ) : <Form />
          } />
          <Route path="/home" element={
            !user ? <Navigate to="/" replace /> : !isOnboardingComplete ? <Navigate to="/onboarding" replace /> : <Home />
          } />
          <Route path="/onboarding" element={
            !user ? <Navigate to="/" replace /> : isOnboardingComplete ? <Navigate to="/home" replace /> : <OnboardingQuestionnaire />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
