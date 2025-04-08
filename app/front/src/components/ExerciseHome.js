import styled from 'styled-components';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ExerciseHome = () => {
  const navigate = useNavigate();

  return (
    <ExerciseWrapper>
      <Header>
        <span>Exercise Home</span>
        <ButtonContainer>
          <HomeButton onClick={() => navigate('/')}>Home</HomeButton>
        </ButtonContainer>
      </Header>
      <Content>
        <h1>Select an option to proceed.</h1>
        <ButtonContainer>
          <GenerateButton onClick={() => navigate('/exercise')}>
            Generate Workout Plan
          </GenerateButton>
          <SavedWorkoutsButton onClick={() => navigate('/saved-workouts')}>
            Saved Workouts
          </SavedWorkoutsButton>
          <CustomWorkoutButton onClick={() => navigate('/custom-workouts')}>
            Create Custom Workout
          </CustomWorkoutButton>
          <RatedWorkoutsButton onClick={() => navigate('/rated-workouts')}>
            Rated Workouts
          </RatedWorkoutsButton>
        </ButtonContainer>
      </Content>
    </ExerciseWrapper>
  );
};

export default ExerciseHome;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
`;

const ExerciseWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
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

const GenerateButton = styled.button`
  padding: 12px 20px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #0056b3;
  }
`;

const SavedWorkoutsButton = styled.button`
  padding: 12px 20px;
  font-size: 18px;
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

const CustomWorkoutButton = styled.button`
  padding: 12px 20px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background: #ffc107;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #e0a800;
  }
`;

const RatedWorkoutsButton = styled.button`
  padding: 12px 20px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background: #6f42c1;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #5a32a3;
  }
`;
