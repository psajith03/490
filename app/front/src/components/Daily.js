import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, where } from 'firebase/firestore';
import { auth } from '../firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Daily = () => {
  const navigate = useNavigate();
  const [dailyTasks, setDailyTasks] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [monthlyTasks, setMonthlyTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [taskType, setTaskType] = useState('daily');
  const [userId, setUserId] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=39.728493&longitude=-121.837479&hourly=temperature_2m,relative_humidity_2m,precipitation,rain,showers,wind_speed_10m,wind_direction_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America/Los_Angeles'
      );
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const celsiusToFahrenheit = (celsius) => {
    return (celsius * 9/5 + 32).toFixed(1);
  };

  const getMinMaxTemp = (temperatures) => {
    const min = Math.min(...temperatures);
    const max = Math.max(...temperatures);
    const range = max - min;
    return {
      min: min - (range * 0.1),
      max: max + (range * 0.1)
    };
  };

  const TaskList = ({ tasks, type, title }) => (
    <TaskColumn>
      <TaskColumnHeader>{title}</TaskColumnHeader>
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <TaskCard key={task.id} completed={task.completed}>
            <TaskCheckbox
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTaskCompletion(task.id, type)}
            />
            <TaskText completed={task.completed}>{task.text}</TaskText>
            <DeleteButton onClick={() => deleteTask(task.id, type)}>
              <DeleteIcon>×</DeleteIcon>
            </DeleteButton>
          </TaskCard>
        ))
      ) : (
        <EmptyState>
          <EmptyIcon>📝</EmptyIcon>
          <EmptyText>No {type} tasks yet</EmptyText>
          <EmptySubtext>Add a task to get started!</EmptySubtext>
        </EmptyState>
      )}
    </TaskColumn>
  );

  const WeatherGraph = ({ data }) => {
    if (!data || !data.hourly) return null;

    const chartData = data.hourly.time.map((time, index) => ({
      time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: data.hourly.temperature_2m[index],
      humidity: data.hourly.relative_humidity_2m[index],
      windSpeed: data.hourly.wind_speed_10m[index],
      precipitation: data.hourly.precipitation[index]
    })).slice(0, 24);

    return (
      <GraphContainer>
        <GraphTitle>24-Hour Weather Forecast</GraphTitle>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#8884d8" name="Temperature (°F)" />
            <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#82ca9d" name="Humidity (%)" />
            <Line yAxisId="right" type="monotone" dataKey="windSpeed" stroke="#ffc658" name="Wind Speed (mph)" />
            <Line yAxisId="right" type="monotone" dataKey="precipitation" stroke="#ff7300" name="Precipitation (in)" />
          </LineChart>
        </ResponsiveContainer>
      </GraphContainer>
    );
  };

  return (
    <PageWrapper>
      <Header>
        <span>Daily</span>
        <HomeButton onClick={() => navigate('/')}>Home</HomeButton>
      </Header>
      <Content>

        {loading ? (
          <WeatherSection>
            <WeatherLoading>Loading weather data...</WeatherLoading>
          </WeatherSection>
        ) : weatherData && weatherData.hourly ? (
          <>
            <WeatherSection>
              <WeatherTitle>Current Weather</WeatherTitle>
              <WeatherInfo>
                <WeatherDetail>
                  <WeatherLabel>Temperature</WeatherLabel>
                  <WeatherValue>{weatherData.hourly.temperature_2m[0]}°F</WeatherValue>
                </WeatherDetail>
                <WeatherDetail>
                  <WeatherLabel>Humidity</WeatherLabel>
                  <WeatherValue>{weatherData.hourly.relative_humidity_2m[0]}%</WeatherValue>
                </WeatherDetail>
                <WeatherDetail>
                  <WeatherLabel>Wind</WeatherLabel>
                  <WeatherValue>{weatherData.hourly.wind_speed_10m[0]} mph</WeatherValue>
                </WeatherDetail>
                <WeatherDetail>
                  <WeatherLabel>Precipitation</WeatherLabel>
                  <WeatherValue>{weatherData.hourly.precipitation[0]} in</WeatherValue>
                </WeatherDetail>
              </WeatherInfo>
            </WeatherSection>
            <WeatherGraph data={weatherData} />
          </>
        ) : (
          <WeatherSection>
            <WeatherError>Unable to load weather data</WeatherError>
          </WeatherSection>
        )}

        <TaskInputSection>
          <InputContainer>
            <StyledInput
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <TypeSelect value={taskType} onChange={(e) => setTaskType(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </TypeSelect>
            <AddButton onClick={addTask}>Add Task</AddButton>
          </InputContainer>
        </TaskInputSection>

        <TaskGrid>
          <TaskList tasks={dailyTasks} type="daily" title="Daily Tasks" />
          <TaskList tasks={weeklyTasks} type="weekly" title="Weekly Tasks" />
          <TaskList tasks={monthlyTasks} type="monthly" title="Monthly Tasks" />
        </TaskGrid>
      </Content>
    </PageWrapper>
  );
};

export default Daily;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(45deg, #B7E4C7, #FFE066, #74C0FC, #c4a7e7);
  background-size: 400% 400%;
  animation: gradientAnimation 10s ease infinite;
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 20px;
  overflow-x: auto;
`;

const TitleSection = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    font-size: 2.5em;
    color: #333;
    margin-bottom: 10px;
  }
  
  p {
    color: #666;
    font-size: 1.1em;
  }
`;

const TaskInputSection = styled.div`
  margin-bottom: 30px;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #74C0FC;
    box-shadow: 0 0 10px rgba(116, 192, 252, 0.3);
  }
`;

const TypeSelect = styled.select`
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #74C0FC;
  }
`;

const AddButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: #74C0FC;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #5BA4E5;
    transform: translateY(-2px);
  }
`;

const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
  width: 100%;
  min-width: 900px;
  overflow-x: auto;
  padding: 10px 0;

  @media (max-width: 1200px) {
    min-width: 800px;
  }

  @media (max-width: 900px) {
    min-width: 700px;
  }
`;

const TaskColumn = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 400px;
  min-width: 250px;
  flex: 1;
`;

const TaskColumnHeader = styled.h2`
  font-size: 1.5em;
  color: #333;
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(116, 192, 252, 0.3);
  text-align: center;
`;

const TaskCard = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  opacity: ${props => props.completed ? 0.7 : 1};

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const TaskCheckbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const TaskText = styled.span`
  flex: 1;
  font-size: 16px;
  color: #333;
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  opacity: ${props => props.completed ? 0.7 : 1};
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    color: #ff4757;
    transform: scale(1.1);
  }
`;

const DeleteIcon = styled.span`
  font-size: 24px;
  line-height: 1;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 15px;
`;

const EmptyText = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const EmptySubtext = styled.div`
  font-size: 16px;
  color: #666;
`;

const WeatherSection = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const WeatherLoading = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const WeatherError = styled.div`
  text-align: center;
  padding: 20px;
  color: #ff6b6b;
`;

const CurrentWeather = styled.div`
  margin-bottom: 20px;
`;

const WeatherTitle = styled.h2`
  font-size: 1.5em;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
`;

const WeatherInfo = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 20px;
`;

const WeatherDetail = styled.div`
  text-align: center;
`;

const WeatherLabel = styled.div`
  font-size: 0.9em;
  color: #666;
  margin-bottom: 5px;
`;

const WeatherValue = styled.div`
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
`;

const WeatherGraph = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const GraphTitle = styled.h3`
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const GraphContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;