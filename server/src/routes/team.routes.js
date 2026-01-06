import express from "express";
import Team from "../models/Team.model.js";
import User from "../models/User.model.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

// @route   GET /api/teams
// @desc    Get all teams (with member counts)
router.get("/", protect, async (req, res) => {
  try {
    // Populate leader details
    const teams = await Team.find()
      .populate("teamLeader", "name email")
      .sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teams" });
  }
});

// @route   POST /api/teams
// @desc    Create a new team
router.post("/", protect, async (req, res) => {
  try {
    const { name, department, teamLeader } = req.body;
    
    // Check if exists
    const existing = await Team.findOne({ name });
    if (existing) return res.status(400).json({ message: "Team name already exists" });

    const newTeam = new Team({
      name,
      department,
      teamLeader: teamLeader || null,
      members: teamLeader ? [teamLeader] : [] // Auto-add leader as member
    });

    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ message: "Error creating team" });
  }
});

// @route   GET /api/teams/technicians
// @desc    Get users for dropdowns (Reusable helper)
router.get("/technicians", protect, async (req, res) => {
  try {
    const techs = await User.find().select("name email role");
    res.json(techs);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;