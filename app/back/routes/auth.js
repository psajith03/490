// app/back/routes/auth.js
const express = require("express");
const User = require("../models/User");
const admin = require("firebase-admin");

const router = express.Router();

if (!admin.apps.length) {
  try {
    const serviceAccount = require("../firebaseServiceAccount.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin Initialized");
  } catch (error) {
    console.error("Firebase Admin Initialization Failed:", error.message);
  }
}

const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  if (!idToken) {
    console.error("Missing ID Token");
    return res.status(401).json({ error: "Unauthorized: Missing ID token" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

router.post("/register", authenticate, async (req, res) => {
  try {
    const { name, email } = req.body;
    const firebaseUID = req.user.uid;

    console.log("Registering user:", { firebaseUID, name, email });

    let user = await User.findOne({ firebaseUID });

    if (user) {
      console.log("User already exists:", user);
      return res.status(409).json({ error: "User already exists" });
    }

    user = new User({
      firebaseUID,
      name,
      email,
      isOnboardingComplete: false,
    });

    await user.save();
    console.log("User registered successfully:", user);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ error: "Failed to register user" });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });

    if (!user) {
      console.error("User not found for UID:", req.user.uid);
      return res.status(404).json({ error: "User not found. Please complete registration." });
    }

    res.json({
      preferredName: user.preferredName || "",
      name: user.name,
      email: user.email,
      isOnboardingComplete: user.isOnboardingComplete,
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/update-profile", authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });

    if (!user) {
      console.error("User not found for UID:", req.user.uid);
      return res.status(404).json({ error: "User not found. Please complete registration." });
    }

    const requiredFields = [
      "age", "gender", "height", "weight",
      "activityLevel", "fitnessGoals", "workoutFrequency",
      "experienceLevel"
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: "Missing required fields", fields: missingFields });
    }

    user.isOnboardingComplete = true;

    Object.assign(user, req.body, { updatedAt: new Date() });

    await user.save();
    console.log("Profile updated successfully for:", user.email);
    res.json({ message: "Profile updated successfully!", user });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Error updating profile" });
  }
});

module.exports = router;
