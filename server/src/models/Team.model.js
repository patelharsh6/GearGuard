import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. "Maintenance Alpha"
  department: { type: String, required: true },         // e.g. "Mechanical"
  icon: { type: String, default: "users" },             // For UI icon
  
  // Link to Users
  teamLeader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model("Team", teamSchema);