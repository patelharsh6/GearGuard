import mongoose from "mongoose";

const maintenanceRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  // Link to Equipment
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
  equipmentName: { type: String }, 
  
  description: { type: String },
  
  // Priority: 0=Low, 1=Medium, 2=High, 3=Critical
  priority: { type: String, enum: ['0', '1', '2', '3'], default: '1' },
  
  // Status
  state: { 
    type: String, 
    enum: ['draft', 'assigned', 'in_progress', 'completed', 'cancelled'], 
    default: 'draft' 
  },
  
  scheduled_date: { type: Date },

  // 👇 THIS WAS MISSING OR NAMED WRONG!
  technician_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model("MaintenanceRequest", maintenanceRequestSchema);