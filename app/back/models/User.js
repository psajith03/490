// app/back/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true },
  name: { type: String },
  preferredName: { type: String },
  email: { type: String },
  age: { type: Number },
  gender: { type: String },
  height: { type: Number },
  weight: { type: Number }, 
  
  activityLevel: { type: String },
  fitnessGoals: [{ type: String }],
  experienceLevel: { type: String },
  
  dietaryRestrictions: [{ type: String }],
  injuries: { type: String },
  medicalConditions: { type: String },
  
  workoutFrequency: { type: String },
  preferredWorkoutTime: { type: String },
  equipmentAccess: [{ type: String }],
  
  sleepSchedule: { type: String },
  stressLevel: { type: String },
  
  isOnboardingComplete: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 