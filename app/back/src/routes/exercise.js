const express = require('express');
const router = express.Router();
const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const fs = require('fs');
const { normalizeInput, denormalizeOutput } = require('../models/workout_recommender/model');

let model;
let stats;

const loadModel = async () => {
  if (!model) {
    console.log('Loading model from:', path.join(__dirname, '../models/workout_recommender/model/model.json'));
    model = await tf.loadLayersModel('file://' + path.join(__dirname, '../models/workout_recommender/model/model.json'));
    stats = JSON.parse(fs.readFileSync(path.join(__dirname, '../models/workout_recommender/normalization_stats.json'), 'utf8'));
    console.log('Model and stats loaded successfully');
  }
  return { model, stats };
};

router.post('/predict', async (req, res) => {
  console.log('Received prediction request:', req.body);
  try {
    const { model, stats } = await loadModel();
    const {
      age,
      gender,
      height,
      weight,
      sleep,
      calories,
      heartRate,
      mood,
      workoutType,
      intensity
    } = req.body;

    console.log('Parsed input data:', {
      age, gender, height, weight, sleep, calories, heartRate, mood, workoutType, intensity
    });

    if (!age || !gender || !height || !weight || !sleep || !calories || !heartRate || !mood || !workoutType || !intensity) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    const input = [
      parseInt(age),
      parseInt(gender),
      parseInt(height),
      parseInt(weight),
      parseFloat(sleep),
      parseInt(calories),
      parseInt(heartRate),
      parseInt(mood),
      parseInt(workoutType),
      parseInt(intensity)
    ];

    console.log('Normalized input:', input);

    const normalizedInput = normalizeInput(input, stats);
    const inputTensor = tf.tensor2d([normalizedInput]);
    const [regressionOutput, classificationOutput] = model.predict(inputTensor);
    const regressionData = await regressionOutput.data();
    const [caloriesBurned, duration] = denormalizeOutput([regressionData[0], regressionData[1], 0], stats);
    
    const intensityData = await classificationOutput.data();
    const predictedIntensityIndex = intensityData.indexOf(Math.max(...intensityData));
    const predictedIntensity = ['Low', 'Medium', 'High'][predictedIntensityIndex];
    inputTensor.dispose();
    regressionOutput.dispose();
    classificationOutput.dispose();

    console.log('Prediction results:', {
      caloriesBurned,
      duration,
      intensity: predictedIntensity
    });

    res.json({
      caloriesBurned,
      duration,
      intensity: predictedIntensity
    });

  } catch (error) {
    console.error('Error making prediction:', error);
    res.status(500).json({ error: 'Error making prediction' });
  }
});

module.exports = router; 