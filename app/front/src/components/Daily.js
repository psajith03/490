import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, where } from 'firebase/firestore';
import { auth } from '../firebase';

const Daily = () => {
  const navigate = useNavigate();
  const [dailyTasks, setDailyTasks] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [monthlyTasks, setMonthlyTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [taskType, setTaskType] = useState('daily');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      auth.onAuthStateChanged(user => {
        if (user) {
          setUserId(user.uid);
          fetchTasks(user.uid);
        }
      });
    };
    fetchUser();
  }, []);

  const fetchTasks = async (uid) => {
    if (!uid) return;
    const userTasksRef = collection(db, 'users', uid, 'tasks');
    const q = query(userTasksRef, where('type', 'in', ['daily', 'weekly', 'monthly']));
    const snapshot = await getDocs(q);
    
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDailyTasks(tasks.filter(task => task.type === 'daily'));
    setWeeklyTasks(tasks.filter(task => task.type === 'weekly'));
    setMonthlyTasks(tasks.filter(task => task.type === 'monthly'));
  };

  const addTask = async () => {
    if (!newTask.trim() || !userId) return;
    const userTasksRef = collection(db, 'users', userId, 'tasks');
    
    const docRef = await addDoc(userTasksRef, { text: newTask, completed: false, type: taskType });
    
    const setTaskList = taskType === 'daily' ? setDailyTasks : taskType === 'weekly' ? setWeeklyTasks : setMonthlyTasks;
    setTaskList(prevTasks => [...prevTasks, { id: docRef.id, text: newTask, completed: false, type: taskType }]);
    setNewTask('');
  };

  const toggleTaskCompletion = async (id, type) => {
    if (!userId) return;
    const taskRef = doc(db, 'users', userId, 'tasks', id);
    
    const setTaskList = type === 'daily' ? setDailyTasks : type === 'weekly' ? setWeeklyTasks : setMonthlyTasks;
    setTaskList(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === id) {
          const updatedTask = { ...task, completed: !task.completed };
          updateDoc(taskRef, { completed: updatedTask.completed });
          return updatedTask;
        }
        return task;
      });
      return updatedTasks;
    });
  };

  const deleteTask = async (id, type) => {
    if (!userId) return;
    const taskRef = doc(db, 'users', userId, 'tasks', id);
    await deleteDoc(taskRef);
    
    const setTaskList = type === 'daily' ? setDailyTasks : type === 'weekly' ? setWeeklyTasks : setMonthlyTasks;
    setTaskList(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  return (
    <PageWrapper>
      <Header>
        <span>Daily</span>
        <HomeButton onClick={() => navigate('/')}>Home</HomeButton>
      </Header>
      <Content>
        <TaskInput>
          <input 
            type="text" 
            value={newTask} 
            onChange={(e) => setNewTask(e.target.value)} 
            placeholder="Add a task..." 
          />
          <select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button onClick={addTask}>Add Task</button>
        </TaskInput>
        <TaskWrapper>
          {[{ label: 'Daily Tasks', tasks: dailyTasks, type: 'daily' },
            { label: 'Weekly Tasks', tasks: weeklyTasks, type: 'weekly' },
            { label: 'Monthly Tasks', tasks: monthlyTasks, type: 'monthly' }]
            .map(({ label, tasks, type }) => (
              <TaskBox key={type}>
                <h3>{label}</h3>
                {tasks.map((task) => (
                  <TaskItem key={task.id}>
                    <input 
                      type="checkbox" 
                      checked={task.completed} 
                      onChange={() => toggleTaskCompletion(task.id, type)}
                    />
                    <span>{task.text}</span>
                    <DeleteButton onClick={() => deleteTask(task.id, type)}>✖</DeleteButton>
                  </TaskItem>
                ))}
              </TaskBox>
          ))}
        </TaskWrapper>
      </Content>
    </PageWrapper>
  );
};

export default Daily;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: red;
  font-size: 18px;
  cursor: pointer;
  padding: 0 10px;

  &:hover {
    color: darkred;
  }
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(45deg, #B7E4C7, #FFE066, #74C0FC, #c4a7e7);
  background-size: 400% 400%;
  animation: gradientAnimation 10s ease infinite;
  color: #333;
  text-align: center;

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
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const TaskInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  padding: 0 20px;

  input {
    width: 100%;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }

  select {
    width: 100%;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }

  button {
    width: 100%;
    padding: 10px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      background: #0056b3;
    }
  }

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;

    input {
      width: 60%;
    }

    select {
      width: 20%;
    }

    button {
      width: 20%;
    }
  }
`;

const TaskWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const TaskBox = styled.div`
  background: rgb(0, 0, 0);
  padding: 15px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;

  @media (min-width: 768px) {
    min-width: 250px;
  }
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 5px 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;

  input[type="checkbox"] {
    min-width: 20px;
    height: 20px;
  }

  span {
    flex-grow: 1;
    word-break: break-word;
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
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  h1 {
    font-size: clamp(24px, 5vw, 36px);
    margin-bottom: 20px;
  }

  p {
    font-size: clamp(14px, 3vw, 18px);
  }
`;