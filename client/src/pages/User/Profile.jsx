import { useState, useEffect } from "react";
import { FiUser, FiMail, FiBriefcase, FiEdit2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import "./User.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const { data } = await axios.get("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="user-page-loading">Loading Profile...</div>;
  if (!user) return <div className="user-page-error">Failed to load user profile.</div>;

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  return (
    <div className="user-page">
      <div className="user-page-header">
        <div>
          <h1>My Profile</h1>
          <p>View your personal information and account details.</p>
        </div>
        <Link to="/settings" className="btn-primary">
          <FiEdit2 /> Edit Profile
        </Link>
      </div>

      <div className="card user-profile-card">
        <div className="profile-hero">
          <div className="profile-avatar-large">
            {getInitials(user.name)}
          </div>
          <div className="profile-hero-info">
            <h2>{user.name}</h2>
            <p className="profile-role-badge">{user.role}</p>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="detail-item">
            <div className="detail-icon"><FiUser /></div>
            <div className="detail-content">
              <label>Full Name</label>
              <p>{user.name}</p>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon"><FiMail /></div>
            <div className="detail-content">
              <label>Email Address</label>
              <p>{user.email}</p>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon"><FiBriefcase /></div>
            <div className="detail-content">
              <label>Role / Permissions</label>
              <p style={{ textTransform: "capitalize" }}>{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
