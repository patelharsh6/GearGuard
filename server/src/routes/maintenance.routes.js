import express from "express";
import mongoose from "mongoose";
import MaintenanceRequest from "../models/MaintenanceRequest.model.js";
import Equipment from "../models/Equipment.model.js"; // 👈 Required for looking up IDs
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

// ============================================================================
// 1. CREATE REQUEST (POST)
// ============================================================================
// @route   POST /api/maintenance
// @desc    Create a new maintenance request (Handles Code -> ID conversion)
router.post("/", protect, async (req, res) => {
  try {
    let { 
      name, 
      equipment_id, // Might be "EQ-002" (string) or a real ID
      equipmentName,
      description, 
      priority, 
      scheduled_date, 
      state,
      technician_id
    } = req.body;

    // ---------------------------------------------------------
    // 🛠️ LOGIC: Convert "EQ-002" (Code) to Real MongoDB ID
    // ---------------------------------------------------------
    
    // If equipment_id is provided but is NOT a valid MongoDB ID format...
    if (equipment_id && !mongoose.Types.ObjectId.isValid(equipment_id)) {
      console.log(`Looking up equipment by code: ${equipment_id}`);
      
      // Find the equipment by its unique code or name
      const eqFound = await Equipment.findOne({ 
        $or: [{ code: equipment_id }, { name: equipment_id }] 
      });
      
      if (eqFound) {
        equipment_id = eqFound._id; // Swap string for real ID
        // Auto-fill name if missing
        if (!equipmentName) equipmentName = eqFound.name; 
      } else {
        return res.status(404).json({ message: `Equipment with code '${equipment_id}' not found` });
      }
    }
    // ---------------------------------------------------------

    const newRequest = new MaintenanceRequest({
      name,
      equipment: equipment_id, // Now valid ObjectId
      equipmentName,
      description,
      priority,
      scheduled_date,
      state: state || 'draft',
      technician_id: technician_id || null, // Handle empty tech
      createdBy: req.user._id
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);

  } catch (error) {
    console.error("Error creating maintenance request:", error);
    res.status(500).json({ message: "Error creating request", error: error.message });
  }
});

// ============================================================================
// 2. GET ALL REQUESTS
// ============================================================================
// @route   GET /api/maintenance
// @desc    Get all maintenance requests
router.get("/", protect, async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find()
      .populate("equipment", "name code location")
      .populate("technician_id", "name email role") // Requires 'technician_id' in Model
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ============================================================================
// 3. GET SINGLE REQUEST (DETAILS)
// ============================================================================
// @route   GET /api/maintenance/:id
// @desc    Get single maintenance request details
router.get("/:id", protect, async (req, res) => {
  try {
    // 1. Validate ID Format to prevent crashes
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: "Invalid Request ID format" });
    }

    // 2. Fetch with Populates
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate("equipment", "name code location")
      .populate("technician_id", "name email role")
      .populate("createdBy", "name");

    if (!request) {
      return res.status(404).json({ message: "Request not found in database" });
    }

    res.json(request);
  } catch (error) {
    console.error("Backend Error fetching details:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ============================================================================
// 4. UPDATE STATE (PATCH)
// ============================================================================
// @route   PATCH /api/maintenance/:id/state
// @desc    Update status (Kanban Drag & Drop)
router.patch("/:id/state", protect, async (req, res) => {
  try {
    const { state } = req.body;
    const request = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      { state },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Error updating state" });
  }
});

export default router;