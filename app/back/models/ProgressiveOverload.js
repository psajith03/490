const mongoose = require('mongoose');

const progressiveOverloadSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  workout: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavedWorkout',
    required: true
  },
  exercises: [{
    name: {
      type: String,
      required: true
    },
    currentWeight: {
      type: Number,
      required: true,
      default: 0
    },
    currentReps: {
      type: Number,
      required: true,
      default: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProgressiveOverload', progressiveOverloadSchema); 