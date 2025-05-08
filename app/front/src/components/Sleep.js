import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { auth } from '../firebase';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const db = getFirestore();

const Sleep = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [sleepHistory, setSleepHistory] = useState([]);
  const [sleepDebt, setSleepDebt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [goalHours, setGoalHours] = useState(8);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
        fetchSleepHistory(user.uid);
      } else {
        setUserId(null);
        setSleepHistory([]);
        setSleepDebt(0);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchSleepHistory = async (uid) => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users", uid, "sleep_logs"));
      const logs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSleepHistory(logs);
      calculateTotalSleepDebt(logs);
    } catch (error) {
      console.error("🔥 Firestore Fetch Error:", error);
    }
    setLoading(false);
  };

  const calculateTotalSleepDebt = (logs) => {
    const recentLogs = logs.slice(-14);
    const totalDebt = recentLogs.reduce((acc, log) => {
      const actualSleep = parseFloat(log.duration);
      const debt = goalHours - actualSleep;
      return acc + (debt > 0 ? debt : 0);
    }, 0);
    setSleepDebt(totalDebt.toFixed(2));
  };

  const calculateSleepMetrics = () => {
    if (!sleepTime || !wakeTime) return null;
    const sleep = new Date(`1970-01-01T${sleepTime}:00`);
    const wake = new Date(`1970-01-01T${wakeTime}:00`);
    if (wake < sleep) wake.setDate(wake.getDate() + 1);
    return ((wake - sleep) / (1000 * 60 * 60)).toFixed(2);
  };

  const logSleep = async () => {
    if (!sleepTime || !wakeTime) return alert("Enter both sleep & wake times.");
    if (!userId) return alert("User not logged in. Please log in first.");

    const duration = calculateSleepMetrics();
    if (!duration) return;

    const newLog = {
      date: new Date().toLocaleDateString(),
      sleepTime,
      wakeTime,
      duration,
    };

    try {
      const docRef = await addDoc(collection(db, "users", userId, "sleep_logs"), newLog);
      const updatedHistory = [...sleepHistory, { id: docRef.id, ...newLog }];
      setSleepHistory(updatedHistory);
      calculateTotalSleepDebt(updatedHistory);
      setSleepTime('');
      setWakeTime('');
    } catch (error) {
      console.error("🔥 Firestore Write Error:", error);
      alert("Error logging sleep. Please check Firestore setup.");
    }
  };

  const deleteSleepEntry = async (id) => {
    try {
      await deleteDoc(doc(db, "users", userId, "sleep_logs", id));
      const updatedHistory = sleepHistory.filter(entry => entry.id !== id);
      setSleepHistory(updatedHistory);
      calculateTotalSleepDebt(updatedHistory);
    } catch (error) {
      console.error("🔥 Firestore Delete Error:", error);
    }
  };

  return (
    <PageWrapper>
      <Header>
        <span>Sleep Tracker</span>
        <HomeButton onClick={() => navigate('/')}>Home</HomeButton>
      </Header>
      <Content>
        <TitleSection>
          <h1>Sleep Analytics</h1>
          <p>Monitor your sleep patterns and optimize your rest</p>
        </TitleSection>

        <DashboardContainer>
          <SleepInputCard>
            <h2>Log Sleep</h2>
            <TimeInputGroup>
              <TimeInput>
                <label>Sleep Time</label>
                <input 
                  type="time" 
                  value={sleepTime} 
                  onChange={(e) => setSleepTime(e.target.value)}
                />
              </TimeInput>
              <TimeInput>
                <label>Wake Time</label>
                <input 
                  type="time" 
                  value={wakeTime} 
                  onChange={(e) => setWakeTime(e.target.value)}
                />
              </TimeInput>
            </TimeInputGroup>
            <LogButton onClick={logSleep}>Log Sleep</LogButton>
          </SleepInputCard>

          <StatsCard>
            <h2>Sleep Statistics</h2>
            <StatItem>
              <StatLabel>Sleep Debt</StatLabel>
              <StatValue>{sleepDebt} hours</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Goal Hours</StatLabel>
              <StatValue>{goalHours} hours</StatValue>
            </StatItem>
          </StatsCard>
        </DashboardContainer>

        <HistorySection>
          <h2>Sleep History</h2>
          <HistoryContainer>
            {loading ? (
              <LoadingSpinner>Loading...</LoadingSpinner>
            ) : sleepHistory.length > 0 ? (
              sleepHistory.map((entry) => (
                <SleepEntry key={entry.id}>
                  <EntryInfo>
                    <EntryDate>{entry.date}</EntryDate>
                    <EntryTime>{entry.sleepTime} - {entry.wakeTime}</EntryTime>
                    <EntryDuration>{entry.duration} hours</EntryDuration>
                  </EntryInfo>
                  <DeleteButton onClick={() => deleteSleepEntry(entry.id)}>
                    <span>×</span>
                  </DeleteButton>
                </SleepEntry>
              ))
            ) : (
              <EmptyState>No sleep data logged yet</EmptyState>
            )}
          </HistoryContainer>
        </HistorySection>
      </Content>
    </PageWrapper>
  );
};

export default Sleep;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
`;

const Header = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
`;

const HomeButton = styled.button`
  position: absolute;
  right: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Content = styled.div`
  padding: 80px 20px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const TitleSection = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    background: linear-gradient(45deg, #00b4d8, #90e0ef);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: #90e0ef;
    font-size: 1.1rem;
  }
`;

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
`;

const SleepInputCard = styled(Card)`
  h2 {
    color: #90e0ef;
    margin-bottom: 20px;
  }
`;

const TimeInputGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
`;

const TimeInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    color: #90e0ef;
    font-size: 0.9rem;
  }

  input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 10px;
    color: white;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: #00b4d8;
    }
  }
`;

const LogButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(45deg, #00b4d8, #90e0ef);
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 180, 216, 0.4);
  }
`;

const StatsCard = styled(Card)`
  h2 {
    color: #90e0ef;
    margin-bottom: 20px;
  }
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: #90e0ef;
`;

const StatValue = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
`;

const HistorySection = styled.div`
  h2 {
    color: #90e0ef;
    margin-bottom: 20px;
  }
`;

const HistoryContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SleepEntry = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const EntryInfo = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const EntryDate = styled.span`
  color: #90e0ef;
  font-weight: bold;
`;

const EntryTime = styled.span`
  color: white;
`;

const EntryDuration = styled.span`
  color: #00b4d8;
  font-weight: bold;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 10px;
  transition: all 0.3s ease;

  &:hover {
    color: #ff8787;
    transform: scale(1.1);
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  color: #90e0ef;
  padding: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #90e0ef;
  padding: 20px;
  font-style: italic;
`;
