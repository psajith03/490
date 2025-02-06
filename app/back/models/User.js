const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true },
  fitnessGoals: { type: String },
  fitnessLevel: { type: String },
  injuries: { type: String },
  availableEquipment: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 