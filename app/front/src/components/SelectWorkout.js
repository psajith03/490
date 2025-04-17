import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { auth } from '../firebase';

const API_URL = "http://localhost:5000";

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(45deg, #B7E4C7, #FFE066, #74C0FC, #c4a7e7);
  background-size: 400% 400%;
  animation: gradientAnimation 10s ease infinite;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;

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

const GuideButton = styled.button`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: .25em solid rgb(217, 176, 255);
  color: rgb(217, 176, 255);
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 1em .25em rgb(217, 176, 255),
              0 0 4em 1em rgba(191, 123, 255, 0.5),
              inset 0 0 .75em .25em rgb(217, 176, 255);
  text-shadow: 0 0 .5em rgb(217, 176, 255);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgb(217, 176, 255);
    color: #222;
  }
`;

const Title = styled.h1`
  font-size: 2.5em;
  color: #333;
  margin-top: 100px;
  margin-bottom: 50px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const WorkoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  margin-top: 20px;
`;

const WorkoutCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const WorkoutName = styled.h3`
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.5em;
`;

const WorkoutInfo = styled.div`
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.9em;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
  background-color: rgb(217, 176, 255);
  color: white;
  margin-bottom: 10px;
`;

const Message = styled.p`
  color: #666;
  font-size: 1.2em;
  margin-top: 100px;
  text-align: center;
`;

const Button = styled.button`
  padding: 10px 20px;
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

const GuideCard = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const GuideTitle = styled.h2`
  color: rgb(217, 176, 255);
  margin-bottom: 20px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(217, 176, 255, 0.5);
`;

const GuideText = styled.p`
  color: #333;
  margin-bottom: 15px;
  line-height: 1.6;
  font-size: 16px;
  
  &:first-of-type {
    font-weight: bold;
    color: rgb(217, 176, 255);
    margin-top: 10px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: rgb(217, 176, 255);
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.2);
    color: #333;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const SelectWorkout = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

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

        const progressiveResponse = await axios.get(`${API_URL}/api/progressive-overload`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        console.log('Progressive overloads response:', progressiveResponse.data);
        const workoutIdsWithProgressive = progressiveResponse.data.map(overload => overload.workout._id);
        console.log('Workout IDs with progressive overload:', workoutIdsWithProgressive);

        const workoutsResponse = await axios.get(`${API_URL}/api/saved-workouts`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        console.log('Workouts response:', workoutsResponse.data);

        const filteredWorkouts = workoutsResponse.data.filter(workout => 
          workoutIdsWithProgressive.includes(workout._id)
        );
        console.log('Filtered workouts:', filteredWorkouts);

        setWorkouts(filteredWorkouts);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        }
        setError('Failed to load workouts');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWorkoutSelect = (workoutId) => {
    navigate(`/progressive-overload/${workoutId}`);
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <GuideButton onClick={() => setShowGuide(true)}>?</GuideButton>
          <BackButton onClick={() => navigate('/progressive-overload')}>PO Home</BackButton>
        </Header>
        <Message>Loading workouts...</Message>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <GuideButton onClick={() => setShowGuide(true)}>?</GuideButton>
          <BackButton onClick={() => navigate('/progressive-overload')}>PO Home</BackButton>
        </Header>
        <Message>{error}</Message>
      </Container>
    );
  }

  if (workouts.length === 0) {
    return (
      <Container>
        <Header>
          <GuideButton onClick={() => setShowGuide(true)}>?</GuideButton>
          <BackButton onClick={() => navigate('/progressive-overload')}>PO Home</BackButton>
        </Header>
        <Title>No Progressive Overload Workouts</Title>
        <Message>You haven't created any progressive overload entries yet.</Message>
        <Button onClick={() => navigate('/progressive-overload/new')}>
          Create New Progressive Overload
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <GuideButton onClick={() => setShowGuide(true)}>?</GuideButton>
        <BackButton onClick={() => navigate('/progressive-overload')}>PO Home</BackButton>
      </Header>
      <Title>Select Workout</Title>
      <WorkoutGrid>
        {workouts.map((workout) => (
          <WorkoutCard key={workout._id} onClick={() => handleWorkoutSelect(workout._id)}>
            <StatusBadge>In Progress</StatusBadge>
            <WorkoutName>{workout.name}</WorkoutName>
            <WorkoutInfo>
              <span>Split: {workout.splitType}</span>
              <span>Created: {new Date(workout.createdAt).toLocaleDateString()}</span>
            </WorkoutInfo>
          </WorkoutCard>
        ))}
      </WorkoutGrid>

      {showGuide && (
        <>
          <Overlay onClick={() => setShowGuide(false)} />
          <GuideCard>
            <CloseButton onClick={() => setShowGuide(false)}>×</CloseButton>
            <GuideTitle>Progressive Overload Guide</GuideTitle>
            <GuideText>
              What is Progressive Overload?
            </GuideText>
            <GuideText>
              Progressive overload is the gradual increase of stress placed upon the body during exercise training. It's a fundamental principle of strength training and muscle growth.
            </GuideText>
            <GuideText>
              How to Implement Progressive Overload
            </GuideText>
            <GuideText>
              • Increase Weight: Gradually add more weight to your exercises
            </GuideText>
            <GuideText>
              • Increase Repetitions: Add more reps to your sets
            </GuideText>
            <GuideText>
              • Increase Sets: Add more sets to your workout
            </GuideText>
            <GuideText>
              • Decrease Rest Time: Reduce rest periods between sets
            </GuideText>
            <GuideText>
              • Increase Frequency: Work out more often
            </GuideText>
            <GuideText>
              • Improve Form: Focus on better technique and control
            </GuideText>
            <GuideText>
              Tips for Success
            </GuideText>
            <GuideText>
              • Track your progress consistently
            </GuideText>
            <GuideText>
              • Make small, sustainable increases
            </GuideText>
            <GuideText>
              • Listen to your body and avoid overtraining
            </GuideText>
            <GuideText>
              • Maintain proper form at all times
            </GuideText>
            <GuideText>
              • Get adequate rest and recovery
            </GuideText>
          </GuideCard>
        </>
      )}
    </Container>
  );
};

export default SelectWorkout; 