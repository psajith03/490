const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 5000; // Node.js backend port
const PYTHON_API = "http://127.0.0.1:5001"; // Python Flask API URL

// Middleware
app.use(express.json());

// Route to get exercise recommendations
app.get("/api/recommend", async (req, res) => {
  const { exercise, top_n } = req.query;

  if (!exercise) {
    return res.status(400).json({ error: "Missing exercise parameter" });
  }

  try {
    const response = await axios.get(`${PYTHON_API}/recommend`, { params: { exercise, top_n } });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching recommendations:", error.message);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

// Route to get popular exercises by muscle group
app.get("/api/popular", async (req, res) => {
  const { muscle, top_n } = req.query;

  if (!muscle) {
    return res.status(400).json({ error: "Missing muscle group parameter" });
  }

  try {
    const response = await axios.get(`${PYTHON_API}/popular`, { params: { muscle, top_n } });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching popular exercises:", error.message);
    res.status(500).json({ error: "Failed to fetch popular exercises" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Node.js server running on http://localhost:${PORT}`);
});
