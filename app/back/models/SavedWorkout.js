const mongoose = require('mongoose');

const savedWorkoutSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  splitType: {
    type: String,
    required: true
  },
  exercises: {
    type: Object,
    required: true
  },
  name: {
    type: String
  },
  ratings: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SavedWorkout', savedWorkoutSchema); 