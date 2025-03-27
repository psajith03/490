const express = require('express');
const router = express.Router();
const SavedWorkout = require('../models/SavedWorkout');
const admin = require('firebase-admin');

const verifyToken = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/saved-workouts', verifyToken, async (req, res) => {
  try {
    const { splitType, exercises, name } = req.body;
    const userId = req.user.uid;

    const savedWorkout = new SavedWorkout({
      userId,
      splitType,
      exercises,
      name
    });

    await savedWorkout.save();
    res.status(201).json(savedWorkout);
  } catch (error) {
    console.error('Error saving workout:', error);
    res.status(500).json({ error: 'Failed to save workout' });
  }
});

router.get('/saved-workouts', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const savedWorkouts = await SavedWorkout.find({ userId })
      .sort({ createdAt: -1 });
    res.json(savedWorkouts);
  } catch (error) {
    console.error('Error fetching saved workouts:', error);
    res.status(500).json({ error: 'Failed to fetch saved workouts' });
  }
});

router.delete('/saved-workouts/:id', verifyToken, async (req, res) => {
  try {
    const workoutId = req.params.id;
    const userId = req.user.uid;

    // Find the workout and verify ownership
    const workout = await SavedWorkout.findOne({ _id: workoutId, userId });
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found or unauthorized' });
    }

    // Delete the workout
    await SavedWorkout.deleteOne({ _id: workoutId });
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

module.exports = router; 