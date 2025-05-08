import styled from 'styled-components';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ExerciseHome = () => {
  const navigate = useNavigate();

  return (
    <ExerciseWrapper>
      <Header>
        <span>Exercise Home</span>
        <HomeButton onClick={() => navigate('/')}><span>Home</span></HomeButton>
      </Header>
      <Content>
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
          <AIRecommendationButton onClick={() => navigate('/exercise-prediction')}>
            AI Recommendation
          </AIRecommendationButton>
        </ButtonContainer>
      </Content>
    </ExerciseWrapper>
  );
};

export default ExerciseHome;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
  justify-content: center;
  width: 100%;
  max-width: 800px;

  @media (max-width: 768px) {
    gap: 15px;
  }

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const ExerciseWrapper = styled.div`
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

const BaseButton = styled.button`
  --glow-color: rgb(217, 176, 255);
  --glow-spread-color: rgba(191, 123, 255, 0.781);
  --enhanced-glow-color: rgb(231, 206, 255);
  --btn-color: rgb(100, 61, 136);
  border: .25em solid var(--glow-color);
  padding: 1em 3em;
  color: var(--glow-color);
  font-size: 15px;
  font-weight: bold;
  background-color: var(--btn-color);
  border-radius: 1em;
  outline: none;
  box-shadow: 0 0 1em .25em var(--glow-color),
          0 0 4em 1em var(--glow-spread-color),
          inset 0 0 .75em .25em var(--glow-color);
  text-shadow: 0 0 .5em var(--glow-color);
  position: relative;
  transition: all 0.3s;
  cursor: pointer;

  &::after {
    pointer-events: none;
    content: "";
    position: absolute;
    top: 120%;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: var(--glow-spread-color);
    filter: blur(2em);
    opacity: .7;
    transform: perspective(1.5em) rotateX(35deg) scale(1, .6);
  }

  &:hover {
    color: var(--btn-color);
    background-color: var(--glow-color);
    box-shadow: 0 0 1em .25em var(--glow-color),
            0 0 4em 2em var(--glow-spread-color),
            inset 0 0 .75em .25em var(--glow-color);
  }

  &:active {
    box-shadow: 0 0 0.6em .25em var(--glow-color),
            0 0 2.5em 2em var(--glow-spread-color),
            inset 0 0 .5em .25em var(--glow-color);
  }
`;

const GenerateButton = styled(BaseButton)`
  --glow-color: rgb(0, 123, 255);
  --glow-spread-color: rgba(0, 86, 179, 0.781);
  --enhanced-glow-color: rgb(0, 191, 255);
  --btn-color: rgb(0, 61, 136);
`;

const SavedWorkoutsButton = styled(BaseButton)`
  --glow-color: rgb(40, 167, 69);
  --glow-spread-color: rgba(33, 136, 56, 0.781);
  --enhanced-glow-color: rgb(40, 167, 100);
  --btn-color: rgb(0, 100, 0);
`;

const CustomWorkoutButton = styled(BaseButton)`
  --glow-color: rgb(255, 193, 7);
  --glow-spread-color: rgba(224, 168, 0, 0.781);
  --enhanced-glow-color: rgb(255, 220, 100);
  --btn-color: rgb(136, 100, 0);
`;

const RatedWorkoutsButton = styled(BaseButton)`
  --glow-color: rgb(111, 66, 193);
  --glow-spread-color: rgba(90, 50, 163, 0.781);
  --enhanced-glow-color: rgb(150, 100, 255);
  --btn-color: rgb(50, 0, 100);
`;

const AIRecommendationButton = styled(BaseButton)`
  --glow-color: rgb(255, 64, 129);
  --glow-spread-color: rgba(255, 64, 129, 0.781);
  --enhanced-glow-color: rgb(255, 100, 150);
  --btn-color: rgb(136, 0, 50);
`;
