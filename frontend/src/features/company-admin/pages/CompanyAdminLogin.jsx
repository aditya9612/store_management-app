import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/company-admin-auth.css";

export default function CompanyAdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // For now, using fixed credentials
      // In future, this will use the API endpoint
      if (email === "admin@company.com" && password === "admin123") {
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminToken", "admin-token-placeholder");
        localStorage.setItem("adminEmail", email);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        navigate("/company-admin");
      } else {
        setError("Invalid admin credentials");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      {/* Left - Content */}
      <div className="admin-auth-content">
        <h1>Welcome, Company Admin</h1>
        <p className="lead">Monitor performance, manage stores, and oversee operations from one place.</p>

        <div className="admin-features">
          <div className="admin-feature-item">
            <i className="fas fa-shield-alt"></i>
            <h3>Secure Access</h3>
            <p>Enterprise-grade authentication and access controls</p>
          </div>
          <div className="admin-feature-item">
            <i className="fas fa-chart-pie"></i>
            <h3>Global Insights</h3>
            <p>Track KPIs across all stores in real-time</p>
          </div>
          <div className="admin-feature-item">
            <i className="fas fa-cogs"></i>
            <h3>Centralized Control</h3>
            <p>Configure policies and manage resources centrally</p>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="admin-auth-form">
        <div className="admin-form-container">
          <div className="admin-form-header">
            <h2>Company Admin Login</h2>
            <p>Use your admin credentials to continue</p>
          </div>

          {error && <div className="admin-error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="admin-input-group">
              <label htmlFor="email">Email Address</label>
              <div className="admin-input-with-icon">
                <i className="fas fa-envelope"></i>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="admin-input-group">
              <label htmlFor="password">Password</label>
              <div className="admin-input-with-icon">
                <i className="fas fa-lock"></i>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <i className="fas fa-spinner fa-spin"></i> Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="admin-footer">
            <p>Secure Company Management Portal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
