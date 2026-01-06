import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiArrowLeft, 
  FiSave, 
  FiInfo, 
  FiTool, 
  FiFileText,
  FiUser, // Added icon for technician
  FiLoader 
} from "react-icons/fi"; 
import "./MaintenanceForm.css";

export default function MaintenanceForm() {
  const navigate = useNavigate();
  
  // Data State
  const [equipmentList, setEquipmentList] = useState([]);
  const [technicianList, setTechnicianList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    equipment: "",     
    equipmentName: "", 
    category: "",
    type: "", // Ensure this field is handled if needed
    priority: "",
    date: "",
    description: "",
    technician: "", 
    stage: "New" 
  });

  // 1. Fetch Real Data (Equipment AND Technicians)
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Run both fetches at the same time
      const [eqRes, techRes] = await Promise.all([
        axios.get("http://localhost:5000/api/equipment", config),
        axios.get("http://localhost:5000/api/teams/technicians", config) 
      ]);

      setEquipmentList(eqRes.data);
      setTechnicianList(techRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      // Ideally show a user-friendly error message here
    } finally {
      setLoadingData(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEquipmentChange(e) {
    const selectedId = e.target.value;
    const selected = equipmentList.find(eq => eq._id === selectedId);

    if (selected) {
      setForm({
        ...form,
        equipment: selected._id,
        equipmentName: selected.name,
        category: selected.category || "General",
      });
    } else {
      setForm({ ...form, equipment: "", equipmentName: "", category: "" });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const priorityMap = { 'Low': '0', 'Medium': '1', 'High': '2', 'Critical': '3' };
      const stateMap = { 'New': 'draft', 'Assigned': 'assigned', 'In Progress': 'in_progress', 'Completed': 'completed' };
      
      // Map 'type' if you have a specific mapping, otherwise send as is
      
      const payload = {
        name: form.title,
        equipment_id: form.equipment,
        equipmentName: form.equipmentName,
        description: form.description,
        priority: priorityMap[form.priority] || '1',
        scheduled_date: form.date,
        state: form.technician ? 'assigned' : (stateMap[form.stage] || 'draft'), 
        technician_id: form.technician 
      };

      await axios.post('http://localhost:5000/api/maintenance', payload, config);
      
      alert("✅ Request Created Successfully!");
      navigate("/kanban");
    } catch (error) {
      alert("❌ Error: " + (error.response?.data?.message || "Failed to create request"));
    } finally {
      setSubmitting(false);
    }
  }

  const isDisabled = !form.title || !form.equipment || !form.priority;

  return (
    <div className="form-page-container">
      <button onClick={() => navigate(-1)} className="back-link-simple">
        <FiArrowLeft /> Cancel
      </button>

      <div className="form-header">
        <h1>Create Request</h1>
        <p>Log a new maintenance task</p>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        
        {/* BASIC INFO */}
        <div className="form-section">
          <div className="section-title"><FiInfo className="icon-blue" /> Basic Info</div>
          
          <div className="form-grid-2">
            <Input
              label="Request Title *"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Broken Conveyor Belt"
              autoFocus
            />
            
            <div className="input-group">
              <label className="input-label">Select Equipment *</label>
              <select 
                className="modern-select"
                onChange={handleEquipmentChange}
                value={form.equipment}
                disabled={loadingData}
              >
                <option value="">-- Select --</option>
                {equipmentList.map(eq => (
                  <option key={eq._id} value={eq._id}>{eq.name} ({eq.code})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DETAILS */}
        <div className="form-section">
          <div className="section-title"><FiTool className="icon-blue" /> Details & Assignment</div>

          <div className="form-grid-3">
            <Select
              label="Priority *"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              options={[
                { value: "Low", label: "Low" },
                { value: "Medium", label: "Medium" },
                { value: "High", label: "High" },
                { value: "Critical", label: "Critical" },
              ]}
            />
            
            {/* TECHNICIAN SELECT */}
            <div className="input-group">
              <label className="input-label">Assign Technician</label>
              <div className="select-wrapper"> 
                 {/* Optional: Add an icon inside the select wrapper via CSS if desired */}
                  <select 
                    className="modern-select"
                    name="technician"
                    value={form.technician}
                    onChange={handleChange}
                    disabled={loadingData}
                  >
                    <option value="">-- Unassigned --</option>
                    {technicianList.map(tech => (
                      <option key={tech._id} value={tech._id}>{tech.name} ({tech.role})</option>
                    ))}
                  </select>
              </div>
            </div>

            <Input
              label="Due Date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="form-section">
          <div className="section-title"><FiFileText className="icon-blue" /> Description</div>
          <Textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the problem..."
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isDisabled || submitting} className="submit-btn">
            {submitting ? "Saving..." : <><FiSave /> Create Request</>}
          </button>
        </div>
      </form>
    </div>
  );
}

// Reusable Components
const Input = ({ label, ...props }) => (
  <div className="input-group">
    <label className="input-label">{label}</label>
    <input {...props} className="modern-input" />
  </div>
);
const Select = ({ label, options, ...props }) => (
  <div className="input-group">
    <label className="input-label">{label}</label>
    <select {...props} className="modern-select">
      <option value="">-- Select --</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);
const Textarea = ({ ...props }) => (
  <textarea {...props} className="modern-textarea" style={{minHeight: "100px"}} />
);