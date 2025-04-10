import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const CustomWorkouts = () => {
  const navigate = useNavigate();
  const [exerciseName, setExerciseName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [customWorkout, setCustomWorkout] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchExerciseSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const API_URL = `http://localhost:5000/api/exercise/search?query=${encodeURIComponent(query)}`;
      console.log("Fetching suggestions from:", API_URL);
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Received suggestions:", data);
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching exercise suggestions:", error);
      setSuggestions([]);
    }
  };

  const fetchExerciseDetails = async (exerciseName) => {
    setExerciseLoading(true);
    try {
      const API_URL = `http://localhost:5000/api/exercise/${encodeURIComponent(exerciseName)}`;
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setSelectedExercise({
        name: data.name,
        type: data.target,
        equipment: data.equipment,
        muscle: data.target,
        instructions: Array.isArray(data.instructions) ? data.instructions.join('\n') : data.instructions,
        gifUrl: data.gifUrl
      });
    } catch (error) {
      console.error("Error fetching exercise details:", error);
    } finally {
      setExerciseLoading(false);
    }
  };

  const handleExerciseSelect = (exercise) => {
    setExerciseName(exercise);
    setSuggestions([]);
    fetchExerciseDetails(exercise);
  };

  const addExerciseToWorkout = () => {
    if (selectedExercise) {
      setCustomWorkout([...customWorkout, selectedExercise]);
      setSelectedExercise(null);
      setExerciseName('');
    }
  };

  const saveWorkout = async () => {
    if (customWorkout.length === 0) {
      alert("No exercises in workout to save!");
      return;
    }

    setSaving(true);
    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) {
        throw new Error("User not authenticated");
      }

      const API_URL = "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/saved-workouts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          splitType: "custom",
          exercises: { "Custom Workout": customWorkout.map(exercise => exercise.name) },
          name: workoutName || undefined
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save workout: ${errorText}`);
      }

      alert("Workout saved successfully!");
      setWorkoutName("");
      setCustomWorkout([]);
    } catch (error) {
      console.error("Error saving workout:", error);
      alert(`Failed to save workout: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ExerciseWrapper>
      <Header>
        <span>Create Custom Workout</span>
        <ButtonContainer>
          <HomeButton onClick={() => navigate('/exercise-home')}>Exercise Home</HomeButton>
        </ButtonContainer>
      </Header>
      <Content>
        <h1>Create Your Custom Workout</h1>
        
        <FormGroup>
          <label>Workout Name (Optional):</label>
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Enter a name for your workout (optional)"
          />
        </FormGroup>

        <FormGroup>
          <label>Search Exercise:</label>
          <input
            type="text"
            value={exerciseName}
            onChange={(e) => {
              setExerciseName(e.target.value);
              fetchExerciseSuggestions(e.target.value);
            }}
            placeholder="Type exercise name..."
          />
          {suggestions.length > 0 && (
            <SuggestionsList>
              {suggestions.map((suggestion) => (
                <SuggestionItem
                  key={suggestion}
                  onClick={() => handleExerciseSelect(suggestion)}
                >
                  {suggestion}
                </SuggestionItem>
              ))}
            </SuggestionsList>
          )}
        </FormGroup>

        {selectedExercise && (
          <ExerciseCard>
            <h3>{selectedExercise.name}</h3>
            {selectedExercise.gifUrl ? (
              <GifContainer>
                <img 
                  src={selectedExercise.gifUrl} 
                  alt={selectedExercise.name}
                  onError={(e) => {
                    console.error("Failed to load GIF:", e.target.src);
                    e.target.style.display = "none";
                    const container = e.target.parentElement;
                    const noGifMessage = document.createElement('p');
                    noGifMessage.textContent = 'No GIF Found';
                    noGifMessage.style.textAlign = 'center';
                    noGifMessage.style.padding = '20px';
                    container.appendChild(noGifMessage);
                  }}
                />
              </GifContainer>
            ) : (
              <GifContainer>
                <p style={{ textAlign: 'center', padding: '20px' }}>No GIF Found</p>
              </GifContainer>
            )}
            <ExerciseDetails>
              <p><strong>Type:</strong> {selectedExercise.type}</p>
              <p><strong>Equipment:</strong> {selectedExercise.equipment}</p>
              <p><strong>Muscle:</strong> {selectedExercise.muscle}</p>
              <p><strong>Instructions:</strong> {selectedExercise.instructions}</p>
            </ExerciseDetails>
            <AddButton onClick={addExerciseToWorkout}>Add to Workout</AddButton>
          </ExerciseCard>
        )}

        {customWorkout.length > 0 && (
          <WorkoutList>
            <h2>Your Custom Workout</h2>
            {customWorkout.map((exercise, index) => (
              <ExerciseCard key={index}>
                <h3>{exercise.name}</h3>
                {exercise.gifUrl ? (
                  <GifContainer>
                    <img 
                      src={exercise.gifUrl} 
                      alt={exercise.name}
                      onError={(e) => {
                        console.error("Failed to load GIF:", e.target.src);
                        e.target.style.display = "none";
                        const container = e.target.parentElement;
                        const noGifMessage = document.createElement('p');
                        noGifMessage.textContent = 'No GIF Found';
                        noGifMessage.style.textAlign = 'center';
                        noGifMessage.style.padding = '20px';
                        container.appendChild(noGifMessage);
                      }}
                    />
                  </GifContainer>
                ) : (
                  <GifContainer>
                    <p style={{ textAlign: 'center', padding: '20px' }}>No GIF Found</p>
                  </GifContainer>
                )}
                <ExerciseDetails>
                  <p><strong>Type:</strong> {exercise.type}</p>
                  <p><strong>Equipment:</strong> {exercise.equipment}</p>
                  <p><strong>Muscle:</strong> {exercise.muscle}</p>
                </ExerciseDetails>
              </ExerciseCard>
            ))}
            <SaveButton onClick={saveWorkout} disabled={saving}>
              {saving ? 'Saving...' : 'Save Workout'}
            </SaveButton>
          </WorkoutList>
        )}
      </Content>
    </ExerciseWrapper>
  );
};

export default CustomWorkouts;

const ExerciseWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(45deg, #B7E4C7, #FFE066, #74C0FC, #c4a7e7);
  background-size: 400% 400%;
  animation: gradientAnimation 10s ease infinite;
  color: #333;
  text-align: center;
  padding: 20px;

  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
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

const ButtonContainer = styled.div`
  position: absolute;
  right: 20px;
`;

const HomeButton = styled.button`
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
  gap: 20px;
`;

const FormGroup = styled.div`
  width: 100%;
  max-width: 500px;
  position: relative;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
  }
  
  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
  }
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-top: 5px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  list-style: none;
  padding: 0;
`;

const SuggestionItem = styled.li`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ExerciseCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin: 10px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
  text-align: left;
`;

const AddButton = styled.button`
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  font-weight: bold;

  &:hover {
    background-color: #218838;
  }
`;

const WorkoutList = styled.div`
  width: 100%;
  max-width: 500px;
  margin-top: 20px;
`;

const SaveButton = styled.button`
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 20px;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const GifContainer = styled.div`
  width: 100%;
  max-width: 300px;
  margin: 10px auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const ExerciseDetails = styled.div`
  margin: 15px 0;
  text-align: left;
  
  p {
    margin: 8px 0;
    line-height: 1.4;
  }
`; 