const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const { authenticate } = require('../routes/auth');

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

router.get("/search", async (req, res) => {
  try {
    const query = req.query.query?.toLowerCase();
    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Query must be at least 2 characters long" });
    }

    console.log("Searching for exercises matching:", query);
    const matches = localExercises
      .filter(exercise => exercise.Title.toLowerCase().includes(query))
      .map(exercise => exercise.Title)
      .sort((a, b) => a.length - b.length);

    console.log(`Found ${matches.length} matches`);
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
    console.log("Searching in local database...");
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

    console.log("Exercise not found locally, trying ExerciseDB API...");
    const response = await axios.get(`${process.env.API_URL}/${encodeURIComponent(name.toLowerCase())}`, {
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
    }
    
    console.log("Exercise not found in any database");
    return res.json({
      name: name,
      gifUrl: null,
      target: "N/A",
      equipment: "N/A",
      instructions: ["No details available for this exercise."],
    });

  } catch (error) {
    console.error("Error fetching exercise details:", error.message);
    return res.json({
      name: name,
      gifUrl: null,
      target: "N/A",
      equipment: "N/A",
      instructions: ["No details available for this exercise."],
    });
  }
});

router.post("/ai-recommendations", authenticate, async (req, res) => {
  try {
    const { savedWorkouts, ratedWorkouts } = req.body;

    if (!Array.isArray(savedWorkouts)) {
      return res.status(400).json({ error: "Invalid saved workouts data" });
    }

    const workoutPatterns = analyzeWorkoutPatterns(savedWorkouts, ratedWorkouts || []);
    const recommendedExercises = generateExerciseRecommendations(workoutPatterns);
    const preferredSplitTypes = analyzePreferredSplitTypes(savedWorkouts);
    const suggestions = generateSuggestions(workoutPatterns, preferredSplitTypes);

    res.json({
      recommendedExercises,
      preferredSplitTypes,
      suggestions
    });
  } catch (error) {
    console.error("Error generating AI recommendations:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

const analyzeWorkoutPatterns = (savedWorkouts, ratedWorkouts) => {
  const patterns = {
    exerciseFrequency: {},
    bodyPartFocus: {},
    equipmentUsage: {},
    ratingPatterns: {}
  };

  savedWorkouts.forEach(workout => {
    if (workout.exercises) {
      Object.entries(workout.exercises).forEach(([category, exercises]) => {
        if (Array.isArray(exercises)) {
          exercises.forEach(exerciseName => {
            if (typeof exerciseName === 'string') {
              patterns.exerciseFrequency[exerciseName] = (patterns.exerciseFrequency[exerciseName] || 0) + 1;
              const exerciseData = localExercises.find(e => e.Title.toLowerCase() === exerciseName.toLowerCase());
              if (exerciseData) {
                patterns.bodyPartFocus[exerciseData.BodyPart] = (patterns.bodyPartFocus[exerciseData.BodyPart] || 0) + 1;
                patterns.equipmentUsage[exerciseData.Equipment] = (patterns.equipmentUsage[exerciseData.Equipment] || 0) + 1;
              }
            }
          });
        }
      });
    }
  });

  ratedWorkouts.forEach(workout => {
    if (workout.ratings) {
      Object.entries(workout.ratings).forEach(([exerciseName, rating]) => {
        if (typeof exerciseName === 'string' && typeof rating === 'number') {
          if (!patterns.ratingPatterns[exerciseName]) {
            patterns.ratingPatterns[exerciseName] = {
              totalRating: 0,
              count: 0
            };
          }
          patterns.ratingPatterns[exerciseName].totalRating += rating;
          patterns.ratingPatterns[exerciseName].count += 1;
        }
      });
    }
  });

  return patterns;
};

const generateExerciseRecommendations = (patterns) => {
  const recommendations = [];
  const minConfidenceScore = 60;

  const topRatedExercises = Object.entries(patterns.ratingPatterns)
    .filter(([_, data]) => data.count > 0)
    .map(([exerciseName, data]) => ({
      name: exerciseName,
      averageRating: data.totalRating / data.count
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 5);

  const frequentExercises = Object.entries(patterns.exerciseFrequency)
    .map(([exerciseName, frequency]) => ({
      name: exerciseName,
      frequency
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  const allExercises = [...topRatedExercises, ...frequentExercises];
  const uniqueExercises = new Map();

  allExercises.forEach(exercise => {
    if (!uniqueExercises.has(exercise.name)) {
      const exerciseData = localExercises.find(e => e.Title.toLowerCase() === exercise.name.toLowerCase());
      if (exerciseData) {
        const confidenceScore = calculateConfidenceScore(exercise.name, patterns);
        if (confidenceScore >= minConfidenceScore) {
          uniqueExercises.set(exercise.name, {
            name: exercise.name,
            target: exerciseData.BodyPart,
            equipment: exerciseData.Equipment,
            confidenceScore
          });
        }
      }
    }
  });

  return Array.from(uniqueExercises.values());
};

const calculateConfidenceScore = (exerciseName, patterns) => {
  let score = 0;
  const maxScore = 100;

  const frequency = patterns.exerciseFrequency[exerciseName] || 0;
  score += Math.min(frequency * 10, 40);

  const ratingData = patterns.ratingPatterns[exerciseName];
  if (ratingData) {
    const averageRating = ratingData.totalRating / ratingData.count;
    score += (averageRating / 5) * 40;
  }

  const exerciseData = localExercises.find(e => e.Title.toLowerCase() === exerciseName.toLowerCase());
  if (exerciseData && exerciseData.Equipment.toLowerCase() === 'none') {
    score += 20;
  }

  return Math.min(Math.round(score), maxScore);
};

const analyzePreferredSplitTypes = (savedWorkouts) => {
  const splitTypeCounts = {};
  let totalWorkouts = 0;

  savedWorkouts.forEach(workout => {
    if (workout.splitType) {
      splitTypeCounts[workout.splitType] = (splitTypeCounts[workout.splitType] || 0) + 1;
      totalWorkouts++;
    }
  });

  return Object.entries(splitTypeCounts)
    .map(([name, count]) => ({
      name,
      score: Math.round((count / totalWorkouts) * 100)
    }))
    .sort((a, b) => b.score - a.score);
};

const generateSuggestions = (patterns, preferredSplitTypes) => {
  const suggestions = [];

  const bodyPartEntries = Object.entries(patterns.bodyPartFocus)
    .sort((a, b) => b[1] - a[1]);
  
  if (bodyPartEntries.length > 0) {
    const mostFocused = bodyPartEntries[0][0];
    const leastFocused = bodyPartEntries[bodyPartEntries.length - 1][0];
    
    suggestions.push(`You frequently target ${mostFocused}. Consider adding more ${leastFocused} exercises for better balance.`);
  }

  const equipmentEntries = Object.entries(patterns.equipmentUsage)
    .sort((a, b) => b[1] - a[1]);
  
  if (equipmentEntries.length > 0) {
    const mostUsed = equipmentEntries[0][0];
    if (mostUsed.toLowerCase() === 'none') {
      suggestions.push('You primarily do bodyweight exercises. Consider incorporating some equipment-based exercises for variety.');
    } else {
      suggestions.push(`You frequently use ${mostUsed}. Try mixing in some bodyweight exercises for a different challenge.`);
    }
  }

  if (preferredSplitTypes.length > 0) {
    const topSplit = preferredSplitTypes[0];
    suggestions.push(`Your preferred split type is ${topSplit.name}. Consider trying a different split type occasionally for better results.`);
  }

  return suggestions;
};

module.exports = router;
