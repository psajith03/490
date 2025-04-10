import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from './firebase';
import Form from './components/Form';
import Home from './components/Home';
import ExerciseRecommendations from './components/ExerciseRecommendations';
import Exercise from './components/Exercise';
import Sleep from './components/Sleep';
import Daily from './components/Daily';
import Diet from './components/Diet';
import Nutrition from './components/Nutrition'
import DietHome from './components/DietHome';
import ExerciseHome from './components/ExerciseHome';
import SavedWorkouts from './components/SavedWorkouts';
import CustomWorkouts from './components/CustomWorkouts';
import RatedWorkouts from './components/RatedWorkouts';
import './App.css';
import FullRecommendation from "./components/FullRecommendation";
const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => console.log("Auth persistence set to local storage"))
      .catch(error => console.error("Error setting auth persistence:", error));

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const idToken = await user.getIdToken();
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${idToken}` }
          });

          if (!response.ok) {
            if (response.status === 404) {
              await auth.signOut();
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/home" replace /> : <Form />} />
          <Route path="/exercise-home" element={<ExerciseHome />} />
          <Route path="/exercise" element={<Exercise />} />
          <Route path="/saved-workouts" element={<SavedWorkouts />} />
          <Route path="/custom-workouts" element={<CustomWorkouts />} />
          <Route path="/rated-workouts" element={<RatedWorkouts />} />
          <Route path="/sleep" element={<Sleep />} /> 
          <Route path="/daily" element={<Daily />} />
          <Route path="/dietHome" element={<DietHome />} /> 
          <Route path="/diet" element={<Diet />} /> 
          <Route path="/nutrition" element={<Nutrition />} /> 
          <Route path="/home" element={!user ? <Navigate to="/" replace /> : <Home />} />
          <Route path="/recommendations" element={<ExerciseRecommendations />} />
          <Route path="/full-recommendation" element={<FullRecommendation />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
