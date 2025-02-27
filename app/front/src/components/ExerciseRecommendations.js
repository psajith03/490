import React, { useState } from "react";
import axios from "axios";

const ExerciseRecommendations = () => {
  const [exercise, setExercise] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get("/api/recommend", {
        params: { exercise, top_n: 5 },
      });
      setRecommendations(response.data.recommended);
    } catch (error) {
      console.error("Error fetching recommendations:", error.message);
    }
  };

  return (
    <div>
      <h2>Find Similar Exercises</h2>
      <input
        type="text"
        placeholder="Enter exercise name"
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
      />
      <button onClick={fetchRecommendations}>Get Recommendations</button>

      <h3>Recommended Exercises:</h3>
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExerciseRecommendations;
