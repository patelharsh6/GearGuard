import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiArrowLeft, FiSave, FiUsers, FiCpu, FiSearch, FiCheckCircle, FiX 
} from "react-icons/fi";
import "./TeamForm.css";

export default function TeamForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  
  // Search State for Members
  const [memberSearch, setMemberSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    description: "", 
    teamLeader: "",
    members: [] 
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get("http://localhost:5000/api/teams/technicians", config);
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMember = (userId) => {
    setFormData(prev => {
      const currentMembers = prev.members;
      if (currentMembers.includes(userId)) {
        return { ...prev, members: currentMembers.filter(id => id !== userId) };
      } else {
        return { ...prev, members: [...currentMembers, userId] };
      }
    });
  };

  // Filter users based on search
  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(memberSearch.toLowerCase())
  );

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
      alert(error.response?.data?.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-header">
        <h1>Create New Team</h1>
        <button onClick={() => navigate("/teams")} className="back-link">
          <FiArrowLeft /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        
        {/* Section 1: Team Info */}
        <div className="form-section">
          <div className="section-title">
            <FiUsers className="icon-blue" /> Team Details
          </div>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Team Name <span className="required-star">*</span></label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="modern-input"
                placeholder="e.g. Maintenance Alpha"
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
                <option value="">-- Select --</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="IT">IT / Network</option>
                <option value="Facility">Facility Management</option>
              </select>
            </div>
            <div className="input-group full-width">
              <label className="input-label">Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="modern-textarea"
                placeholder="Briefly describe the team's purpose..."
              />
            </div>
          </div>
        </div>

        {/* Section 2: Leadership */}
        <div className="form-section">
          <div className="section-title">
            <FiCpu className="icon-blue" /> Leadership
          </div>
          <div className="form-grid">
            <div className="input-group full-width">
              <label className="input-label">Assign Team Leader</label>
              <select 
                name="teamLeader"
                value={formData.teamLeader}
                onChange={handleChange}
                className="modern-select"
              >
                <option value="">-- Select Leader --</option>
                {allUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Add Members (NEW UI) */}
        <div className="form-section">
          <div className="section-header-row">
            <div className="section-title" style={{marginBottom:0}}>
              <FiUsers className="icon-blue" /> Add Members
            </div>
            <span className="member-count-badge">
              {formData.members.length} Selected
            </span>
          </div>

          <div className="member-selection-container">
            {/* Search Bar */}
            <div className="member-search-bar">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search employees by name or role..." 
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
              {memberSearch && (
                <button type="button" onClick={() => setMemberSearch("")} className="clear-search">
                  <FiX />
                </button>
              )}
            </div>

            {/* Scrollable List */}
            <div className="member-list-scroll">
              {filteredUsers.length === 0 ? (
                <div className="empty-search">No employees found matching "{memberSearch}"</div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = formData.members.includes(user._id);
                  const isLeader = formData.teamLeader === user._id;

                  return (
                    <div 
                      key={user._id} 
                      className={`member-row ${isSelected ? "selected" : ""} ${isLeader ? "disabled" : ""}`}
                      onClick={() => !isLeader && toggleMember(user._id)}
                    >
                      <div className="member-row-left">
                        <div className={`checkbox-custom ${isSelected ? "checked" : ""}`}>
                          {isSelected && <FiCheckCircle />}
                        </div>
                        <div className="avatar-small">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="member-info-compact">
                          <span className="name">{user.name} {isLeader && <span className="leader-tag">(Leader)</span>}</span>
                          <span className="role">{user.role}</span>
                        </div>
                      </div>
                      <div className="member-row-right">
                        {isSelected ? <span className="status-text added">Added</span> : <span className="status-text">Select</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/teams")} className="btn-cancel">Cancel</button>
          <button type="submit" disabled={loading} className="btn-submit">
            <FiSave /> {loading ? "Creating..." : "Create Team"}
          </button>
        </div>
      </form>
    </div>
  );
}