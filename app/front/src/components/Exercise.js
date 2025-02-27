import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { auth } from '../firebase';

const workoutSplits = {
  "Full Body": ["legs", "back", "chest", "shoulders", "arms", "core"],
  "Upper/Lower": ["upper arms", "lower legs"],
  "Push/Pull/Legs": ["chest", "shoulders", "triceps", "back", "biceps", "quads", "hamstrings", "calves"]
};

const Exercise = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [selectedSplit, setSelectedSplit] = useState("");
  const [exerciseData, setExerciseData] = useState({});
  const [planGenerated, setPlanGenerated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken(true);
        if (!idToken) {
          console.warn("No authentication token available.");
          return;
        }
        
        const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": "application/json"
        }
        });


        // Debugging: Log full response
        const textResponse = await res.text();
        console.log("Raw response from /api/auth/me:", textResponse);
        
        // Attempt to parse JSON
        try {
          const data = JSON.parse(textResponse);
          console.log("Parsed user data:", data);
          setUserData(data);
        } catch (jsonError) {
          console.error("Failed to parse JSON from /api/auth/me. Response was:", textResponse);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchExercises = async (part) => {
    const url = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${part}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      console.log(`Fetched exercises for ${part}:`, result);
      return result.slice(0, 3);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      return [];
    }
  };

  const generateWorkoutPlan = async () => {
    console.log("Generating workout plan...");
    console.log("Selected Split:", selectedSplit);
    console.log("User Data:", userData);
    
    if (!selectedSplit || !userData) {
      console.warn("Workout split or user data is missing");
      return;
    }
    const workoutParts = workoutSplits[selectedSplit];
    const generatedData = {};

    for (const part of workoutParts) {
      generatedData[part] = await fetchExercises(part);
    }

    console.log("Generated workout plan:", generatedData);
    setExerciseData(generatedData);
    setPlanGenerated(true);
  };

  if (loading) {
    return <p>Loading user data...</p>;
  }

  return (
    <ExerciseWrapper>
      <Header>
        <span>Exercise</span>
        <HomeButton onClick={() => navigate('/')}>Home</HomeButton>
      </Header>
      <Content>
        <h1>Create Your Workout Plan</h1>
        <h3>Welcome, {userData?.preferredName || "User"}!</h3>
        <p>Based on your fitness level ({userData?.experienceLevel || "Unknown"}), we recommend a {selectedSplit || "customized"} split.</p>
        <label>Select Workout Split:</label>
        <select value={selectedSplit} onChange={(e) => setSelectedSplit(e.target.value)}>
          <option value="">Select Split</option>
          {Object.keys(workoutSplits).map(split => (
            <option key={split} value={split}>{split}</option>
          ))}
        </select>
        <button onClick={generateWorkoutPlan}>Generate Plan</button>

        {planGenerated && (
          <div>
            <h2>Generated Workout Plan</h2>
            {Object.entries(exerciseData).map(([part, exercises]) => (
              <div key={part}>
                <h3>{part.toUpperCase()}</h3>
                <ul>
                  {exercises.map(exercise => (
                    <li key={exercise.id}>{exercise.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
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
