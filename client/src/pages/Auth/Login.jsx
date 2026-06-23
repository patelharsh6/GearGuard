import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight, FiShield, FiAlertCircle } from "react-icons/fi";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify({
          name: response.data.name,
          role: response.data.role,
          email: response.data.email
        }));
        navigate("/"); // Go to dashboard
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed. Check server.";
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
          <h1>Welcome Back</h1>
          <p>Sign in to continue managing your equipment maintenance workflows, tracking analytics, and keeping your facility running smoothly.</p>
        </div>
        <div className="brand-footer">
          © {new Date().getFullYear()} GearGuard Inc. All rights reserved.
        </div>
      </div>

      {/* Right side: Form */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h2>Log In</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="alert-error">
              <FiAlertCircle /> {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <input 
                  type="email" 
                  required 
                  className="modern-input" 
                  placeholder="name@company.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
                <FiMail className="input-icon" />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <input 
                  type="password" 
                  required 
                  className="modern-input" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <FiLock className="input-icon" />
              </div>
            </div>

            <button className="btn-primary auth-btn" disabled={loading}>
              {loading ? "Signing in..." : <>Sign In <FiArrowRight /></>}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/signup">Create account</Link>
          </div>
        </div>
      </div>

    </div>
  );
}