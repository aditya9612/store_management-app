import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@assets/css/AuthPage.css";

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // ✅ Define shop owner credentials
  const OWNER_EMAIL = "owner@store.com";
  const OWNER_PASSWORD = "admin123";

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Check if entered credentials match the shop owner
    if (email === OWNER_EMAIL && password === OWNER_PASSWORD) {
      localStorage.setItem("isOwnerLoggedIn", true); // store session
      navigate("/dashboard"); // redirect to dashboard
    } else {
      alert("Access Denied! Only shop owner can login.");
    }
  };

  return (
    <div className="form-container">
      <h2>Shop Owner Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default AuthPage;
