import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiArrowRight, FiShield, FiAlertCircle, FiBriefcase } from "react-icons/fi";
import axios from "axios";
import "./Auth.css";

export default function Signup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "technician"
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSignup(e) {
    e.preventDefault();
    
    if(formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/signup", {
        name: formData.name, 
        email: formData.email,
        password: formData.password,
        role: formData.role 
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify({
          name: response.data.name,
          role: response.data.role,
          email: response.data.email
        }));
        navigate("/");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed. Try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      
      {/* Left side: Branding */}
      <div className="auth-branding">
        <div className="brand-logo">
          <FiShield size={32} /> GearGuard
        </div>
        <div className="brand-content">
          <h1>Join the Future of Maintenance.</h1>
          <p>Create your account to start tracking equipment, managing teams, and predicting downtime with our premium toolkit.</p>
        </div>
        <div className="brand-footer">
          Trusted by 500+ Industry Leaders globally.
        </div>
      </div>

      {/* Right side: Form */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Get started with your free account</p>
          </div>

          {error && (
            <div className="alert-error">
              <FiAlertCircle /> {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSignup}>
            
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div className="input-wrapper">
                <input type="text" name="name" placeholder="John Doe" className="modern-input" required onChange={handleChange} />
                <FiUser className="input-icon" />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <input type="email" name="email" placeholder="name@company.com" className="modern-input" required onChange={handleChange} />
                <FiMail className="input-icon" />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Select Role</label>
              <div className="input-wrapper">
                <select 
                  name="role" 
                  className="modern-input" 
                  value={formData.role} 
                  onChange={handleChange}
                  style={{ cursor: "pointer", appearance: "none" }}
                >
                  <option value="technician">Technician</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <FiBriefcase className="input-icon" />
                <div style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-tertiary)", fontSize: "12px" }}>▼</div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <input type="password" name="password" placeholder="Create a password" className="modern-input" required onChange={handleChange} />
                <FiLock className="input-icon" />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <div className="input-wrapper">
                <input type="password" name="confirmPassword" placeholder="Repeat password" className="modern-input" required onChange={handleChange} />
                <FiLock className="input-icon" />
              </div>
            </div>

            <button className="btn-primary auth-btn" disabled={loading}>
              {loading ? "Creating Account..." : (<>Create Account <FiArrowRight /></>)}
            </button>

            <div className="auth-footer">
              Already have an account? <Link to="/login">Log in</Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}