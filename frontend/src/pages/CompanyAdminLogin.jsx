import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CompanyAdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // 🔹 Fixed credentials for company admin
    if (email === "admin@company.com" && password === "admin123") {
      localStorage.setItem("isAdmin", "true");
      navigate("/company-admin");
    } else {
      alert("Invalid admin credentials ❌");
    }
  };

  return (
    <div className="auth-container">
      <div className="form-box">
        <h2>Company Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
