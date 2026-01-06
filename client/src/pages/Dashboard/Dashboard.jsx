import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiTool, 
  FiAlertCircle, 
  FiClock, 
  FiTrash2, 
  FiArrowRight, 
  FiPlus, 
  FiCalendar 
} from "react-icons/fi";
import ProfileDropdown from "../../components/ProfileDropdown"; 
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ equipment: 0, open: 0, overdue: 0, scrapped: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [user, setUser] = useState({ name: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      navigate("/login"); 
      return;
    }

    if (storedUser) setUser(JSON.parse(storedUser));

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  async function fetchDashboardData() {
    try {
      const token = localStorage.getItem("token"); 
      if (!token) return; 

      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // 1. Run BOTH requests in parallel for speed
      const [reqResponse, eqResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/maintenance', config),
        axios.get('http://localhost:5000/api/equipment', config) // <--- FETCH EQUIPMENT HERE
      ]);
      
      const requests = reqResponse.data || [];
      const equipmentList = eqResponse.data || [];

      // Calculate Request Stats
      const open = requests.filter(r => r.state === 'draft' || r.state === 'assigned').length;
      const inProgress = requests.filter(r => r.state === 'in_progress').length;
      const scrapped = requests.filter(r => r.state === 'cancelled').length;
      
      const now = new Date();
      const overdue = requests.filter(r => {
        return r.scheduled_date && 
               new Date(r.scheduled_date) < now && 
               !['completed', 'cancelled'].includes(r.state);
      }).length;
      
      setStats({
        equipment: equipmentList.length, // <--- USE REAL COUNT HERE
        open: open + inProgress,
        overdue: overdue,
        scrapped: scrapped,
      });
      
      // Get Recent 5
      const recentRequests = requests
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(r => ({
          id: r._id || "Unknown",
          title: r.name || "Untitled Request",
          date: r.scheduled_date ? new Date(r.scheduled_date).toLocaleDateString() : "No Date",
          status: r.state === 'draft' ? 'Open' : r.state === 'in_progress' ? 'In Progress' : r.state === 'completed' ? 'Done' : 'Cancelled',
          priority: r.priority === '0' ? 'Low' : r.priority === '1' ? 'Medium' : r.priority === '2' ? 'High' : 'Critical'
        }));
      
      setRecent(recentRequests);
      setLoading(false);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-container">
        
        {/* HEADER */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Dashboard</h1>
            <p>
              Welcome back, <span className="user-highlight">{user.name || "Admin"}</span>
            </p>
          </div>

          <div className="header-right">
            <button
              onClick={() => navigate("/maintenance/new")}
              className="primary-btn pulse-effect"
            >
              <FiPlus size={18} /> New Request
            </button>
            <ProfileDropdown />
          </div>
        </div>

        {/* STATS GRID */}
        <div className="stats-grid">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <ModernStatCard 
                title="Total Equipment" 
                value={stats.equipment} 
                color="blue" 
                icon={<FiTool size={22} />} 
                onClick={() => navigate("/equipment")} 
              />
              <ModernStatCard 
                title="Active Requests" 
                value={stats.open} 
                color="orange" 
                icon={<FiAlertCircle size={22} />} 
                onClick={() => navigate("/kanban")} 
              />
              <ModernStatCard 
                title="Overdue Tasks" 
                value={stats.overdue} 
                color="red" 
                icon={<FiClock size={22} />} 
                onClick={() => navigate("/kanban")} 
              />
              <ModernStatCard 
                title="Scrapped Assets" 
                value={stats.scrapped} 
                color="gray" 
                icon={<FiTrash2 size={22} />} 
                onClick={() => navigate("/equipment")} 
              />
            </>
          )}
        </div>

        {/* RECENT MAINTENANCE */}
        <div className="section-header">
          <h3>Recent Activity</h3>
          <span onClick={() => navigate("/kanban")} className="view-all-link">
            View Board <FiArrowRight size={16} />
          </span>
        </div>

        <div className="table-wrapper">
          <div className="responsive-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Task Title</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Skeleton Rows for Table
                  [1, 2, 3].map((n) => (
                    <tr key={n}>
                      <td colSpan="5"><div className="skeleton-row"></div></td>
                    </tr>
                  ))
                ) : recent.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-table-state">
                      <div className="empty-icon-bg"><FiTool /></div>
                      <p>No maintenance requests found.</p>
                      <button className="text-btn" onClick={() => navigate("/maintenance/new")}>Create one now</button>
                    </td>
                  </tr>
                ) : (
                  recent.map((r) => (
                    <tr key={r.id} onClick={() => navigate("/kanban")} className="clickable-row">
                      <td className="id-cell">#{r.id.substring(r.id.length - 6)}</td>
                      <td className="title-cell">{r.title}</td>
                      <td className="date-cell">
                        <FiCalendar size={14} style={{ marginRight: 6, opacity: 0.5 }}/>
                        {r.date}
                      </td>
                      <td><StatusBadge status={r.status} /></td>
                      <td><PriorityBadge value={r.priority} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- INTERNAL COMPONENTS ---------- */

function ModernStatCard({ title, value, color, icon, onClick }) {
  // Map color names to specific CSS classes or hex codes
  const colorMap = {
    blue:   { bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", text: "#1d4ed8", iconBg: "#2563eb" },
    orange: { bg: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", text: "#c2410c", iconBg: "#f97316" },
    red:    { bg: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)", text: "#b91c1c", iconBg: "#ef4444" },
    gray:   { bg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", text: "#334155", iconBg: "#64748b" },
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className="stat-card" onClick={onClick}>
      <div className="stat-icon-container" style={{ backgroundColor: theme.iconBg }}>
        {icon}
      </div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h2 className="stat-value" style={{ color: theme.text }}>{value}</h2>
      </div>
      <div className="stat-arrow">
        <FiArrowRight />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="stat-card skeleton-card">
      <div className="skeleton-circle"></div>
      <div className="skeleton-lines">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line long"></div>
      </div>
    </div>
  );
}

function PriorityBadge({ value }) {
  const map = {
    High: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
    Medium: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
    Low: { bg: "#dcfce7", text: "#166534", dot: "#22c55e" },
    Critical: { bg: "#7f1d1d", text: "#ffffff", dot: "#ffffff" }
  };
  const style = map[value] || map.Low;
  return (
    <span style={{ background: style.bg, color: style.text, padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: style.dot }}></span>{value}
    </span>
  );
}

function StatusBadge({ status }) {
  const isDone = status === "Done";
  return (
    <span style={{ 
      color: isDone ? "#166534" : "#475569", 
      background: isDone ? "#f0fdf4" : "#f1f5f9",
      padding: "4px 10px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "600",
      border: `1px solid ${isDone ? "#bbf7d0" : "#e2e8f0"}`
    }}>
      {status}
    </span>
  );
}