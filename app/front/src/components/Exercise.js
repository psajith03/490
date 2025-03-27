import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const Exercise = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [selectedSplit, setSelectedSplit] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [selectedExerciseTypes, setSelectedExerciseTypes] = useState([]);
  const [workoutPlan, setWorkoutPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [showEquipmentOptions, setShowEquipmentOptions] = useState(false);
  const [showExerciseTypeOptions, setShowExerciseTypeOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [workoutName, setWorkoutName] = useState("");

  const equipmentOptions = [
    "Bands",
    "Barbell",
    "Body Only",
    "Cable",
    "Dumbbell",
    "E-Z Curl Bar",
    "Exercise Ball",
    "Foam Roll",
    "Kettlebells",
    "Machine",
    "Medicine Ball",
    "Other"
  ];

  const exerciseTypeOptions = [
    "Cardio",
    "Olympic Weightlifting",
    "Plyometrics",
    "Powerlifting",
    "Strength",
    "Stretching",
    "Strongman"
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      console.log("Fetching user data...");
  
      try {
        const idToken = await auth.currentUser?.getIdToken(true);
        if (!idToken) {
          console.warn("No ID token available. User may not be authenticated.");
          setLoading(false);
          return;
        }
  
        const API_URL = "http://localhost:5000";
        console.log(`Requesting user data from: ${API_URL}/api/auth/me`);
  
        const startTime = Date.now();
        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": "application/json"
          }
        });
  
        const duration = Date.now() - startTime;
        console.log(`User data fetched in ${duration}ms`);
  
        if (!res.ok) {
          console.error(`Failed to fetch user data: ${res.statusText}`);
          setLoading(false);
          return;
        }
  
        const data = await res.json();
        console.log("User data received:", data);
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);
  

  const handleEquipmentChange = (equipment) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipment)) {
        return prev.filter(item => item !== equipment);
      } else {
        return [...prev, equipment];
      }
    });
  };

  const handleExerciseTypeChange = (type) => {
    setSelectedExerciseTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(item => item !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const fetchWorkoutPlan = async () => {
    if (!selectedSplit) {
      alert("Please select a workout split.");
      return;
    }

    try {
      const API_URL = "http://localhost:5000";
      let url = `${API_URL}/api/full_recommendation?split_type=${selectedSplit}`;
      if (selectedEquipment.length > 0) { url += `&equipment=${encodeURIComponent(selectedEquipment.join(','))}`; }
      if (selectedExerciseTypes.length > 0) { url += `&exercise_type=${encodeURIComponent(selectedExerciseTypes.join(','))}`; }
      console.log(`Fetching workout plan from: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch workout plan. Server response: ${errorText}`);
        throw new Error(`Failed to fetch workout plan: ${errorText}`);
      }
      const data = await response.json();
      console.log("Workout plan received:", data);

      const hasExercises = Object.values(data.workout_plan || {}).some(
        exercises => exercises && exercises.length > 0
      );

      if (!hasExercises) { alert("No exercises found with the selected filters. Try different filters or remove some constraints."); }
      setWorkoutPlan(data.workout_plan || {});
    } catch (error) {
      console.error("Error fetching workout plan:", error.message);
      alert(`Error: ${error.message}`);
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

  const saveWorkout = async () => {
    if (!workoutPlan || Object.keys(workoutPlan).length === 0) {
      alert("No workout plan to save!");
      return;
    }

    if (!selectedSplit) {
      alert("Please select a workout split before saving!");
      return;
    }

    setSaving(true);
    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) {
        throw new Error("User not authenticated");
      }

      const API_URL = "http://localhost:5000";
      console.log("Saving workout with data:", {
        splitType: selectedSplit,
        exercises: workoutPlan,
        name: workoutName || undefined
      });

      const response = await fetch(`${API_URL}/api/saved-workouts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          splitType: selectedSplit,
          exercises: workoutPlan,
          name: workoutName || undefined
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Failed to save workout: ${response.status} ${response.statusText}`);
      }

      const savedWorkout = await response.json();
      console.log("Workout saved successfully:", savedWorkout);
      alert("Workout saved successfully!");
      setWorkoutName("");
    } catch (error) {
      console.error("Error saving workout:", error);
      alert(`Failed to save workout: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading user data...</p>;

  return (
    <ExerciseWrapper>
      <Header>
        <span>Exercise</span>
        <ButtonContainer>
          <HomeButton onClick={() => navigate('/exercise-home')}>Back to Exercise Home</HomeButton>
        </ButtonContainer>
      </Header>
      <Content>
        <h1>Create Your Workout Plan</h1>
        
        <FormGroup>
          <label>Select Workout Split:</label>
          <select value={selectedSplit} onChange={(e) => setSelectedSplit(e.target.value)}>
            <option value="">Select Split</option>
            <option value="total_body">Total Body Split</option>
            <option value="upper_lower">Upper vs. Lower Split</option>
            <option value="push_pull_legs">Push vs. Pull vs. Legs Split</option>
            <option value="bro_split">Bro Split</option>
          </select>
        </FormGroup>
        
        <FilterSection>
          <FilterHeader onClick={() => setShowEquipmentOptions(!showEquipmentOptions)}>
            Available Equipment (Optional)
            <ToggleIcon>{showEquipmentOptions ? '▼' : '►'}</ToggleIcon>
          </FilterHeader>
          
          {showEquipmentOptions && (
            <CheckboxContainer>
              {equipmentOptions.map((equipment) => (
                <CheckboxItem key={equipment}>
                  <input
                    type="checkbox"
                    id={`equipment-${equipment}`}
                    checked={selectedEquipment.includes(equipment)}
                    onChange={() => handleEquipmentChange(equipment)}
                  />
                  <label htmlFor={`equipment-${equipment}`}>{equipment}</label>
                </CheckboxItem>
              ))}
            </CheckboxContainer>
          )}
          
          {selectedEquipment.length > 0 && (
            <SelectedFilters>
              <strong>Selected Equipment:</strong> {selectedEquipment.join(', ')}
              <ClearButton onClick={() => setSelectedEquipment([])}>Clear</ClearButton>
            </SelectedFilters>
          )}
        </FilterSection>
        
        <FilterSection>
          <FilterHeader onClick={() => setShowExerciseTypeOptions(!showExerciseTypeOptions)}>
            Exercise Type (Optional)
            <ToggleIcon>{showExerciseTypeOptions ? '▼' : '►'}</ToggleIcon>
          </FilterHeader>
          
          {showExerciseTypeOptions && (
            <CheckboxContainer>
              {exerciseTypeOptions.map((type) => (
                <CheckboxItem key={type}>
                  <input
                    type="checkbox"
                    id={`type-${type}`}
                    checked={selectedExerciseTypes.includes(type)}
                    onChange={() => handleExerciseTypeChange(type)}
                  />
                  <label htmlFor={`type-${type}`}>{type}</label>
                </CheckboxItem>
              ))}
            </CheckboxContainer>
          )}
          
          {selectedExerciseTypes.length > 0 && (
            <SelectedFilters>
              <strong>Selected Types:</strong> {selectedExerciseTypes.join(', ')}
              <ClearButton onClick={() => setSelectedExerciseTypes([])}>Clear</ClearButton>
            </SelectedFilters>
          )}
        </FilterSection>
        
        <GenerateButton onClick={fetchWorkoutPlan}>Generate Plan</GenerateButton>
  
        {workoutPlan && Object.keys(workoutPlan).length > 0 ? (
          <WorkoutPlanContainer>
            <h3>Your Workout Plan:</h3>
            <SaveSection>
              <NameInput
                type="text"
                placeholder="Enter workout name (optional)"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
              <SaveButton onClick={saveWorkout} disabled={saving}>
                {saving ? 'Saving...' : 'Save This Workout'}
              </SaveButton>
            </SaveSection>
            {Object.values(workoutPlan).some(exercises => exercises && exercises.length > 0) ? (
              <WorkoutRow>
                {Object.entries(workoutPlan).map(([category, exercises]) => (
                  <WorkoutColumn key={category}>
                    <h4>{category.toUpperCase()}</h4>
                    <ul>
                      {exercises && exercises.length > 0 ? (
                        exercises.map((exercise, index) => (
                          <li key={index} onClick={() => fetchExerciseDetails(exercise)}>{exercise}</li>
                        ))
                      ) : (
                        <li className="no-exercises">No exercises found for this category with the selected filters</li>
                      )}
                    </ul>
                  </WorkoutColumn>
                ))}
              </WorkoutRow>
            ) : (
              <NoExercisesMessage>
                No exercises found with the selected filters. Try different filters or remove some constraints.
              </NoExercisesMessage>
            )}
          </WorkoutPlanContainer>
        ) : (
          <p>No workout plan available yet. Please generate one.</p>
        )}
      </Content>
  
      {exerciseLoading && <p>Loading exercise details...</p>}
  
      {selectedExercise && (
        <ExerciseCard>
          <h2>{selectedExercise.name}</h2>
  
          {console.log("Received GIF URL:", selectedExercise.gifUrl)}
  
          {selectedExercise.gifUrl ? (
            <img 
              src={selectedExercise.gifUrl} 
              alt={selectedExercise.name} 
              onError={(e) => {
                console.error("Failed to load GIF:", e.target.src);
                e.target.style.display = "none";
              }}
            />
          ) : (
            <p><strong>No GIF available for this exercise.</strong></p>
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  width: 100%;
  max-width: 400px;
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    text-align: left;
  }
  
  select {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: white;
    color: black;
    font-size: 16px;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
  width: 100%;
  max-width: 400px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px;
`;

const FilterHeader = styled.div`
  font-weight: bold;
  cursor: pointer;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.2);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

const ToggleIcon = styled.span`
  font-size: 12px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  padding: 10px;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 5px 10px;
  border-radius: 5px;
  
  input {
    margin-right: 5px;
  }
  
  label {
    cursor: pointer;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const SelectedFilters = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const ClearButton = styled.button`
  background-color: rgba(255, 100, 100, 0.3);
  border: none;
  color: white;
  padding: 2px 8px;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 10px;
  
  &:hover {
    background-color: rgba(255, 100, 100, 0.5);
  }
`;

const GenerateButton = styled.button`
  margin-top: 10px;
  padding: 12px 24px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #45a049;
  }
`;

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
  justify-content: flex-start;
  width: 100%;
  min-height: 100vh;
  background: radial-gradient(125% 125% at 50% 10%, rgb(217, 39, 39) 40%, #000 100%);
  color: white;
  text-align: center;
  padding: 20px;
  overflow-y: auto;
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
  overflow-y: auto;
  max-height: 70vh;
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
  
  li.no-exercises {
    color: #ff9999;
    font-style: italic;
  }
`;

const NoExercisesMessage = styled.p`
  margin-top: 20px;
  padding: 20px;
  background-color: rgba(255, 100, 100, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(255, 100, 100, 0.5);
  color: #ff9999;
  font-size: 18px;
  width: 90%;
  max-width: 600px;
  text-align: center;
`;

const SaveButton = styled.button`
  margin: 10px 0;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: #28a745;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #218838;
  }
`;

const SaveSection = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 10px 0;
  width: 100%;
  max-width: 600px;
  justify-content: center;
`;

const NameInput = styled.input`
  padding: 10px 15px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  flex: 1;
  max-width: 300px;
  transition: border-color 0.3s;
  background-color: white;
  color: black;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  &::placeholder {
    color: #999;
  }
`;
