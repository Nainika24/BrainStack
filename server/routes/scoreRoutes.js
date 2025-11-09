import express from "express";
import Score from "../models/Score.js";

const router = express.Router();

// ✅ Add a new score
router.post("/add", async (req, res) => {
  try {
    const { userId, testType, score } = req.body; // renamed to 'score' for consistency

    if (!userId || !testType || score === undefined) {
      return res.status(400).json({ error: "All fields (userId, testType, score) are required" });
    }

    // ✅ Use async/await without callback
    const newScore = await Score.create({ userId, testType, score });

    res.status(201).json({ message: "Score saved successfully", data: newScore });
  } catch (error) {
    console.error("Error adding score:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get scores for a specific user
router.get("/user/:id", async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.params.id }).sort({ date: -1 });
    res.status(200).json(scores);
  } catch (error) {
    console.error("Error fetching user scores:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Leaderboard (top 10 for each test type)
router.get("/leaderboard/:testType", async (req, res) => {
  try {
    // Determine sort order based on test type
    const sortOrder = req.params.testType === "Reaction Time" ? 1 : -1; // 1 for ascending (lower is better), -1 for descending

    const scores = await Score.find({ testType: req.params.testType })
      .sort({ score: sortOrder })
      .limit(10)
      .populate("userId", "name email");

    res.status(200).json(scores);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
