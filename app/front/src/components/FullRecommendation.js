import React, { useState } from "react";
import axios from "axios";

const FullRecommendation = () => {
  const [splitType, setSplitType] = useState("");
  const [workoutPlan, setWorkoutPlan] = useState({});

  const fetchWorkoutPlan = async () => {
    if (!splitType) {
      alert("Please select a workout split.");
      return;
    }

    try {
      const response = await axios.get("/api/full_recommendation", {
        params: { split_type: splitType },
      });
      setWorkoutPlan(response.data.workout_plan);
    } catch (error) {
      console.error("Error fetching workout plan:", error.message);
    }
  };

  return (
    <div>
      <h2>Generate Your Full Workout Plan</h2>

      <select value={splitType} onChange={(e) => setSplitType(e.target.value)}>
        <option value="">Select a Split</option>
        <option value="total_body">Total Body Split</option>
        <option value="upper_lower">Upper vs. Lower Split</option>
        <option value="push_pull_legs">Push vs. Pull vs. Legs Split</option>
        <option value="bro_split">Bro Split</option>
      </select>

      <button onClick={fetchWorkoutPlan}>Generate Plan</button>

      <h3>Your Workout Plan:</h3>
      {Object.entries(workoutPlan).map(([day, exercises]) => (
        <div key={day}>
          <h4>{day.toUpperCase()}</h4>
          <ul>
            {exercises.map((exercise, index) => (
              <li key={index}>{exercise}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default FullRecommendation;