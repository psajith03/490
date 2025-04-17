const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const admin = require("firebase-admin");

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

app.use(express.json());

if (!admin.apps.length) {
  try {
    const serviceAccount = require("./firebaseServiceAccount.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin Initialized");
  } catch (error) {
    console.error("Firebase Admin Initialization Failed:", error.message);
  }
}

const authRoutes = require("./routes/auth");
const exerciseRoutes = require("./routes/exercise");
const savedWorkoutRoutes = require("./routes/savedWorkout");
const progressiveOverloadRoutes = require("./routes/progressiveOverloadRoutes");

app.get("/", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/exercise", exerciseRoutes);
app.use("/api", savedWorkoutRoutes);
app.use("/api/progressive-overload", progressiveOverloadRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

module.exports = app;
