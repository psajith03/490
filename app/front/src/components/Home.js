// app/front/src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import styled from 'styled-components';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <HomeWrapper>
      <h1>Welcome to Your Fitness Journey!</h1>
      <p>You're successfully logged in.</p>
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </HomeWrapper>
  );
};

const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;

  h1 {
    color: #323232;
    margin-bottom: 20px;
  }

  .logout-btn {
    margin-top: 20px;
    padding: 10px 20px;
    border: 2px solid #323232;
    border-radius: 5px;
    background-color: white;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 4px 4px #323232;
    transition: all 0.2s ease;

    &:hover {
      transform: translate(2px, 2px);
      box-shadow: 2px 2px #323232;
    }
  }
`;

export default Home; 