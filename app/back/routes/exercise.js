const express = require("express");
const axios = require("axios");

const router = express.Router();
const PYTHON_API = "http://127.0.0.1:5001";
const EXERCISE_DB_API_URL = "https://exercisedb.p.rapidapi.com/exercises/name";
const API_KEY = "b6af6401c7msh507d1ef761e52bep14d56ajsn296ec1db7d38"; // Replace with your API key

// Fetch full workout plan
router.get("/full_recommendation", async (req, res) => {
  const { split_type } = req.query;

  if (!split_type) {
    return res.status(400).json({ error: "Missing split type parameter" });
  }

  try {
    const response = await axios.get(`${PYTHON_API}/full_recommendation`, {
      params: { split_type },
    });

    if (response.status !== 200) {
      console.error(`Error from Python API:`, response.data);
      return res.status(500).json({ error: "Failed to fetch full workout plan" });
    }

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching full workout plan:", error.message);
    res.status(500).json({ error: "Failed to fetch full workout plan" });
  }
});

// Fetch exercise details from ExerciseDB
router.get("/exercise/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const response = await axios.get(`${EXERCISE_DB_API_URL}/${encodeURIComponent(name)}`, {
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
      params: {
        limit: 1, // Fetch only one exercise
      },
    });

    if (!response.data || !response.data.length) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    const exercise = response.data[0]; // Take the first match

    res.json({
      name: exercise.name,
      gifUrl: exercise.gifUrl,
      target: exercise.target,
      secondaryMuscles: exercise.secondaryMuscles || [],
      equipment: exercise.equipment || "N/A",
      instructions: exercise.instructions || ["No instructions available"],
    });
  } catch (error) {
    console.error("Error fetching exercise:", error.message);
    res.status(500).json({ error: "Failed to fetch exercise details" });
  }
});

module.exports = router;
