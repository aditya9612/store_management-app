import React, { useState, useEffect } from "react";
import { authService } from "@/utils/api";
import "@/features/company-admin/styles/company-admin.css";

export default function CompanyAdmin() {
  const [owners, setOwners] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    shop_name: "",
    address: "",
  });
  const [activeTab, setActiveTab] = useState("dashboard"); // Default tab
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingOwner, setEditingOwner] = useState(null);

  // Fetch owners
  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await authService.getOwners();
      setOwners(response && Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  // Handle form input
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Register new shop owner
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const ownerData = {
        ...formData,
        shop_name: formData.shop_name || null,
        address: formData.address || null,
      };
      await authService.createOwner(ownerData);
      alert("Shop Owner registered ✅");
      setFormData({
        name: "",
        mobile: "",
        email: "",
        password: "",
        shop_name: "",
        address: "",
      });
      fetchOwners(); // Refresh the list
      setActiveTab("manage-owners"); // auto switch after adding
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authService.updateOwner(editingOwner.id, editingOwner);
      alert("Shop Owner updated ✅");
      setEditingOwner(null);
      fetchOwners(); // Refresh the list
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this owner?")) {
      try {
        setLoading(true);
        await authService.deleteOwner(id);
        alert("Shop Owner deleted ✅");
        fetchOwners(); // Refresh the list
      } catch (error) {
        alert(`❌ ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
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
                  name="mobile"
                  placeholder="Phone Number"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="shop_name"
                  placeholder="Shop Name (Optional)"
                  value={formData.shop_name}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address (Optional)"
                  value={formData.address}
                  onChange={handleChange}
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
                    <p>Phone: {o.mobile}</p>
                    <p>Shop: {o.shop_name}</p>
                    <p>Address: {o.address}</p>
                    <button onClick={() => setEditingOwner(o)}>Edit</button>
                    <button className="red" onClick={() => handleDelete(o.id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {editingOwner && (
            <div className="modal">
              <div className="modal-content">
                <h2>Edit Shop Owner</h2>
                <form onSubmit={handleUpdate}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Owner Full Name"
                    value={editingOwner.name}
                    onChange={(e) => setEditingOwner({ ...editingOwner, name: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    name="mobile"
                    placeholder="Phone Number"
                    value={editingOwner.mobile}
                    onChange={(e) => setEditingOwner({ ...editingOwner, mobile: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    name="shop_name"
                    placeholder="Shop Name (Optional)"
                    value={editingOwner.shop_name}
                    onChange={(e) => setEditingOwner({ ...editingOwner, shop_name: e.target.value })}
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address (Optional)"
                    value={editingOwner.address}
                    onChange={(e) => setEditingOwner({ ...editingOwner, address: e.target.value })}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Owner Email"
                    value={editingOwner.email}
                    onChange={(e) => setEditingOwner({ ...editingOwner, email: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={(e) => setEditingOwner({ ...editingOwner, password: e.target.value })}
                    required
                  />
                  <button type="submit">Update Owner</button>
                  <button onClick={() => setEditingOwner(null)}>Cancel</button>
                </form>
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
