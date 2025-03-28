const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const admin = require("firebase-admin");

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

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

app.get("/", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api", exerciseRoutes);
app.use("/api", savedWorkoutRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

module.exports = app;
