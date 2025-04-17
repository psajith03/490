import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const SavedWorkouts = () => {
  const navigate = useNavigate();
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExerciseDetails, setSelectedExerciseDetails] = useState(null);
  const [exerciseDetailsLoading, setExerciseDetailsLoading] = useState(false);

  const fetchSavedWorkouts = async () => {
    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) {
        console.warn("No ID token available. User may not be authenticated.");
        setLoading(false);
        return;
      }

      const API_URL = "http://localhost:5000";
      console.log("Fetching saved workouts...");
      const response = await fetch(`${API_URL}/api/saved-workouts`, {
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch saved workouts');
      }

      const data = await response.json();
      console.log("Fetched saved workouts:", data);
      setSavedWorkouts(data);
    } catch (error) {
      console.error("Error fetching saved workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedWorkouts();
  }, []);

  const deleteWorkout = async (workoutId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) {
        throw new Error("User not authenticated");
      }

      const API_URL = "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/saved-workouts/${workoutId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete workout');
      }

      setSavedWorkouts(prevWorkouts => prevWorkouts.filter(workout => workout._id !== workoutId));
      alert('Workout deleted successfully');
    } catch (error) {
      console.error("Error deleting workout:", error);
      alert(`Failed to delete workout: ${error.message}`);
    }
  };

  const fetchExerciseDetails = async (exercise) => {
    setExerciseLoading(true);
    try {
      const exerciseName = typeof exercise === 'string' ? exercise : exercise.name;
      const API_URL = `http://localhost:5000/api/exercise/${encodeURIComponent(exerciseName)}`;
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setSelectedExercise({
        ...data,
        originalName: exerciseName
      });
    } catch (error) {
      setSelectedExercise(null);
    } finally {
      setExerciseLoading(false);
    }
  };

  const handleRating = async (exerciseName, rating) => {
    if (!selectedWorkout) return;

    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) {
        throw new Error("User not authenticated");
      }

      const API_URL = "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/saved-workouts/${selectedWorkout._id}/rate`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ exerciseName, rating })
      });

      if (!response.ok) {
        throw new Error('Failed to update rating');
      }

      const updatedWorkout = await response.json();
      setSelectedWorkout(updatedWorkout.workout);
      setRating(rating);
      setRatingSuccess(true);
      
      setTimeout(() => setRatingSuccess(false), 2000);
    } catch (error) {
      console.error("Error updating rating:", error);
      alert(`Failed to update rating: ${error.message}`);
    }
  };

  useEffect(() => {
    if (selectedExercise && selectedWorkout?.ratings) {
      const currentRating = selectedWorkout.ratings[selectedExercise.name] || 0;
      setRating(currentRating);
    }
  }, [selectedExercise, selectedWorkout]);

  const deleteExercise = async (exerciseName, category) => {
    if (!window.confirm('Are you sure you want to delete this exercise?')) {
      return;
    }

    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) {
        throw new Error("User not authenticated");
      }

      const API_URL = "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/saved-workouts/${selectedWorkout._id}/exercises`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ exerciseName, category })
      });

      if (!response.ok) {
        throw new Error('Failed to delete exercise');
      }

      const data = await response.json();
      
      if (data.message === 'Workout deleted as it had no exercises left') {
        setSavedWorkouts(prevWorkouts => prevWorkouts.filter(w => w._id !== selectedWorkout._id));
        setSelectedWorkout(null);
        setSelectedExercise(null);
        alert('Workout deleted as it had no exercises left');
      } else {
        setSavedWorkouts(prevWorkouts => 
          prevWorkouts.map(workout => 
            workout._id === selectedWorkout._id ? data.workout : workout
          )
        );
        setSelectedWorkout(null);
        setSelectedExercise(null);
        alert('Exercise deleted successfully');
      }
    } catch (error) {
      alert(`Failed to delete exercise: ${error.message}`);
    }
  };

  const fetchExerciseSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const API_URL = `http://localhost:5000/api/exercise/search?query=${encodeURIComponent(query)}`;
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching exercise suggestions:", error);
      setSuggestions([]);
    }
  };

  const handleExerciseSelect = async (exerciseName) => {
    setExerciseName(exerciseName);
    setSuggestions([]);
    setExerciseDetailsLoading(true);
    
    try {
      const API_URL = `http://localhost:5000/api/exercise/${encodeURIComponent(exerciseName)}`;
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setSelectedExerciseDetails(data);
    } catch (error) {
      console.error("Error fetching exercise details:", error);
      alert('Failed to fetch exercise details');
    } finally {
      setExerciseDetailsLoading(false);
    }
  };

  const handleAddExercise = async () => {
    if (!selectedCategory || !selectedExerciseDetails) {
      alert('Please select a category and exercise');
      return;
    }

    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) {
        throw new Error("User not authenticated");
      }

      const API_URL = "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/saved-workouts/${selectedWorkout._id}/add-exercise`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          exerciseName: selectedExerciseDetails.name, 
          category: selectedCategory 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add exercise');
      }

      const data = await response.json();
      setSavedWorkouts(prevWorkouts => 
        prevWorkouts.map(workout => 
          workout._id === selectedWorkout._id ? data.workout : workout
        )
      );
      setSelectedWorkout(data.workout);
      setShowAddExercise(false);
      setExerciseName('');
      setSelectedCategory('');
      setSelectedExerciseDetails(null);
      alert('Exercise added successfully!');
    } catch (error) {
      console.error("Error adding exercise:", error);
      alert(`Failed to add exercise: ${error.message}`);
    }
  };

  if (loading) return <LoadingMessage>Loading saved workouts...</LoadingMessage>;

  return (
    <WorkoutWrapper>
      <Header>
        <span>Saved Workouts</span>
        <HeaderButtonContainer>
          <HomeButton onClick={() => navigate('/exercise-home')}>Exercise Home</HomeButton>
        </HeaderButtonContainer>
      </Header>
      <Content>
        <h1>Your Saved Workouts</h1>
        {savedWorkouts.length === 0 ? (
          <NoWorkoutsMessage>No saved workouts yet. Generate a workout plan and save it!</NoWorkoutsMessage>
        ) : (
          <WorkoutGrid>
            {savedWorkouts.map((workout) => (
              <WorkoutCard 
                key={workout._id} 
                onClick={() => setSelectedWorkout(workout)}
              >
                <DeleteButton onClick={(e) => deleteWorkout(workout._id, e)}>×</DeleteButton>
                <h4>{workout.name || workout.splitType.replace(/_/g, ' ').toUpperCase()}</h4>
                <p>Split: {workout.splitType.replace(/_/g, ' ').toUpperCase()}</p>
                <p> {new Date(workout.createdAt).toLocaleDateString()}</p>
              </WorkoutCard>
            ))}
          </WorkoutGrid>
        )}
      </Content>

      {exerciseLoading && <p>Loading exercise details...</p>}

      {selectedExercise && selectedWorkout && (
        <ExerciseCard>
          <h2>{selectedExercise.name}</h2>

          {selectedExercise.gifUrl ? (
            <img 
              src={selectedExercise.gifUrl} 
              alt={selectedExercise.name} 
              onError={(e) => {
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

          <RatingContainer>
            <h4>Rate this exercise:</h4>
            <StarRating>
              {[...Array(5)].map((star, index) => {
                index += 1;
                return (
                  <StarButton
                    key={index}
                    onClick={() => handleRating(selectedExercise.originalName, index)}
                    onMouseEnter={() => setHover(index)}
                    onMouseLeave={() => setHover(rating)}
                  >
                    <span className={index <= (hover || rating) ? "on" : "off"}>
                      {index <= (hover || rating) ? "★" : "☆"}
                    </span>
                  </StarButton>
                );
              })}
            </StarRating>
            {ratingSuccess && <SuccessMessage>Rating saved successfully!</SuccessMessage>}
          </RatingContainer>

          <ButtonContainer>
            <DeleteExerciseButton onClick={() => {
              let foundCategory = null;
              let exerciseName = selectedExercise.originalName;
              
              for (const [category, exercises] of Object.entries(selectedWorkout.exercises)) {
                const foundExercise = exercises.find(ex => {
                  const exName = typeof ex === 'string' ? ex : ex.name;
                  return exName.toLowerCase() === exerciseName.toLowerCase();
                });
                
                if (foundExercise) {
                  foundCategory = category;
                  exerciseName = typeof foundExercise === 'string' ? foundExercise : foundExercise.name;
                  break;
                }
              }
              
              if (foundCategory && exerciseName) {
                deleteExercise(exerciseName, foundCategory);
              } else {
                alert('Error: Could not find exercise in workout');
              }
            }}>Delete Exercise</DeleteExerciseButton>
            <CloseButton onClick={() => setSelectedExercise(null)}>Close</CloseButton>
          </ButtonContainer>
        </ExerciseCard>
      )}

      {selectedWorkout && (
        <SavedWorkoutOverlay>
          <SavedWorkoutContent>
            <ButtonContainer>
              <CloseButton onClick={() => setSelectedWorkout(null)}>Close</CloseButton>
              <AddButton onClick={() => setShowAddExercise(true)}>+</AddButton>
            </ButtonContainer>
            <h2>{selectedWorkout.name || selectedWorkout.splitType.replace(/_/g, ' ').toUpperCase()}</h2>
            <WorkoutRow>
              {Object.entries(selectedWorkout.exercises).map(([category, exercises]) => (
                <WorkoutColumn key={category}>
                  <h4>{category.toUpperCase()}</h4>
                  <ul>
                    {exercises.map((exercise, index) => (
                      <li 
                        key={index} 
                        onClick={() => {
                          const exerciseName = typeof exercise === 'string' ? exercise : exercise.name;
                          fetchExerciseDetails(exerciseName);
                        }}
                      >
                        {typeof exercise === 'string' ? exercise : exercise.name}
                      </li>
                    ))}
                  </ul>
                </WorkoutColumn>
              ))}
            </WorkoutRow>
          </SavedWorkoutContent>
        </SavedWorkoutOverlay>
      )}

      {showAddExercise && (
        <AddExerciseModal>
          <ModalContent>
            <CardHeader>
              <h3>Add Exercise to {selectedWorkout?.name || selectedWorkout?.splitType.replace(/_/g, ' ').toUpperCase()}</h3>
              <CloseButton 
                onClick={() => {
                  setShowAddExercise(false);
                  setExerciseName('');
                  setSelectedCategory('');
                  setSelectedExerciseDetails(null);
                }}
              >
                ×
              </CloseButton>
            </CardHeader>
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

            {exerciseDetailsLoading && <p>Loading exercise details...</p>}

            {selectedExerciseDetails && (
              <ExerciseDetailsCard>
                <h3>{selectedExerciseDetails.name}</h3>
                {selectedExerciseDetails.gifUrl ? (
                  <GifContainer>
                    <img 
                      src={selectedExerciseDetails.gifUrl} 
                      alt={selectedExerciseDetails.name}
                      onError={(e) => {
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
                <ExerciseInfo>
                  <p><strong>Target Muscle:</strong> {selectedExerciseDetails.target || "N/A"}</p>
                  <p><strong>Equipment:</strong> {selectedExerciseDetails.equipment || "N/A"}</p>
                </ExerciseInfo>
                <FormGroup>
                  <label>Select Category:</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {Object.keys(selectedWorkout?.exercises || {}).map(category => (
                      <option key={category} value={category}>
                        {category.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </FormGroup>
                <ButtonContainer>
                  <AddButton onClick={handleAddExercise}>Add to Workout</AddButton>
                  <CloseButton onClick={() => {
                    setShowAddExercise(false);
                    setExerciseName('');
                    setSelectedCategory('');
                    setSelectedExerciseDetails(null);
                  }}>Cancel</CloseButton>
                </ButtonContainer>
              </ExerciseDetailsCard>
            )}
          </ModalContent>
        </AddExerciseModal>
      )}
    </WorkoutWrapper>
  );
};

export default SavedWorkouts;

const WorkoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(45deg, #CC3333, #FF9933, #3366CC, #9933CC);
  background-size: 400% 400%;
  animation: gradientAnimation 10s ease infinite;
  color: #333;
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
  justify-content: space-between;
  padding: 0 20px;
  font-size: 24px;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 4px 6px rgb(201, 80, 169);
  
  span {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
  }
`;

const HeaderButtonContainer = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
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
  width: 90%;
  max-width: 1200px;
`;

const WorkoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  padding: 20px;
`;

const WorkoutCard = styled.div`
  position: relative;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;

  &:hover {
    transform: translateY(-5px);
    background-color: rgba(255, 255, 255, 0.25);
  }

  h4 {
    margin: 0 0 10px 0;
    color: white;
  }

  p {
    margin: 5px 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  z-index: 2;

  &:hover {
    background-color: rgba(255, 0, 0, 1);
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

const DeleteExerciseButton = styled.button`
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #cc0000;
  }
`;

const SavedWorkoutOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
`;

const SavedWorkoutContent = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  width: 90%;
  max-width: 1400px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
`;

const WorkoutRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
`;

const WorkoutColumn = styled.div`
  flex: 1;
  min-width: 300px;
  max-width: 400px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin: 10px;
  
  h4 {
    margin-bottom: 15px;
    color: #fff;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 10px;
    max-height: 400px;
    overflow-y: auto;
    
    li {
      background-color: rgba(255, 255, 255, 0.1);
      padding: 10px;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
`;

const CloseButton = styled.button`
  background-color: #666;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #444;
  }
`;

const NoWorkoutsMessage = styled.p`
  text-align: center;
  font-size: 1.2em;
  color: #666;
  margin-top: 40px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
`;

const LoadingMessage = styled.p`
  text-align: center;
  font-size: 1.2em;
  color: #666;
  margin-top: 100px;
`;

const RatingContainer = styled.div`
  margin: 20px 0;
  text-align: center;
`;

const StarRating = styled.div`
  display: flex;
  justify-content: center;
  gap: 5px;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  padding: 0;
  
  span {
    color: #ccc;
    transition: color 0.2s;
    
    &.on {
      color: #ffd700;
    }
  }
`;

const SuccessMessage = styled.div`
  color: #4CAF50;
  margin-top: 10px;
  font-weight: bold;
  animation: fadeInOut 2s ease-in-out;
  
  @keyframes fadeInOut {
    0% { opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
`;

const AddButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #218838;
  }
`;

const AddExerciseModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  color: black;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  position: relative;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
  }

  input, select {
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
  z-index: 1002;
  list-style: none;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SuggestionItem = styled.li`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ExerciseDetailsCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;

  h3 {
    margin: 0;
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

const ExerciseInfo = styled.div`
  margin: 15px 0;
  text-align: left;
  
  p {
    margin: 8px 0;
    line-height: 1.4;
  }
`; 