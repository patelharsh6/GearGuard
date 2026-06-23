import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiLogOut, FiSettings, FiChevronDown } from "react-icons/fi";
import axios from "axios";
import "./ProfileDropdown.css";

export default function ProfileDropdown() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Loading...", role: "...", email: "" });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Load user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fallback to local storage first
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));

        // Fetch fresh from DB
        const token = localStorage.getItem("token");
        if (token) {
          const { data } = await axios.get("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(data);
          localStorage.setItem("user", JSON.stringify({
            name: data.name,
            role: data.role,
            email: data.email
          }));
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <div className="profile-trigger" onClick={() => setIsOpen(!isOpen)}>
        <div className="avatar-circle">
          {getInitials(user.name)}
        </div>
        <div className="user-info-text">
          <span className="user-name">{user.name}</span>
          <span className="user-role">{user.role || 'User'}</span>
        </div>
        <FiChevronDown className={`chevron-icon ${isOpen ? "open" : ""}`} />
      </div>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="dropdown-menu">
          <div className="menu-header">
            <div className="menu-avatar">{getInitials(user.name)}</div>
            <div>
              <strong>{user.name}</strong>
              <p>{user.email}</p>
            </div>
          </div>
          
          <div className="menu-body">
            <Link to="/profile" className="menu-item" onClick={() => setIsOpen(false)}>
              <FiUser /> My Profile
            </Link>
            <Link to="/settings" className="menu-item" onClick={() => setIsOpen(false)}>
              <FiSettings /> Settings
            </Link>
          </div>

          <div className="menu-footer">
            <button onClick={handleLogout} className="logout-btn-small">
              <FiLogOut /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}