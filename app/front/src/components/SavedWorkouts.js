import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const SavedWorkouts = () => {
  const navigate = useNavigate();
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedWorkout, setExpandedWorkout] = useState(null);

  useEffect(() => {
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

    fetchSavedWorkouts();
  }, []);

  const toggleWorkoutExpansion = (workoutId) => {
    setExpandedWorkout(expandedWorkout === workoutId ? null : workoutId);
  };

  if (loading) return <LoadingMessage>Loading saved workouts...</LoadingMessage>;

  return (
    <WorkoutWrapper>
      <Header>
        <span>Saved Workouts</span>
        <ButtonContainer>
          <HomeButton onClick={() => navigate('/exercise-home')}>Back to Exercise Home</HomeButton>
        </ButtonContainer>
      </Header>
      <Content>
        <h1>Your Saved Workouts</h1>
        {savedWorkouts.length === 0 ? (
          <NoWorkoutsMessage>No saved workouts yet. Generate a workout plan and save it!</NoWorkoutsMessage>
        ) : (
          <WorkoutGrid>
            {savedWorkouts.map((workout, index) => (
              <WorkoutCard 
                key={workout._id || index}
                onClick={() => toggleWorkoutExpansion(workout._id)}
              >
                <WorkoutTitle>{workout.name || `Workout ${index + 1}`}</WorkoutTitle>
                <WorkoutDate>{new Date(workout.createdAt).toLocaleDateString()}</WorkoutDate>
                <SplitType>Split Type: {workout.splitType.replace(/_/g, ' ').toUpperCase()}</SplitType>
                {expandedWorkout === workout._id && (
                  Object.entries(workout.exercises).map(([category, exercises]) => (
                    <CategorySection key={category}>
                      <CategoryTitle>{category.charAt(0).toUpperCase() + category.slice(1)}</CategoryTitle>
                      <ExerciseList>
                        {exercises.map((exercise, idx) => (
                          <ExerciseItem key={idx}>{exercise}</ExerciseItem>
                        ))}
                      </ExerciseList>
                    </CategorySection>
                  ))
                )}
              </WorkoutCard>
            ))}
          </WorkoutGrid>
        )}
      </Content>
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
  background: linear-gradient(45deg, #B7E4C7, #FFE066, #74C0FC, #c4a7e7);
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
  top: 50%;
  transform: translateY(-50%);
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
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const WorkoutTitle = styled.h2`
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.5em;
`;

const WorkoutDate = styled.p`
  color: #666;
  font-size: 0.9em;
  margin-bottom: 10px;
`;

const SplitType = styled.p`
  color: #007bff;
  font-weight: bold;
  margin-bottom: 15px;
  text-transform: capitalize;
`;

const CategorySection = styled.div`
  margin-bottom: 15px;
  display: none; // Hide by default
`;

const CategoryTitle = styled.h3`
  color: #28a745;
  margin: 0 0 10px 0;
  font-size: 1.1em;
`;

const ExerciseList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ExerciseItem = styled.li`
  padding: 5px 0;
  color: #444;
  font-size: 0.9em;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
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