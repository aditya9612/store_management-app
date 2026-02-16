import React from "react";
import {
  FiHome,
  FiUserPlus,
  FiUsers,
  FiShoppingBag,
  FiLogOut,
  FiBarChart2,
  FiPlusCircle,
} from "react-icons/fi";

export default function AdminSidebar({ activeTab, onTabChange, onLogout }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">Overview</span>
          <ul>
            <li
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => onTabChange("dashboard")}
            >
              <FiHome size={18} />
              <span>Dashboard</span>
            </li>
          </ul>
        </div>

        <div className="nav-section">
          <span className="nav-section-title">Owners</span>
          <ul>
            <li
              className={activeTab === "add-owner" ? "active" : ""}
              onClick={() => onTabChange("add-owner")}
            >
              <FiUserPlus size={18} />
              <span>Add Owner</span>
            </li>
            <li
              className={activeTab === "manage-owners" ? "active" : ""}
              onClick={() => onTabChange("manage-owners")}
            >
              <FiUsers size={18} />
              <span>Manage Owners</span>
            </li>
          </ul>
        </div>

        <div className="nav-section">
          <span className="nav-section-title">Shops</span>
          <ul>
            <li
              className={activeTab === "add-shop" ? "active" : ""}
              onClick={() => onTabChange("add-shop")}
            >
              <FiPlusCircle size={18} />
              <span>Add Shop</span>
            </li>
            <li
              className={activeTab === "manage-shops" ? "active" : ""}
              onClick={() => onTabChange("manage-shops")}
            >
              <FiShoppingBag size={18} />
              <span>Manage Shops</span>
            </li>
          </ul>
        </div>

        <div className="nav-section">
          <span className="nav-section-title">Analytics</span>
          <ul>
            <li
              className={activeTab === "reports" ? "active" : ""}
              onClick={() => onTabChange("reports")}
            >
              <FiBarChart2 size={18} />
              <span>Reports</span>
            </li>
          </ul>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
