import React, { useState, useEffect } from "react";
import "@assets/css/CompanyAdmin.css"; // ✅ sidebar + layout + styles

export default function CompanyAdmin() {
  const [owners, setOwners] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    email: "",
    password: "",
  });
  const [activeTab, setActiveTab] = useState("dashboard"); // Default tab

  // Load from localStorage
  useEffect(() => {
    const savedOwners = JSON.parse(localStorage.getItem("shopOwners")) || [];
    setOwners(savedOwners);
  }, []);

  // Handle form input
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Register new shop owner
  const handleRegister = (e) => {
    e.preventDefault();

    if (owners.some((o) => o.email === formData.email)) {
      alert("❌ Owner with this email already exists!");
      return;
    }

    const updatedOwners = [...owners, { ...formData, id: Date.now() }];
    setOwners(updatedOwners);
    localStorage.setItem("shopOwners", JSON.stringify(updatedOwners));

    setFormData({ name: "", number: "", email: "", password: "" });

    alert("Shop Owner registered ✅");
    setActiveTab("manage-owners"); // auto switch after adding
  };

  // Delete owner
  const handleDelete = (id) => {
    const updatedOwners = owners.filter((o) => o.id !== id);
    setOwners(updatedOwners);
    localStorage.setItem("shopOwners", JSON.stringify(updatedOwners));
  };

  return (
    <div className="company-admin">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>🏢 Admin Panel</h2>
        <ul>
          <li
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            📌 Dashboard
          </li>
          <li
            className={activeTab === "add-owner" ? "active" : ""}
            onClick={() => setActiveTab("add-owner")}
          >
            ➕ Add Shop Owner
          </li>
          <li
            className={activeTab === "manage-owners" ? "active" : ""}
            onClick={() => setActiveTab("manage-owners")}
          >
            👤 Manage Owners
          </li>
          <li
            className={activeTab === "manage-shops" ? "active" : ""}
            onClick={() => setActiveTab("manage-shops")}
          >
            🏬 Manage Shops
          </li>
          <li
            className={activeTab === "all-shops" ? "active" : ""}
            onClick={() => setActiveTab("all-shops")}
          >
            📊 All Shops
          </li>
          <li
            className={activeTab === "reports" ? "active" : ""}
            onClick={() => setActiveTab("reports")}
          >
            📈 Reports
          </li>
          <li
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ Settings
          </li>
          <li
            className="logout"
            onClick={() => {
              localStorage.removeItem("loggedInOwner");
              alert("Logged out ✅");
              window.location.href = "/admin-login";
            }}
          >
            🚪 Logout
          </li>
        </ul>
        <div className="sidebar-footer">© 2025 Company Inc.</div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        {/* Topbar */}
        <header className="topbar">
          <div className="logo">🛒 Company Admin</div>
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>
          <div className="profile">
            <span>Hi, Admin</span>
            <img
              src="https://i.pravatar.cc/40"
              alt="Admin Avatar"
              className="avatar"
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {activeTab === "dashboard" && (
            <div>
              <h1>📌 Dashboard</h1>
              <p>Welcome to the Company Admin Dashboard. Quick stats here.</p>
            </div>
          )}

          {activeTab === "add-owner" && (
            <div>
              <h1>Add New Shop Owner</h1>
              <form onSubmit={handleRegister} className="form-card">
                <input
                  type="text"
                  name="name"
                  placeholder="Owner Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="number"
                  placeholder="Phone Number"
                  value={formData.number}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Owner Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="submit">Register Shop Owner</button>
              </form>
            </div>
          )}

          {activeTab === "manage-owners" && (
            <div>
              <h1>Manage Shop Owners</h1>
              <div className="grid">
                {owners.length === 0 && <p>No shop owners registered yet.</p>}
                {owners.map((o) => (
                  <div key={o.id} className="card">
                    <h3>{o.name}</h3>
                    <p>Email: {o.email}</p>
                    <p>Phone: {o.number}</p>
                    <button className="red" onClick={() => handleDelete(o.id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "manage-shops" && (
            <div>
              <h1>Manage Shops 🏬</h1>
              <p>(Future section: Assign shops to owners, edit shop details, etc.)</p>
            </div>
          )}

          {activeTab === "all-shops" && (
            <div>
              <h1>All Shops 📊</h1>
              <p>(Future section: Show all shops summary and statistics here)</p>
            </div>
          )}

          {activeTab === "reports" && (
            <div>
              <h1>📈 Reports</h1>
              <p>Generate sales, revenue, and performance reports here.</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h1>⚙️ Settings</h1>
              <p>Admin profile, system settings, and preferences go here.</p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>© 2025 Company Inc. | Admin Dashboard v1.0</p>
        </footer>
      </div>
    </div>
  );
}
