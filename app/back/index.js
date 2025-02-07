const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Admin Setup
const serviceAccount = require('../firebaseServiceAccount.json');
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

// Update profile route
app.post('/api/auth/update-profile', async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userProfile = {
      ...req.body,
      isOnboardingComplete: true, // Ensure onboarding status is set
    };

    // Update user data in MongoDB
    const User = mongoose.model('User', new mongoose.Schema({ uid: String }, { strict: false }));
    await User.findOneAndUpdate({ uid }, userProfile, { upsert: true });

    res.json({ message: 'Profile updated successfully', isOnboardingComplete: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
