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
  console.log(`Loading exercises from: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  fs.createReadStream(csvPath)
    .pipe(csvParser())
    .on("data", (row) => {
      console.log("Raw row data:", row);
      if (!row.Title) {
        console.error("Row missing Title:", row);
        return;
      }
      localExercises.push({
        Title: row.Title.trim(),
        Desc: row.Desc?.trim() || "No instructions available",
        BodyPart: row.BodyPart?.trim() || "Unknown",
        Equipment: row.Equipment?.trim() || "None",
      });
    })
    .on("end", () => {
      console.log(`Successfully loaded ${localExercises.length} exercises from CSV`);
      console.log("First few exercises:", localExercises.slice(0, 3));
      const testSearch = "crunch";
      const testMatches = localExercises
        .filter(exercise => exercise.Title.toLowerCase().includes(testSearch))
        .map(exercise => exercise.Title);
      console.log(`Test search for "${testSearch}" found matches:`, testMatches);
    })
    .on("error", (error) => {
      console.error("Error loading CSV:", error.message);
    });
};

loadLocalExercises();

const findExerciseLocally = (name) => {
  console.log(`Searching for exercise: "${name}" in local database.`);
  return localExercises.find(
    (exercise) => exercise.Title.toLowerCase() === name.toLowerCase().trim()
  );
};

router.get("/full_recommendation", async (req, res) => {
  const { split_type, equipment, exercise_type } = req.query;

  if (!split_type) {
    return res.status(400).json({ error: "Missing split type parameter" });
  }

  try {
    console.log(`Forwarding request to Python API with params:`, req.query);
    const response = await axios.get(`${PYTHON_API}/full_recommendation`, {
      params: req.query
    });

    if (response.status !== 200) {
      console.error(`Error from Python API:`, response.data);
      return res.status(500).json({ error: "Failed to fetch full workout plan" });
    }

    console.log(`Received response from Python API with ${Object.keys(response.data.workout_plan || {}).length} categories`);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching full workout plan:", error.message);
    res.status(500).json({ error: "Failed to fetch full workout plan" });
  }
});

router.get("/search", (req, res) => {
  const { query } = req.query;
  
  if (!query || query.length < 2) {
    return res.status(400).json({ error: "Query must be at least 2 characters long" });
  }

  try {
    const searchTerm = query.toLowerCase();
    console.log(`Searching for: "${searchTerm}" in ${localExercises.length} exercises`);
    
    const matches = localExercises
      .filter(exercise => exercise.Title.toLowerCase().includes(searchTerm))
      .map(exercise => exercise.Title)
      .slice(0, 10);

    console.log(`Found ${matches.length} matches for query: ${query}`);
    console.log("Matches:", matches);
    
    res.json(matches);
  } catch (error) {
    console.error("Error in search endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:name", async (req, res) => {
  const { name } = req.params;
  console.log(`Received request for exercise: "${name}"`);

  try {
    console.log("Attempting API fetch from ExerciseDB...");
    const response = await axios.get(`${process.env.API_URL}/${encodeURIComponent(name)}`, {
      headers: {
        "X-RapidAPI-Key": process.env.API_KEY,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
      params: { limit: 1 },
    });

    if (response.data && response.data.length > 0) {
      const exercise = response.data[0];
      console.log("Found exercise in ExerciseDB:", exercise.name);

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

  console.log("Falling back to local CSV database...");
  const localExercise = findExerciseLocally(name);

  if (localExercise) {
    console.log("Found exercise in local database:", localExercise.Title);
    return res.json({
      name: localExercise.Title,
      gifUrl: null,
      target: localExercise.BodyPart || "N/A",
      equipment: localExercise.Equipment || "N/A",
      instructions: [localExercise.Desc || "No instructions available"],
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
