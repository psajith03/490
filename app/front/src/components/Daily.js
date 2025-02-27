import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Daily = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <Header>
        <span>Daily</span>
        <HomeButton onClick={() => navigate('/')}>Home</HomeButton>
      </Header>
      <Content>
        <h1>Welcome to the Daily Page</h1>
        <p>Track your daily habits and stay consistent!</p>
      </Content>
    </PageWrapper>
  );
};

export default Daily;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: radial-gradient(125% 125% at 50% 10%, #ff6600 40%, #000 100%);
  color: white;
  text-align: center;
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
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
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
  border: .25em solid rgb(217, 176, 255); /* Light purple glow */
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
    box-shadow: 0 0 1em .25em rgb(217, 176, 255),
                0 0 4em 2em rgba(191, 123, 255, 0.5),
                inset 0 0 .75em .25em rgb(217, 176, 255);
  }

  &:active {
    box-shadow: 0 0 0.6em .25em rgb(217, 176, 255),
                0 0 2.5em 2em rgba(191, 123, 255, 0.5),
                inset 0 0 .5em .25em rgb(217, 176, 255);
  }
`;


const Content = styled.div`
  margin-top: 80px;
  text-align: center;

  h1 {
    font-size: 36px;
    margin-bottom: 20px;
  }

  p {
    font-size: 18px;
  }
`;