// app/back/index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();
console.log("MongoDB URI:", process.env.MONGODB_URI);

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Admin Setup
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Import routes
const authRoutes = require('./routes/auth');

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Use routes
app.use('/api/auth', authRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

module.exports = app; // Export the Express app instead of starting the server
