const mongoose = require('mongoose');

const WorkoutPlanSchema = new mongoose.Schema({
  exercises: [{
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: Number, required: true },
    difficulty: { type: String },
  }],
}, { timestamps: true });

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);
