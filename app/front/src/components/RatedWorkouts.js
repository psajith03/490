import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const MUSCLE_GROUPS = [
  "Abdominals", "Adductors", "Abductors", "Biceps", "Calves", "Chest",
  "Forearms", "Glutes", "Hamstrings", "Lats", "Lower Back", "Middle Back",
  "Traps", "Neck", "Quadriceps", "Shoulders", "Triceps"
];

const MUSCLE_MAPPING = {
  "abdominals": ["Abdominals"],
  "abs": ["Abdominals"],
  "core": ["Abdominals"],
  "obliques": ["Abdominals"],
  
  "adductors": ["Adductors"],
  "abductors": ["Abductors"],
  "calves": ["Calves"],
  "glutes": ["Glutes"],
  "hamstrings": ["Hamstrings"],
  "quadriceps": ["Quadriceps"],
  "quads": ["Quadriceps"],
  
  "biceps": ["Biceps"],
  "chest": ["Chest"],
  "forearms": ["Forearms"],
  "lats": ["Lats"],
  "lower back": ["Lower Back"],
  "middle back": ["Middle Back"],
  "traps": ["Traps"],
  "neck": ["Neck"],
  "shoulders": ["Shoulders"],
  "triceps": ["Triceps"],
  
  "back": ["Lats", "Middle Back", "Lower Back", "Traps"],
  "arms": ["Biceps", "Triceps", "Forearms"],
  "legs": ["Quadriceps", "Hamstrings", "Calves", "Glutes", "Adductors", "Abductors"]
};

const RatedWorkouts = () => {
  const navigate = useNavigate();
  const [ratedExercises, setRatedExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [exerciseDetails, setExerciseDetails] = useState({});

  useEffect(() => {
    const fetchRatedExercises = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/');
          return;
        }

        const token = await user.getIdToken();
        const response = await fetch('http://localhost:5000/api/saved-workouts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch saved workouts');
        }

        const savedWorkouts = await response.json();
        const allRatedExercises = savedWorkouts.reduce((acc, workout) => {
          if (workout.ratings && Object.keys(workout.ratings).length > 0) {
            Object.entries(workout.ratings).forEach(([exerciseName, rating]) => {
              acc.push({
                exerciseName,
                rating,
                workoutName: workout.name || workout.splitType.replace(/_/g, ' ').toUpperCase(),
                createdAt: workout.createdAt
              });
            });
          }
          return acc;
        }, []);

        const exerciseRatings = allRatedExercises.reduce((acc, exercise) => {
          if (!acc[exercise.exerciseName]) {
            acc[exercise.exerciseName] = {
              totalRating: 0,
              count: 0,
              latestWorkout: exercise.workoutName,
              latestDate: exercise.createdAt
            };
          }
          acc[exercise.exerciseName].totalRating += exercise.rating;
          acc[exercise.exerciseName].count += 1;
          
          if (new Date(exercise.createdAt) > new Date(acc[exercise.exerciseName].latestDate)) {
            acc[exercise.exerciseName].latestWorkout = exercise.workoutName;
            acc[exercise.exerciseName].latestDate = exercise.createdAt;
          }
          
          return acc;
        }, {});

        const averagedExercises = Object.entries(exerciseRatings).map(([exerciseName, data]) => ({
          exerciseName,
          rating: Math.round((data.totalRating / data.count) * 10) / 10,
          workoutName: data.latestWorkout,
          createdAt: data.latestDate,
          ratingCount: data.count
        }));

        setRatedExercises(averagedExercises);

        const details = {};
        for (const exercise of averagedExercises) {
          if (!details[exercise.exerciseName]) {
            try {
              const exerciseResponse = await fetch(`http://localhost:5000/api/exercise/${encodeURIComponent(exercise.exerciseName)}`);
              const data = await exerciseResponse.json();
              details[exercise.exerciseName] = {
                target: data.target || 'Other',
                equipment: data.equipment,
                instructions: data.instructions
              };
            } catch (error) {
              console.error(`Error fetching details for ${exercise.exerciseName}:`, error);
              details[exercise.exerciseName] = {
                target: 'Other',
                equipment: 'Unknown',
                instructions: []
              };
            }
          }
        }
        setExerciseDetails(details);
      } catch (error) {
        console.error('Error fetching rated exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatedExercises();
  }, [navigate]);

  const fetchExerciseDetails = async (exerciseName) => {
    setExerciseLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/exercise/${encodeURIComponent(exerciseName)}`);
      const data = await response.json();
      setSelectedExercise(data);
    } catch (error) {
      console.error('Error fetching exercise details:', error);
    } finally {
      setExerciseLoading(false);
    }
  };

  const getTargetMuscles = (target) => {
    if (!target) return ['Other'];
    const targetLower = target.toLowerCase();
    for (const [key, muscles] of Object.entries(MUSCLE_MAPPING)) {
      if (targetLower.includes(key)) {
        return muscles;
      }
    }
    return [target];
  };

  const getFilteredExercises = () => {
    if (selectedMuscleGroup) {
      return ratedExercises.filter(exercise => {
        const target = exerciseDetails[exercise.exerciseName]?.target;
        if (!target) return false;
        
        const targetMuscles = getTargetMuscles(target);
        return targetMuscles.includes(selectedMuscleGroup);
      });
    }
    return ratedExercises;
  };

  const filteredExercises = getFilteredExercises();

  return (
    <WorkoutWrapper>
      <Header>
        <span>Rated Workouts</span>
        <ButtonContainer>
          <HomeButton onClick={() => navigate('/exercise-home')}>Exercise Home</HomeButton>
        </ButtonContainer>
      </Header>
      <Content>
        <h1>Your Rated Exercises</h1>
        
        <MuscleGroupButtons>
          {MUSCLE_GROUPS.map((muscle) => (
            <MuscleGroupButton
              key={muscle}
              onClick={() => setSelectedMuscleGroup(muscle)}
              active={selectedMuscleGroup === muscle}
            >
              {muscle}
            </MuscleGroupButton>
          ))}
          <MuscleGroupButton
            onClick={() => setSelectedMuscleGroup(null)}
            active={selectedMuscleGroup === null}
          >
            All
          </MuscleGroupButton>
        </MuscleGroupButtons>

        {loading ? (
          <LoadingMessage>Loading rated exercises...</LoadingMessage>
        ) : filteredExercises.length === 0 ? (
          <NoWorkoutsMessage>
            {selectedMuscleGroup
              ? `No rated exercises for ${selectedMuscleGroup} yet.`
              : 'No rated exercises yet. Rate some exercises to see them here!'}
          </NoWorkoutsMessage>
        ) : (
          <WorkoutGrid>
            {filteredExercises.map((exercise, index) => (
              <WorkoutCard key={`${exercise.exerciseName}-${index}`}>
                <h4>{exercise.exerciseName}</h4>
                <p>Rating: {'★'.repeat(Math.round(exercise.rating))}{'☆'.repeat(5 - Math.round(exercise.rating))} ({exercise.rating.toFixed(1)})</p>
                {exercise.ratingCount > 1 && <p>Based on {exercise.ratingCount} ratings</p>}
                <p>From: {exercise.workoutName}</p>
                <p>Rated on: {new Date(exercise.createdAt).toLocaleDateString()}</p>
                <ViewButton onClick={() => fetchExerciseDetails(exercise.exerciseName)}>View Exercise</ViewButton>
              </WorkoutCard>
            ))}
          </WorkoutGrid>
        )}
      </Content>

      {exerciseLoading && <p>Loading exercise details...</p>}

      {selectedExercise && (
        <ExerciseCard>
          <h2>{selectedExercise.name}</h2>

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
    </WorkoutWrapper>
  );
};

export default RatedWorkouts;

const WorkoutWrapper = styled.div`
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

const WorkoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
  margin-top: 20px;
`;

const WorkoutCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  h4 {
    margin: 0 0 10px 0;
    color: #333;
  }

  p {
    margin: 5px 0;
    color: #666;
  }
`;

const ViewButton = styled.button`
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
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

const LoadingMessage = styled.p`
  font-size: 18px;
  color: #666;
`;

const NoWorkoutsMessage = styled.p`
  font-size: 18px;
  color: #666;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const MuscleGroupButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
`;

const MuscleGroupButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: ${props => props.active ? '#6f42c1' : '#6c757d'};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.active ? '#5a32a3' : '#5a6268'};
  }
`; 