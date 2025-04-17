import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const NewProgressive = () => {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [exerciseProgress, setExerciseProgress] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchSavedWorkouts = async () => {
    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) {
        console.warn("No ID token available. User may not be authenticated.");
        setLoading(false);
        return;
      }

      const API_URL = "http://localhost:5000";
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

  const handleExerciseProgressChange = (exerciseName, field, value) => {
    setExerciseProgress(prev => ({
      ...prev,
      [exerciseName]: {
        ...prev[exerciseName],
        [field]: value
      }
    }));
  };

  const saveProgressiveOverload = async () => {
    if (!selectedWorkout) {
      alert("Please select a workout first");
      return;
    }

    const exercises = Object.entries(exerciseProgress).map(([name, progress]) => ({
      name,
      currentWeight: progress.currentWeight || 0,
      currentReps: progress.currentReps || 0
    }));

    if (exercises.length === 0) {
      alert("Please enter progress for at least one exercise");
      return;
    }

    setSaving(true);
    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) {
        throw new Error("User not authenticated");
      }

      const API_URL = "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/progressive-overload/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          workoutId: selectedWorkout._id,
          exercises
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save progressive overload');
      }

      alert("Progressive overload saved successfully!");
      navigate('/progressive-overload/select');
    } catch (error) {
      console.error("Error saving progressive overload:", error);
      alert(`Failed to save progressive overload: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingMessage>Loading saved workouts...</LoadingMessage>;

  return (
    <Container>
      <Header>
        <GuideButton onClick={() => setShowGuide(true)}>?</GuideButton>
        <BackButton onClick={() => navigate('/progressive-overload')}>Back</BackButton>
      </Header>
      <Content>
        <Title>Start New Progressive Overload</Title>
        <WorkoutSelection>
          <h3>Select a Saved Workout</h3>
          <WorkoutGrid>
            {savedWorkouts.map((workout) => (
              <WorkoutCard 
                key={workout._id} 
                selected={selectedWorkout?._id === workout._id}
                onClick={() => setSelectedWorkout(workout)}
              >
                <h4>{workout.name || workout.splitType.replace(/_/g, ' ').toUpperCase()}</h4>
                <p>Split: {workout.splitType.replace(/_/g, ' ').toUpperCase()}</p>
                <p>Created: {new Date(workout.createdAt).toLocaleDateString()}</p>
              </WorkoutCard>
            ))}
          </WorkoutGrid>
        </WorkoutSelection>

        {selectedWorkout && (
          <ExerciseProgress>
            <h3>Enter Current Progress</h3>
            {Object.entries(selectedWorkout.exercises).map(([category, exercises]) => (
              <CategorySection key={category}>
                <h4>{category.toUpperCase()}</h4>
                {exercises.map((exercise) => {
                  const exerciseName = typeof exercise === 'string' ? exercise : exercise.name;
                  return (
                    <ExerciseInput key={exerciseName}>
                      <ExerciseName>{exerciseName}</ExerciseName>
                      <InputGroup>
                        <Input
                          type="number"
                          placeholder="Current Weight (lbs)"
                          value={exerciseProgress[exerciseName]?.currentWeight || ''}
                          onChange={(e) => handleExerciseProgressChange(exerciseName, 'currentWeight', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Current Reps"
                          value={exerciseProgress[exerciseName]?.currentReps || ''}
                          onChange={(e) => handleExerciseProgressChange(exerciseName, 'currentReps', e.target.value)}
                        />
                      </InputGroup>
                    </ExerciseInput>
                  );
                })}
              </CategorySection>
            ))}
            <SaveButton onClick={saveProgressiveOverload} disabled={saving}>
              {saving ? 'Saving...' : 'Save Progressive Overload'}
            </SaveButton>
          </ExerciseProgress>
        )}
      </Content>

      {showGuide && (
        <ModalOverlay>
          <GuideCard>
            <CloseButton onClick={() => setShowGuide(false)}>×</CloseButton>
            <GuideTitle>Progressive Overload Guide</GuideTitle>
            <GuideContent>
              <h2>What is Progressive Overload?</h2>
              <p>Progressive overload is the gradual increase of stress placed upon the body during exercise training. It's a fundamental principle of strength training and muscle growth.</p>
              
              <h2>How to Implement Progressive Overload</h2>
              <p>Increase Weight: Gradually add more weight to your exercises</p>
              <p>Increase Repetitions: Add more reps to your sets</p>
              <p>Increase Sets: Add more sets to your workout</p>
              <p>Decrease Rest Time: Reduce rest periods between sets</p>
              <p>Increase Frequency: Work out more often</p>
              <p>Improve Form: Focus on better technique and control</p>

              <h2>Tips for Success</h2>
              <p>Track your progress consistently</p>
              <p>Make small, sustainable increases</p>
              <p>Listen to your body and avoid overtraining</p>
              <p>Maintain proper form at all times</p>
              <p>Get adequate rest and recovery</p>
            </GuideContent>
          </GuideCard>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default NewProgressive;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(45deg, #B7E4C7, #FFE066, #74C0FC, #c4a7e7);
  background-size: 400% 400%;
  animation: gradientAnimation 10s ease infinite;
  color: #333;
  text-align: center;
  position: relative;
  overflow-x: hidden;

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

const GuideButton = styled.button`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgb(217, 176, 255);
  color: white;
  border: none;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 1em .25em rgb(217, 176, 255),
              0 0 4em 1em rgba(191, 123, 255, 0.5);
  transition: all 0.3s;

  &:hover {
    background-color: white;
    color: rgb(217, 176, 255);
    box-shadow: 0 0 1em .25em rgb(217, 176, 255),
                0 0 4em 2em rgba(191, 123, 255, 0.5);
  }
`;

const BackButton = styled.button`
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
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-size: 2.5em;
  color: #333;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const WorkoutSelection = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

const WorkoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const WorkoutCard = styled.div`
  background-color: ${props => props.selected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.15)'};
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  border: ${props => props.selected ? '2px solid rgb(217, 176, 255)' : 'none'};

  &:hover {
    transform: translateY(-5px);
    background-color: rgba(255, 255, 255, 0.25);
  }

  h4 {
    margin: 0 0 10px 0;
    color: ${props => props.selected ? '#333' : 'white'};
  }

  p {
    margin: 5px 0;
    color: ${props => props.selected ? '#666' : 'rgba(255, 255, 255, 0.8)'};
    font-size: 14px;
  }
`;

const ExerciseProgress = styled.div`
  width: 100%;
  max-width: 800px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ExerciseInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
`;

const ExerciseName = styled.h5`
  margin: 0;
  color: #333;
  font-size: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: rgb(217, 176, 255);
  }
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 80px;
  width: 100%;
  max-width: 800px;
  padding: 0 20px;
  box-sizing: border-box;

  @media (max-width: 600px) {
    padding: 0 10px;
  }
`;

const CategorySection = styled.div`
  margin-bottom: 30px;
  text-align: left;

  h4 {
    color: #333;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 2px solid rgb(217, 176, 255);
  }
`;

const SaveButton = styled.button`
  margin-top: 30px;
  padding: 12px 24px;
  background-color: rgb(217, 176, 255);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: rgb(191, 123, 255);
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingMessage = styled.p`
  text-align: center;
  font-size: 1.2em;
  color: #666;
  margin-top: 100px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const GuideCard = styled.div`
  background-color: white;
  border-radius: 15px;
  padding: 30px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 5px;
  line-height: 1;
  transition: color 0.3s;

  &:hover {
    color: #333;
  }
`;

const GuideTitle = styled.h1`
  font-size: 2em;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const GuideContent = styled.div`
  h2 {
    color: #333;
    margin-top: 20px;
    margin-bottom: 15px;
  }

  p {
    line-height: 1.6;
    margin-bottom: 20px;
  }
`;