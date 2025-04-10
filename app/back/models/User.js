// app/back/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 