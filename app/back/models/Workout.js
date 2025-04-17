const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  exercises: [{
    name: {
      type: String,
      required: true
    },
    sets: {
      type: Number,
      required: true,
      default: 1
    },
    reps: {
      type: Number,
      required: true,
      default: 1
    },
    weight: {
      type: Number,
      required: true,
      default: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

workoutSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('Workout', workoutSchema); 