import styled from 'styled-components';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Diet from './Diet';

const DietHome = () => {
  const navigate = useNavigate();

  return (
    <DietWrapper>
      <Header>
        <span>Diet Home</span>
        <ButtonContainer>
          <HomeButton onClick={() => navigate('/')}>Home</HomeButton>
        </ButtonContainer>
      </Header>
      <Content>
        <h1>Select an option to proceed.</h1>
        <GenerateButton onClick={() => navigate('/Diet')}>
          Generate Meal based on Ingredients
        </GenerateButton>
        <GenerateButton onClick={() => navigate('/Nutrition')}>
          Generate Nutrition based on Ingredients
        </GenerateButton>
      </Content>
    </DietWrapper>
  );
};

export default DietHome;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const DietWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  background: radial-gradient(125% 125% at 50% 10%, rgb(217, 39, 39) 40%, #000 100%);
  color: white;
  text-align: center;
  padding: 20px;
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
  margin-top: 20px;
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
