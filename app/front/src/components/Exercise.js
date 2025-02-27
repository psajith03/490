import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const Exercise = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [selectedSplit, setSelectedSplit] = useState("");
  const [workoutPlan, setWorkoutPlan] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken(true);
        if (!idToken) return;

        const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": "application/json"
          }
        });
        const data = await res.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const fetchWorkoutPlan = async () => {
    if (!selectedSplit) {
      alert("Please select a workout split.");
      return;
    }
  
    try {
      const API_URL = "http://localhost:5000";
      console.log(`📡 Fetching workout plan from: ${API_URL}/api/full_recommendation?split_type=${selectedSplit}`);
  
      const response = await fetch(`${API_URL}/api/full_recommendation?split_type=${selectedSplit}`);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to fetch workout plan. Server response: ${errorText}`);
        throw new Error(`Failed to fetch workout plan: ${errorText}`);
      }
  
      const data = await response.json();
      console.log("✅ Workout plan received:", data);
      
      setWorkoutPlan(data.workout_plan || {}); // ✅ Ensures no error if `workout_plan` is missing
    } catch (error) {
      console.error("🚨 Error fetching workout plan:", error.message);
    }
  };
  
  

  if (loading) return <p>Loading user data...</p>;

  return (
    <ExerciseWrapper>
      <Header>
        <span>Exercise</span>
        <HomeButton onClick={() => navigate('/')}>Home</HomeButton>
      </Header>
      <Content>
        <h1>Create Your Workout Plan</h1>
        <label>Select Workout Split:</label>
        <select value={selectedSplit} onChange={(e) => setSelectedSplit(e.target.value)}>
          <option value="">Select Split</option>
          <option value="total_body">Total Body Split</option>
          <option value="upper_lower">Upper vs. Lower Split</option>
          <option value="push_pull_legs">Push vs. Pull vs. Legs Split</option>
          <option value="bro_split">Bro Split</option>
        </select>
        <button onClick={fetchWorkoutPlan}>Generate Plan</button>
        {Object.entries(workoutPlan).map(([day, exercises]) => (
          <div key={day}>
            <h3>{day.toUpperCase()}</h3>
            <ul>
              {exercises.map((exercise, index) => (
                <li key={index}>{exercise}</li>
              ))}
            </ul>
          </div>
        ))}
      </Content>
    </ExerciseWrapper>
  );
};

export default Exercise;

const ExerciseWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: radial-gradient(125% 125% at 50% 10%,rgb(217, 39, 39) 40%, #000 100%);
  color: white;
  text-align: center;
`;

const Header = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #fff;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 4px 6px rgb(201, 80, 169);

  span {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const HomeButton = styled.button`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  border: .25em solid rgb(217, 176, 255);
  background-color: #fff;
  color: rgb(217, 176, 255);
  border-radius: 1em;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 1em .25em rgb(217, 176, 255),
              0 0 4em 1em rgba(191, 123, 255, 0.5),
              inset 0 0 .75em .25em rgb(217, 176, 255);
  text-shadow: 0 0 .5em rgb(217, 176, 255);

  &:hover {
    background-color: rgb(217, 176, 255);
    color: #222;
  }
`;

const Content = styled.div`
  margin-top: 80px;
  text-align: center;
  h1 {
    font-size: 36px;
    margin-bottom: 20px;
  }
  p {
    font-size: 18px;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    font-size: 20px;
    margin: 10px 0;
  }
`;