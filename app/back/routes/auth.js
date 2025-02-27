// app/back/routes/auth.js
const express = require('express');
const User = require('../models/User');
const authenticate = require('../middlewares/auth');

const router = express.Router();

// Register route
router.post('/register', authenticate, async (req, res) => {
  const { firebaseUID, name, email } = req.body;

  console.log('Registering user:', { firebaseUID, name, email }); // Log user details

  try {
    const user = new User({
      firebaseUID,
      name,
      email,
      isOnboardingComplete: false
    });
    await user.save();
    console.log('User registered successfully:', user); // Log success
    res.status(201).json(user);
  } catch (error) {
    console.error('Error registering user:', error.message, error.stack); // Log detailed error message
    res.status(400).json({ error: 'Failed to save profile. Please try again later.' });
  }
});

// Me route
router.get('/me', authenticate, async (req, res) => {
  try {
    console.log("Fetching user profile for UID:", req.user.uid);

    const user = await User.findOne({ firebaseUID: req.user.uid });

    if (!user) {
      console.error(`User not found for UID: ${req.user.uid}`);
      return res.status(404).json({ error: 'User profile not found. Please complete registration.' });
    }

    res.json({
      preferredName: user.preferredName || "",  // Ensure it never returns undefined
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      activityLevel: user.activityLevel,
      fitnessGoals: user.fitnessGoals,
      experienceLevel: user.experienceLevel,
      dietaryRestrictions: user.dietaryRestrictions,
      injuries: user.injuries,
      medicalConditions: user.medicalConditions,
      workoutFrequency: user.workoutFrequency,
      preferredWorkoutTime: user.preferredWorkoutTime,
      equipmentAccess: user.equipmentAccess,
      sleepSchedule: user.sleepSchedule,
      stressLevel: user.stressLevel,
      isOnboardingComplete: user.isOnboardingComplete
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ error: 'Internal Server Error while fetching user data' });
  }
});

// Update profile route
router.post('/update-profile', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });

    if (!user) {
      console.error(`User not found for UID: ${req.user.uid}`);
      return res.status(404).json({ error: 'User profile not found. Please complete registration.' });
    }

    // Validate required fields
    const requiredFields = ['age', 'gender', 'height', 'weight', 'activityLevel', 'fitnessGoals', 'workoutFrequency', 'experienceLevel'];
    const missingFields = requiredFields.filter(field => {
      if (Array.isArray(req.body[field])) {
        return req.body[field].length === 0;
      }
      return !req.body[field];
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: missingFields
      });
    }

    // Ensure preferredName is stored
    user.preferredName = req.body.preferredName || user.preferredName;

    // Update user with questionnaire data
    Object.assign(user, {
      ...req.body,
      isOnboardingComplete: true,
      updatedAt: new Date()
    });

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message || 'Error updating profile' });
  }
});


module.exports = router; 