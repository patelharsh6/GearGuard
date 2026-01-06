import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiArrowLeft, FiCalendar, FiUser, FiTool, FiAlertCircle, FiCheckCircle, FiClock 
} from "react-icons/fi";
import "./MaintenanceDetails.css"; // We will create this next

export default function MaintenanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  async function fetchDetails() {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`http://localhost:5000/api/maintenance/${id}`, config);
      setRequest(response.data);
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  }

  // Helper for status badge
  const getStatusBadge = (state) => {
    const styles = {
      draft: { bg: "#f1f5f9", color: "#475569", label: "Open / Draft" },
      in_progress: { bg: "#fff7ed", color: "#c2410c", label: "In Progress" },
      completed: { bg: "#f0fdf4", color: "#15803d", label: "Completed" },
      cancelled: { bg: "#fef2f2", color: "#b91c1c", label: "Cancelled" }
    };
    const style = styles[state] || styles.draft;
    
    return (
      <span style={{ 
        background: style.bg, color: style.color, 
        padding: "6px 12px", borderRadius: "20px", 
        fontWeight: "600", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px"
      }}>
        <span style={{width: 8, height: 8, borderRadius: "50%", background: style.color}}></span>
        {style.label}
      </span>
    );
  };

  if (loading) return <div className="loading-screen">Loading details...</div>;
  if (!request) return <div className="error-screen">Request not found.</div>;

  return (
    <div className="details-page">
      {/* Header */}
      <div className="details-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft /> Back
        </button>
        <div className="header-actions">
          {getStatusBadge(request.state)}
        </div>
      </div>

      <div className="details-grid">
        {/* LEFT COLUMN: Main Info */}
        <div className="details-main">
          <div className="info-card header-card">
            <h1>{request.name}</h1>
            <p className="req-id">ID: #{request._id}</p>
            
            <div className="priority-banner">
              <span className="label">Priority:</span>
              <span className={`prio-tag p-${request.priority}`}>
                {request.priority === '3' ? 'Critical' : request.priority === '2' ? 'High' : request.priority === '1' ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>

          <div className="info-card description-card">
            <h3>Description</h3>
            <p>{request.description || "No description provided."}</p>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Info */}
        <div className="details-sidebar">
          
          {/* Equipment Info */}
          <div className="sidebar-card">
            <h3><FiTool /> Equipment</h3>
            {request.equipment ? (
              <div className="eq-info" onClick={() => navigate(`/equipment/${request.equipment._id}`)}>
                <strong>{request.equipment.name}</strong>
                <span>{request.equipment.code}</span>
                <span className="sub-text">{request.equipment.location}</span>
              </div>
            ) : (
              <div className="eq-info">
                <strong>{request.equipmentName}</strong>
                <span className="sub-text">(Details unavailable)</span>
              </div>
            )}
          </div>

          {/* Technician Info */}
          <div className="sidebar-card">
            <h3><FiUser /> Assigned To</h3>
            <div className="tech-info">
              {request.technician_id ? (
                <>
                  <div className="avatar">{request.technician_id.name.charAt(0)}</div>
                  <div>
                    <strong>{request.technician_id.name}</strong>
                    <span className="sub-text">{request.technician_id.email}</span>
                  </div>
                </>
              ) : (
                <span className="unassigned">Unassigned</span>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="sidebar-card">
            <h3><FiCalendar /> Schedule</h3>
            <div className="date-row">
              <span className="label">Scheduled:</span>
              <span>{request.scheduled_date ? new Date(request.scheduled_date).toLocaleDateString() : "Not scheduled"}</span>
            </div>
            <div className="date-row">
              <span className="label">Created:</span>
              <span>{new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}