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

    const workout = await SavedWorkout.findOne({ _id: workoutId, userId });
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found or unauthorized' });
    }

    await SavedWorkout.deleteOne({ _id: workoutId });
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

router.patch('/saved-workouts/:id/rate', verifyToken, async (req, res) => {
  try {
    const workoutId = req.params.id;
    const userId = req.user.uid;
    const { exerciseName, rating } = req.body;

    if (!exerciseName || rating === undefined || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating data' });
    }

    const workout = await SavedWorkout.findOne({ _id: workoutId, userId });
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found or unauthorized' });
    }

    workout.ratings = {
      ...workout.ratings,
      [exerciseName]: rating
    };

    await workout.save();
    res.json({ message: 'Rating updated successfully', workout });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ error: 'Failed to update rating' });
  }
});

router.patch('/saved-workouts/:id/exercises', verifyToken, async (req, res) => {
  try {
    const workoutId = req.params.id;
    const userId = req.user.uid;
    const { exerciseName, category } = req.body;

    if (!exerciseName || !category) {
      return res.status(400).json({ error: 'Missing exercise name or category' });
    }

    const workout = await SavedWorkout.findOne({ _id: workoutId, userId });
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found or unauthorized' });
    }

    if (workout.exercises[category]) {
      workout.exercises[category] = workout.exercises[category].filter(
        exercise => exercise.toLowerCase() !== exerciseName.toLowerCase()
      );

      if (workout.exercises[category].length === 0) {
        delete workout.exercises[category];
      }

      if (Object.keys(workout.exercises).length === 0) {
        await SavedWorkout.deleteOne({ _id: workoutId });
        return res.status(200).json({ message: 'Workout deleted as it had no exercises left' });
      }

      const updatedWorkout = await SavedWorkout.findByIdAndUpdate(
        workoutId,
        { $set: { exercises: workout.exercises } },
        { new: true }
      );

      if (!updatedWorkout) {
        throw new Error('Failed to update workout');
      }

      return res.status(200).json({ 
        message: 'Exercise deleted successfully', 
        workout: updatedWorkout 
      });
    }

    return res.status(404).json({ error: 'Exercise not found in the specified category' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
});

module.exports = router; 