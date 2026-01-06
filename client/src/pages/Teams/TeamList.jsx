import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiPlus, FiSearch, FiUsers, FiLoader } from "react-icons/fi";
import "./Teams.css";

export default function TeamList() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 1. Fetch Real Teams from Backend
  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Fetching from your backend
      const response = await axios.get("http://localhost:5000/api/teams", config);
      setTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  }

  // 2. Filter Logic
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="teams-container">
      {/* Header */}
      <div className="teams-header">
        <div className="teams-title">
          <h1>Maintenance Teams</h1>
          <p>Manage technical groups and assignments</p>
        </div>
        <button onClick={() => navigate("/teams/add")} className="btn-primary">
          <FiPlus size={18} /> New Team
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input 
                type="text" 
                placeholder="Search teams..." 
                className="form-input" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      {/* Table */}
      <div className="teams-table-card">
        <table className="teams-table">
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Department</th>
              <th>Team Leader / Members</th>
              <th>Company</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="loading-state">
                  <FiLoader className="spin" /> Loading teams...
                </td>
              </tr>
            ) : filteredTeams.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-state">
                  No teams found. Create your first team.
                </td>
              </tr>
            ) : (
              filteredTeams.map((team) => (
                <tr key={team._id} onClick={() => navigate(`/teams/${team._id}`)} className="clickable-row">
                  <td>
                    <div className="team-name-cell">
                      <div className={`dept-icon ${team.department.substring(0,4).toLowerCase()}`}>
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="name-text">{team.name}</span>
                    </div>
                  </td>
                  
                  <td className="text-secondary">{team.department}</td>
                  
                  <td>
                    <div className="member-avatars">
                      {/* Show Leader Avatar */}
                      {team.teamLeader ? (
                        <>
                          <div className="avatar-circle" title={`Leader: ${team.teamLeader.name}`}>
                            {team.teamLeader.name.charAt(0)}
                          </div>
                          <span className="leader-name">
                            {team.teamLeader.name} 
                            {team.members.length > 1 && <span className="member-count"> (+{team.members.length - 1} others)</span>}
                          </span>
                        </>
                      ) : (
                        <span className="no-leader">No Leader Assigned</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="text-secondary">GearGuard Inc.</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}