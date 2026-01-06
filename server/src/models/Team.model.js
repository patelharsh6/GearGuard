import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  
  // ✅ Added Description Field
  description: { type: String }, 
  
  // Icon for UI (Optional, defaults to 'users')
  icon: { type: String, default: "users" },

  // Relations
  teamLeader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model("Team", teamSchema);