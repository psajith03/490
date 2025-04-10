import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import styled from 'styled-components';

const Home = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const idToken = await auth.currentUser.getIdToken();
        const API_URL = "http://localhost:5000";

        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setName(userData.name || 'Friend');
        } else {
          console.error("Failed to fetch user data");
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (!name) return;

    let i = 0;
    const fullText = `Welcome ${name}!`;
    setDisplayText("");

    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, [name]);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <>
      <Header>
        <span>Habit</span>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </Header>
      <HomeWrapper>
        <Frame>
          <LeftBar onClick={() => navigate('/daily')}>DAILY</LeftBar>
          <TopBar onClick={() => navigate('/exercise-home')}>EXERCISE</TopBar> 
          <RightBar onClick={() => navigate('/sleep')}>SLEEP</RightBar>
          <BottomBar onClick={() => navigate('/dietHome')}>DIET</BottomBar>

          <CenterContent>
            <h2>{displayText}</h2>
          </CenterContent>
        </Frame>
      </HomeWrapper>
    </>
  );
};

const glowEffect = `
  border: .25em solid var(--glow-color);
  padding: 1em;
  color: color-mix(in srgb, var(--glow-color) 70%, white);
  font-size: 20px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;

  &:after {
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
    color: color-mix(in srgb, var(--glow-color) 70%, white);
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

const HomeWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(45deg, #B7E4C7, #FFE066, #74C0FC, #c4a7e7);
  background-size: 400% 400%;
  animation: gradientAnimation 10s ease infinite;
  overflow: hidden;

  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: inherit;
    z-index: -1;
  }
`;

const Frame = styled.div`
  position: relative;
  width: min(400px, 90vw);
  height: min(400px, 90vw);
  transform: scale(1.4); 
  transform-origin: center;

  @media (max-width: 768px) {
    transform: scale(1);
    width: 90vw;
    height: 90vw;
  }
`;

const LeftBar = styled.div`
  ${glowEffect}
  --glow-color: rgb(255, 165, 0); 
  --glow-spread-color: rgba(255, 140, 0, 0.8);
  --enhanced-glow-color: rgb(255, 200, 100);
  --btn-color: rgb(150, 80, 0);

  position: absolute;
  top: 20%;
  left: 0;
  width: 15%;
  height: 60%;
  writing-mode: vertical-lr;
  text-orientation: upright;
  font-size: clamp(14px, 3vw, 20px);

  @media (max-width: 768px) {
    width: 20%;
    height: 50%;
  }
`;

const TopBar = styled.div`
  ${glowEffect}
  --glow-color: rgb(255, 0, 102); 
  --glow-spread-color: rgba(255, 50, 130, 0.8);
  --enhanced-glow-color: rgb(255, 150, 180);
  --btn-color: rgb(150, 0, 60);

  position: absolute;
  top: 0;
  left: 20%;
  width: 60%;
  height: 20%;
  font-size: clamp(14px, 3vw, 20px);

  @media (max-width: 768px) {
    left: 20%;
    width: 60%;
    height: 15%;
  }
`;

const RightBar = styled.div`
  ${glowEffect}
  --glow-color: rgb(75, 0, 130); 
  --glow-spread-color: rgba(110, 0, 180, 0.8);
  --enhanced-glow-color: rgb(190, 100, 255);
  --btn-color: rgb(50, 0, 90);

  position: absolute;
  top: 20%;
  right: 0;
  width: 15%;
  height: 60%;
  writing-mode: vertical-lr;
  text-orientation: upright;
  font-size: clamp(14px, 3vw, 20px);

  @media (max-width: 768px) {
    width: 20%;
    height: 50%;
  }
`;

const BottomBar = styled.div`
  ${glowEffect}
  --glow-color: rgb(166, 0, 100); 
  --glow-spread-color: rgba(180, 0, 120, 0.8);
  --enhanced-glow-color: rgb(230, 100, 160);
  --btn-color: rgb(100, 0, 60);

  position: absolute;
  bottom: 0;
  left: 20%;
  width: 60%;
  height: 20%;
  font-size: clamp(14px, 3vw, 20px);

  @media (max-width: 768px) {
    left: 20%;
    width: 60%;
    height: 15%;
  }
`;

const CenterContent = styled.div`
  position: absolute;
  top: 20%;
  bottom: 20%;
  left: 20%;
  right: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 10;

  h2 {
    font-size: clamp(24px, 5vw, 45px);
    font-weight: bold;
    color: white;
    text-shadow: 3px 3px 6px rgba(237, 59, 178, 0.5);
    margin-bottom: 20px;
    transition: all 0.3s ease-in-out;
  }

  p {
    font-size: clamp(14px, 3vw, 20px);
    color: white;
    margin-bottom: 20px;
  }
`;

const Header = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #000; 
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 34px;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(178, 35, 173, 0.1);

  span {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const LogoutButton = styled.button`
  ${glowEffect}
  font-size: 14px;
  padding: 8px 16px;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
`;

export default Home;
