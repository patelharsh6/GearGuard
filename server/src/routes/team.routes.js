import express from "express";
import Team from "../models/Team.model.js";
import User from "../models/User.model.js"; 
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

// ============================================================================
// 1. SPECIFIC ROUTES (MUST BE FIRST)
// ============================================================================

// ✅ THIS MUST BE AT THE TOP to prevent 404 errors!
// If this is below /:id, the server thinks "technicians" is a team ID.
router.get("/technicians", protect, async (req, res) => {
  try {
    const techs = await User.find().select("name email role");
    res.json(techs);
  } catch (error) {
    console.error("Error fetching technicians:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ============================================================================
// 2. GENERAL ROUTES
// ============================================================================

// @route   GET /api/teams
// @desc    Get all teams
router.get("/", protect, async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("teamLeader", "name email")
      .sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teams" });
  }
});

// @route   POST /api/teams
// @desc    Create a new team (Includes Description & Members)
router.post("/", protect, async (req, res) => {
  try {
    // 1. Get all fields including the new description and members
    const { name, department, description, teamLeader, members } = req.body;
    
    // Check if team name exists
    const existing = await Team.findOne({ name });
    if (existing) return res.status(400).json({ message: "Team name already exists" });

    // Logic to add leader to members list automatically if not selected
    let finalMembers = members || [];
    if (teamLeader && !finalMembers.includes(teamLeader)) {
      finalMembers.push(teamLeader);
    }

    const newTeam = new Team({
      name,
      department,
      description, // Saving the description
      teamLeader: teamLeader || null,
      members: finalMembers
    });

    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "Error creating team" });
  }
});

// ============================================================================
// 3. DYNAMIC ROUTES (MUST BE LAST)
// ============================================================================

// @route   GET /api/teams/:id
// @desc    Get single team details
// ⚠️ This route catches ANYTHING sent after /api/teams/
// If you place "/technicians" below this, it will break.
router.get("/:id", protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("teamLeader", "name email")
      .populate("members", "name email role"); 
      
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (error) {
    // Check if the error is because the ID format is wrong (e.g. "technicians")
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: "Team not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;