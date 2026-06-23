import { useState, useEffect } from "react";
import { FiUser, FiMail, FiSave, FiLock } from "react-icons/fi";
import axios from "axios";
import "./User.css";

export default function Settings() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const { data } = await axios.get("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setFormData({ name: data.name, email: data.email, password: "" });
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ text: "", type: "" });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const token = localStorage.getItem("token");
      const updatePayload = { name: formData.name, email: formData.email };
      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const { data } = await axios.put("http://localhost:5000/api/auth/profile", updatePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local storage with new info
      localStorage.setItem("user", JSON.stringify({
        name: data.name,
        role: data.role,
        email: data.email
      }));
      
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setMessage({ text: "Profile updated successfully!", type: "success" });
      setFormData({ ...formData, password: "" }); // clear password field
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to update profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="user-page-loading">Loading Settings...</div>;

  return (
    <div className="user-page">
      <div className="user-page-header">
        <div>
          <h1>Account Settings</h1>
          <p>Update your personal information and password.</p>
        </div>
      </div>

      <div className="card user-settings-card">
        {message.text && (
          <div className={`alert-${message.type}`} style={{ marginBottom: "20px", padding: "12px", borderRadius: "8px", fontWeight: "500" }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="settings-form">
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="input-wrapper">
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="modern-input" required />
              <FiUser className="input-icon" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="modern-input" required />
              <FiMail className="input-icon" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">New Password (Optional)</label>
            <div className="input-wrapper">
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current password" className="modern-input" />
              <FiLock className="input-icon" />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            <FiSave /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
