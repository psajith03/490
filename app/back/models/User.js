// app/back/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true },
  name: { type: String },
  preferredName: { type: String },
  email: { type: String },
  // Basic Information
  age: { type: Number },
  gender: { type: String },
  height: { type: Number },  // in cm
  weight: { type: Number },  // in kg
  
  // Fitness Profile
  activityLevel: { type: String },
  fitnessGoals: [{ type: String }],
  experienceLevel: { type: String },
  
  // Health Information
  dietaryRestrictions: [{ type: String }],
  injuries: { type: String },
  medicalConditions: { type: String },
  
  // Preferences
  workoutFrequency: { type: String },
  preferredWorkoutTime: { type: String },
  equipmentAccess: [{ type: String }],
  
  // Additional Info
  sleepSchedule: { type: String },
  stressLevel: { type: String },
  
  // Profile Status
  isOnboardingComplete: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 