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
        <h1>Track Your Sleep</h1>
        <p>Log your sleep to monitor debt & optimize rest.</p>

        <SleepInputContainer>
          <label>Sleep Time:</label>
          <input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} />

          <label>Wake Time:</label>
          <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />

          <button onClick={logSleep}>Log Sleep</button>
        </SleepInputContainer>

        <DebtCounter>
          <h2>Sleep Debt: {sleepDebt} hours</h2>
        </DebtCounter>

        <HistoryContainer>
          <h3>Sleep Log (Last 14 Days)</h3>
          {loading ? <p>Loading...</p> : (
            sleepHistory.length > 0 ? (
              sleepHistory.map((entry) => (
                <SleepEntry key={entry.id}>
                  <p>{entry.date}: {entry.sleepTime} - {entry.wakeTime} ({entry.duration} hrs)</p>
                  <button onClick={() => deleteSleepEntry(entry.id)}>❌</button>
                </SleepEntry>
              ))
            ) : (
              <p>No sleep data logged yet.</p>
            )
          )}
        </HistoryContainer>
      </Content>
    </PageWrapper>
  );
};

export default Sleep;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: radial-gradient(125% 125% at 50% 10%, rgb(97, 23, 120) 40%, #000 100%);
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
`;

const HomeButton = styled.button`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 16px;
`;

const Content = styled.div`
  margin-top: 80px;
  text-align: center;
`;

const SleepInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DebtCounter = styled.div`
  margin-top: 20px;
  font-size: 20px;
  font-weight: bold;
`;

const HistoryContainer = styled.div`
  margin-top: 20px;
  text-align: left;
`;

const SleepEntry = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 5px 0;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 8px;
`;
