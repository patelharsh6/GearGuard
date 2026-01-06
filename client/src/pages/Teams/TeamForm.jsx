import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiSave, FiUsers, FiCpu } from "react-icons/fi";
import "./TeamForm.css"; // We will create this next

export default function TeamForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Data for Dropdown
  const [technicians, setTechnicians] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    teamLeader: ""
  });

  // 1. Fetch Users for the "Team Leader" Dropdown
  useEffect(() => {
    fetchTechnicians();
  }, []);

  async function fetchTechnicians() {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get("http://localhost:5000/api/teams/technicians", config);
      setTechnicians(response.data);
    } catch (error) {
      console.error("Error fetching technicians:", error);
    }
  }

  // 2. Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post("http://localhost:5000/api/teams", formData, config);
      
      alert("Team Created Successfully!");
      navigate("/teams");
    } catch (error) {
      console.error("Error creating team:", error);
      alert(error.response?.data?.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      {/* Header */}
      <div className="form-header">
        <button onClick={() => navigate("/teams")} className="back-link">
          <FiArrowLeft /> Back to Teams
        </button>
        <h1>Create New Team</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        
        {/* Section: Basic Info */}
        <div className="form-section">
          <div className="section-title">
            <FiUsers color="#3b82f6" /> Team Details
          </div>
          
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Team Name <span className="required-star">*</span></label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="modern-input"
                placeholder="e.g. Alpha Maintenance"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Department <span className="required-star">*</span></label>
              <select 
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="modern-select"
                required
              >
                <option value="">-- Select Department --</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="IT">IT / Network</option>
                <option value="Facility">Facility Management</option>
                <option value="Production">Production Support</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section: Leadership */}
        <div className="form-section">
          <div className="section-title">
            <FiCpu color="#3b82f6" /> Leadership
          </div>
          
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Assign Team Leader</label>
              <select 
                name="teamLeader"
                value={formData.teamLeader}
                onChange={handleChange}
                className="modern-select"
              >
                <option value="">-- Select User --</option>
                {technicians.map((tech) => (
                  <option key={tech._id} value={tech._id}>
                    {tech.name} ({tech.role})
                  </option>
                ))}
              </select>
              <p style={{fontSize: "12px", color: "#94a3b8", marginTop: "5px"}}>
                The Team Leader will be automatically added as a member.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate("/teams")} 
            className="btn-cancel"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="btn-submit"
          >
            <FiSave /> {loading ? "Creating..." : "Create Team"}
          </button>
        </div>

      </form>
    </div>
  );
}