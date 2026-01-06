import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiPlus, 
  FiSearch, 
  FiUser, 
  FiAlertCircle,
  FiLoader 
} from "react-icons/fi";
import "./MaintenanceList.css";

export default function MaintenanceList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // 1. STATE FOR REAL DATA
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. FETCH DATA ON LOAD
  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Call Backend API
      const response = await axios.get("http://localhost:5000/api/maintenance", config);
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  }

  // 3. FILTER LOGIC (Works on Real Data now)
  const filteredData = requests.filter((item) => {
    const subject = item.name || "";
    const equipment = item.equipmentName || "";
    
    // Search Check
    const matchesSearch = subject.toLowerCase().includes(search.toLowerCase()) || 
                          equipment.toLowerCase().includes(search.toLowerCase());
    
    // Status Check
    // Map DB status (draft, in_progress) to UI status (Open, In Progress) if needed
    // But usually, it's easier to just match the raw string or map it.
    // Let's assume your DB stores: 'draft', 'in_progress', 'completed', 'cancelled'
    
    let matchesStatus = true;
    if (statusFilter !== "All") {
       // Simple mapping for filter
       if (statusFilter === "Open" && item.state !== 'draft' && item.state !== 'assigned') matchesStatus = false;
       if (statusFilter === "In Progress" && item.state !== 'in_progress') matchesStatus = false;
       if (statusFilter === "Done" && item.state !== 'completed') matchesStatus = false;
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="maintenance-list-container">
      
      {/* Header */}
      <div className="list-header">
        <div className="list-title">
          <h1>Maintenance Requests</h1>
          <p>View and manage all corrective and preventive tasks</p>
        </div>
        <button onClick={() => navigate("/maintenance/new")} className="btn-new">
          <FiPlus size={18} /> New Request
        </button>
      </div>

      {/* Toolbar */}
      <div className="list-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by subject or equipment..." 
            className="toolbar-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select 
          className="toolbar-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <div style={{ overflowX: 'auto' }}>
            <table className="maintenance-table">
            <thead>
                <tr>
                <th>Subject</th>
                <th>Equipment</th>
                <th>Technician</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                   <tr>
                     <td colSpan="6" className="loading-state">
                       <FiLoader className="spin" /> Loading data...
                     </td>
                   </tr>
                ) : filteredData.length === 0 ? (
                <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    No maintenance requests found.
                    </td>
                </tr>
                ) : (
                filteredData.map((req) => (
                    <tr key={req._id} onClick={() => navigate(`/maintenance/${req._id}`)}>
                    <td className="col-subject">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiAlertCircle size={16} color="#64748b" />
                        {req.name}
                        </div>
                    </td>
                    <td className="col-equip">
                        {req.equipmentName || "Unknown"} 
                        {/* Show Code if available in populated object */}
                        {req.equipment && req.equipment.code && (
                           <span style={{ fontSize: '11px', color: '#94a3b8' }}> ({req.equipment.code})</span>
                        )}
                    </td>
                    <td>
                        <div className="tech-info">
                        <FiUser size={14} color="#64748b" /> 
                        {req.technician_id ? req.technician_id.name : "Unassigned"}
                        </div>
                    </td>
                    
                    {/* Map Priority Numbers to Text */}
                    <td><PriorityBadge value={req.priority} /></td>
                    
                    {/* Show Status */}
                    <td><StatusBadge value={req.state} /></td>
                    
                    <td style={{ color: "#64748b" }}>
                      {req.scheduled_date ? new Date(req.scheduled_date).toLocaleDateString() : "No Date"}
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

/* --- Internal Helpers (Badges) --- */

function PriorityBadge({ value }) {
  // Map DB values (0,1,2,3) OR Text (Low, High) to UI
  let label = "Low";
  if (value === '1' || value === 'Medium') label = "Medium";
  if (value === '2' || value === 'High') label = "High";
  if (value === '3' || value === 'Critical') label = "Critical";

  const map = {
    Critical: { bg: "#7f1d1d", text: "#fee2e2" }, 
    High: { bg: "#fee2e2", text: "#991b1b" },     
    Medium: { bg: "#fef3c7", text: "#92400e" },   
    Low: { bg: "#dcfce7", text: "#166534" },      
  };
  const style = map[label] || map.Low;

  return (
    <span style={{
      background: style.bg,
      color: style.text,
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block"
    }}>
      {label}
    </span>
  );
}

function StatusBadge({ value }) {
  // Map DB 'state' to friendly text
  const labelMap = {
    'draft': 'Open',
    'assigned': 'Assigned',
    'in_progress': 'In Progress',
    'completed': 'Done',
    'cancelled': 'Cancelled'
  };

  const label = labelMap[value] || value || "Open";
  const isDone = label === "Done";
  const isProgress = label === "In Progress";
  const isCancelled = label === "Cancelled";

  let bg = "#f1f5f9";
  let color = "#475569";
  let border = "#e2e8f0";

  if (isDone) { bg = "#f0fdf4"; color = "#166534"; border = "#bbf7d0"; }
  if (isProgress) { bg = "#fff7ed"; color = "#c2410c"; border = "#fed7aa"; }
  if (isCancelled) { bg = "#fef2f2"; color = "#991b1b"; border = "#fecaca"; }

  return (
    <span style={{
      background: bg,
      color: color,
      border: `1px solid ${border}`,
      padding: "4px 10px",
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: "600",
      textTransform: "uppercase"
    }}>
      {label}
    </span>
  );
}