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
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseLoading, setExerciseLoading] = useState(false);

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
      console.log(`Fetching workout plan from: ${API_URL}/api/full_recommendation?split_type=${selectedSplit}`);

      const response = await fetch(`${API_URL}/api/full_recommendation?split_type=${selectedSplit}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch workout plan. Server response: ${errorText}`);
        throw new Error(`Failed to fetch workout plan: ${errorText}`);
      }

      const data = await response.json();
      console.log("Workout plan received:", data);

      setWorkoutPlan(data.workout_plan || {});
    } catch (error) {
      console.error("Error fetching workout plan:", error.message);
    }
  };

  const fetchExerciseDetails = async (exerciseName) => {
    setExerciseLoading(true);
    try {
      const API_URL = `http://localhost:5000/api/exercise/${encodeURIComponent(exerciseName)}`;
      const res = await fetch(API_URL);
      const data = await res.json();
      setSelectedExercise(data);
    } catch (error) {
      console.error("Error fetching exercise details:", error);
    } finally {
      setExerciseLoading(false);
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

        {workoutPlan && Object.keys(workoutPlan).length > 0 ? (
          <WorkoutPlanContainer>
            <h3>Your Workout Plan:</h3>
            <WorkoutRow>
              {Object.entries(workoutPlan).map(([category, exercises]) => (
                <WorkoutColumn key={category}>
                  <h4>{category.toUpperCase()}</h4>
                  <ul>
                    {exercises.map((exercise, index) => (
                      <li key={index} onClick={() => fetchExerciseDetails(exercise)}>{exercise}</li>
                    ))}
                  </ul>
                </WorkoutColumn>
              ))}
            </WorkoutRow>
          </WorkoutPlanContainer>
        ) : (
          <p>No workout plan available yet. Please generate one.</p>
        )}
      </Content>

      {exerciseLoading && <p>Loading exercise details...</p>}

      {selectedExercise && (
        <ExerciseCard>
          <h2>{selectedExercise.name}</h2>
          {selectedExercise.gifUrl ? (
            <img src={selectedExercise.gifUrl} alt={selectedExercise.name} />
          ) : (
            <p>No GIF available</p>
          )}
          <p><strong>Target Muscle:</strong> {selectedExercise.target || "N/A"}</p>
          <p><strong>Equipment:</strong> {selectedExercise.equipment || "N/A"}</p>
          <h4>Instructions:</h4>
          <ul>
            {selectedExercise.instructions?.length > 0 ? (
              selectedExercise.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))
            ) : (
              <li>No instructions available</li>
            )}
          </ul>
          <CloseButton onClick={() => setSelectedExercise(null)}>Close</CloseButton>
        </ExerciseCard>
      )}
    </ExerciseWrapper>
  );
};

export default Exercise;


const ExerciseCard = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  color: black;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  text-align: center;
  z-index: 1001;
  width: 400px;

  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin-top: 10px;
  }

  ul {
    text-align: left;
    padding-left: 20px;
  }

  li {
    margin-bottom: 5px;
  }
`;

const CloseButton = styled.button`
  margin-top: 10px;
  padding: 10px;
  border: none;
  background: red;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
  width: 100%;
  text-align: center;
  font-weight: bold;
  transition: 0.3s;

  &:hover {
    background: darkred;
  }
`;

const ExerciseWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  background: radial-gradient(125% 125% at 50% 10%, rgb(217, 39, 39) 40%, #000 100%);
  color: white;
  text-align: center;
  padding: 20px;
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
    position: relative;
    text-align: center;
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
  margin-top: 100px;
  text-align: center;
  width: 80%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const WorkoutPlanContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  width: 90%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const WorkoutRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  width: 100%;
  max-width: 1000px;
`;

const WorkoutColumn = styled.div`
  flex: 1;
  max-width: 300px;
  text-align: center;

  h4 {
    font-size: 24px;
    margin-bottom: 10px;
    text-transform: uppercase;
    color: #fff;
    text-decoration: underline;
  }

  ul {
    padding: 0;
    list-style-type: none;
  }

  li {
    font-size: 18px;
    margin: 10px 0;
    background: rgba(255, 255, 255, 0.2);
    padding: 8px;
    border-radius: 8px;
  }
`;
