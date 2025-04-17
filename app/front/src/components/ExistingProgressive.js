import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { auth } from '../firebase';

const API_URL = "http://localhost:5000";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgb(201, 80, 169);
  z-index: 1000;
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
  background-color: white;
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

const WorkoutTitle = styled.h1`
  font-size: 2.5em;
  color: #333;
  margin-top: 80px;
  margin-bottom: 30px;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 80px;
  width: 100%;
  max-width: 800px;
`;

const ExerciseCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const ExerciseName = styled.h3`
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.5em;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
  justify-content: center;
`;

const InputLabel = styled.label`
  min-width: 100px;
  color: #666;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 80px;
  font-size: 16px;
  text-align: center;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: rgb(217, 176, 255);
    box-shadow: 0 0 5px rgba(217, 176, 255, 0.5);
  }
`;

const Suggestion = styled.p`
  color: #666;
  font-style: italic;
  margin: 10px 0 0 0;
  padding: 10px;
  background: rgba(217, 176, 255, 0.1);
  border-radius: 8px;
  border-left: 4px solid rgb(217, 176, 255);
`;

const SaveButton = styled.button`
  background-color: rgb(217, 176, 255);
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 30px;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: rgb(191, 123, 255);
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  }
`;

const LoadingMessage = styled.div`
  color: #666;
  font-size: 1.2em;
  margin-top: 100px;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 1.2em;
  margin-top: 100px;
  text-align: center;
`;

const ExistingProgressive = () => {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User not authenticated');
        }

        const idToken = await user.getIdToken(true);
        console.log('Using API URL:', API_URL);
        console.log('ID Token received:', idToken);

        // First, try to get the progressive overload data
        try {
          const progressiveResponse = await axios.get(`${API_URL}/api/progressive-overload`, {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          console.log('Progressive overloads response:', progressiveResponse.data);
          
          const workoutProgressive = progressiveResponse.data.find(
            overload => overload.workout._id === workoutId
          );

          if (workoutProgressive) {
            console.log('Found existing progressive overload:', workoutProgressive);
            setExercises(workoutProgressive.exercises);
            setWorkoutName(workoutProgressive.workout.name);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error fetching progressive overload:', error);
        }

        const workoutResponse = await axios.get(`${API_URL}/api/saved-workouts/${workoutId}`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        console.log('Workout response:', workoutResponse.data);
        
        const workoutExercises = Object.entries(workoutResponse.data.exercises).flatMap(([category, exercises]) => 
          exercises.map(exercise => ({
            name: typeof exercise === 'string' ? exercise : exercise.name,
            currentWeight: 0,
            currentReps: 0
          }))
        );

        setWorkoutName(workoutResponse.data.name);
        setExercises(workoutExercises);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        }
        setError('Failed to load workout data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workoutId]);

  const handleInputChange = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index] = {
      ...newExercises[index],
      [field]: value
    };
    setExercises(newExercises);
  };

  const getSuggestion = (exercise) => {
    const currentWeight = parseFloat(exercise.currentWeight);
    const currentReps = parseInt(exercise.currentReps);
    
    if (currentReps >= 12) {
      return `Try increasing weight by 5lbs and aim for 8 reps`;
    } else if (currentReps >= 8) {
      return `Keep current weight and aim for 12 reps`;
    } else {
      return `Keep current weight and aim for 8 reps`;
    }
  };

  const validateExercises = () => {
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      if (!exercise.currentWeight || exercise.currentWeight === '') {
        setValidationError(`Please enter a weight for ${exercise.name}`);
        return false;
      }
      if (!exercise.currentReps || exercise.currentReps === '') {
        setValidationError(`Please enter reps for ${exercise.name}`);
        return false;
      }
      if (isNaN(exercise.currentWeight) || parseFloat(exercise.currentWeight) <= 0) {
        setValidationError(`Please enter a valid weight for ${exercise.name}`);
        return false;
      }
      if (isNaN(exercise.currentReps) || parseInt(exercise.currentReps) <= 0) {
        setValidationError(`Please enter valid reps for ${exercise.name}`);
        return false;
      }
    }
    setValidationError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validateExercises()) {
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const idToken = await user.getIdToken(true);
      console.log('Saving with ID Token:', idToken);

      const response = await axios.post(`${API_URL}/api/progressive-overload`, {
        workoutId,
        exercises
      }, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      console.log('Save response:', response.data);
      
      if (response.data) {
        navigate('/progressive-overload/select');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setError('Failed to save progress');
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading workout data...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/progressive-overload/select')}>Back</BackButton>
        </Header>
        <WorkoutTitle>Error</WorkoutTitle>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/progressive-overload/select')}>Back</BackButton>
      </Header>
      <WorkoutTitle>{workoutName}</WorkoutTitle>
      {validationError && (
        <ErrorMessage style={{ marginTop: '20px' }}>{validationError}</ErrorMessage>
      )}
      <ExerciseList>
        {exercises.map((exercise, index) => (
          <ExerciseCard key={index}>
            <ExerciseName>{exercise.name}</ExerciseName>
            <InputGroup>
              <InputLabel>Current Weight (lbs)</InputLabel>
              <Input
                type="number"
                value={exercise.currentWeight}
                onChange={(e) => handleInputChange(index, 'currentWeight', e.target.value)}
                placeholder="Enter weight in lbs"
                min="0"
                step="0.5"
                required
              />
            </InputGroup>
            <InputGroup>
              <InputLabel>Current Reps</InputLabel>
              <Input
                type="number"
                value={exercise.currentReps}
                onChange={(e) => handleInputChange(index, 'currentReps', e.target.value)}
                placeholder="Enter reps"
                min="1"
                required
              />
            </InputGroup>
            <Suggestion>{getSuggestion(exercise)}</Suggestion>
          </ExerciseCard>
        ))}
      </ExerciseList>
      <SaveButton onClick={handleSave}>Save Progress</SaveButton>
    </Container>
  );
};

export default ExistingProgressive; 