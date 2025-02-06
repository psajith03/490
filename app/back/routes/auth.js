const express = require('express');
const User = require('../models/User');
const authenticate = require('../middlewares/auth');

const router = express.Router();

// Register route
router.post('/register', authenticate, async (req, res) => {
  const { firebaseUID, fitnessGoals, fitnessLevel, injuries, availableEquipment } = req.body;

  try {
    const user = new User({ firebaseUID, fitnessGoals, fitnessLevel, injuries, availableEquipment });
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Me route
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router; 