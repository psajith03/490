import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  max-width: 400px;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 20px;
  font-size: 18px;
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
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  max-width: 500px;
  width: 90%;
`;

const GuideTitle = styled.h2`
  color: rgb(217, 176, 255);
  margin-bottom: 15px;
  text-align: center;
`;

const GuideText = styled.p`
  color: #333;
  margin-bottom: 10px;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: rgb(217, 176, 255);
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const ProgressiveOverload = () => {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);

  return (
    <Container>
      <Header>
        <GuideButton onClick={() => setShowGuide(true)}>?</GuideButton>
        <BackButton onClick={() => navigate('/exercise-home')}>Exercise Home</BackButton>
      </Header>
      <Title>Progressive Overload</Title>
      <ButtonContainer>
        <ActionButton onClick={() => navigate('/progressive-overload/new')}>
          Create New Progressive Overload
        </ActionButton>
        <ActionButton onClick={() => navigate('/progressive-overload/select')}>
          View Existing Progressive Overloads
        </ActionButton>
      </ButtonContainer>

      {showGuide && (
        <>
          <Overlay onClick={() => setShowGuide(false)} />
          <GuideCard>
            <CloseButton onClick={() => setShowGuide(false)}>×</CloseButton>
            <GuideTitle>Progressive Overload Guide</GuideTitle>
            <GuideText>
              Progressive Overload is a training principle that involves gradually increasing the stress placed on your body during exercise to continue making gains in muscle size, strength, and endurance.
            </GuideText>
            <GuideText>
              To use this feature:
            </GuideText>
            <GuideText>
              1. Click "Create New Progressive Overload" to start tracking a new workout
            </GuideText>
            <GuideText>
              2. Select a workout from your saved workouts
            </GuideText>
            <GuideText>
              3. Enter your current weights and reps for each exercise
            </GuideText>
            <GuideText>
              4. Save your progress and track improvements over time
            </GuideText>
            <GuideText>
              5. Use "View Existing Progressive Overloads" to update your progress
            </GuideText>
          </GuideCard>
        </>
      )}
    </Container>
  );
};

export default ProgressiveOverload; 