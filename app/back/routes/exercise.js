const express = require("express");
const axios = require("axios");

const router = express.Router();
const PYTHON_API = "http://127.0.0.1:5001";

router.get("/full_recommendation", async (req, res) => {
  const { split_type } = req.query;

  if (!split_type) {
    return res.status(400).json({ error: "Missing split type parameter" });
  }

  try {
    const response = await axios.get(`${PYTHON_API}/full_recommendation`, {
      params: { split_type },
    });

    if (response.status !== 200) {
      console.error(`Error from Python API:`, response.data);
      return res.status(500).json({ error: "Failed to fetch full workout plan" });
    }

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching full workout plan:", error.message);
    res.status(500).json({ error: "Failed to fetch full workout plan" });
  }
});

module.exports = router;
