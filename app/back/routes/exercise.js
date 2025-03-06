const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");

const router = express.Router();
const PYTHON_API = "http://127.0.0.1:5001";

let localExercises = [];

const loadLocalExercises = () => {
  const csvPath = path.join(__dirname, "../data", "megaGymDataset.csv");
  console.log(`📂 Loading exercises from: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  fs.createReadStream(csvPath)
    .pipe(csvParser())
    .on("data", (row) => {
      localExercises.push({
        name: row.Title.trim(),
        instructions: row.Desc?.trim() || "No instructions available",
        target: row.BodyPart?.trim() || "Unknown",
        equipment: row.Equipment?.trim() || "None",
      });
    })
    .on("end", () => {
      console.log(`Successfully loaded ${localExercises.length} exercises from CSV`);
    })
    .on("error", (error) => {
      console.error("Error loading CSV:", error.message);
    });
};
loadLocalExercises();

const findExerciseLocally = (name) => {
  console.log(`🔎 Searching for exercise: "${name}" in local database.`);
  return localExercises.find(
    (exercise) => exercise.name.toLowerCase() === name.toLowerCase().trim()
  );
};

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

router.get("/exercise/:name", async (req, res) => {
  const { name } = req.params;
  console.log(`📩 Received request for exercise: "${name}"`);

  try {
    console.log("🌐 Attempting API fetch from ExerciseDB...");
    const response = await axios.get(`${process.env.API_URL}/${encodeURIComponent(name)}`, {
      headers: {
        "X-RapidAPI-Key": process.env.API_KEY,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
      params: { limit: 1 },
    });

    if (response.data && response.data.length > 0) {
      const exercise = response.data[0];
      console.log("✅ Found exercise in ExerciseDB:", exercise.name);

      return res.json({
        name: exercise.name,
        gifUrl: exercise.gifUrl && exercise.gifUrl.includes("http") ? exercise.gifUrl : null,
        target: exercise.target,
        equipment: exercise.equipment || "N/A",
        instructions: exercise.instructions || ["No instructions available"],
      });
    } else {
      console.warn("ExerciseDB API returned no results.");
    }
  } catch (error) {
    console.error("ExerciseDB API request failed:", error.message);
  }

  console.log("🔎 Falling back to local CSV database...");
  const localExercise = findExerciseLocally(name);

  if (localExercise) {
    console.log("✅ Found exercise in local database:", localExercise.name);
    return res.json({
      name: localExercise.name,
      gifUrl: null,  // No GIF available in CSV
      target: localExercise.target || "N/A",
      equipment: localExercise.equipment || "N/A",
      instructions: [localExercise.instructions || "No instructions available"],
    });
  }

  console.error("Exercise not found in both ExerciseDB and local database.");
  return res.status(404).json({
    error: "Exercise not found",
    name,
    target: "N/A",
    equipment: "N/A",
    instructions: ["No instructions available"],
  });
});


module.exports = router;
