import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@assets/css/dashboard.css";
import InvoicesSection from "@dashboard/InvoicesSection";
import Notifications from "@dashboard/Notifications";
import OffersAdmin from "@dashboard/OffersAdmin";
import Customers from "@dashboard/Customers"; // ✅ New import

function DashboardApp() {
  const [activePage, setActivePage] = useState("dashboard");
  const [offers, setOffers] = useState([]);

  const navigate = useNavigate();

  // ✅ Protect Dashboard
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isOwnerLoggedIn");
    if (!isLoggedIn) {
      navigate("/owner-login");
    }
  }, [navigate]);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("isOwnerLoggedIn");
    localStorage.removeItem("shopOwner");
    alert("You have been logged out!");
    navigate("/owner-login");
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Store Admin</h2>
        <ul>
          <li>
            <button onClick={() => setActivePage("dashboard")}>🏠 Dashboard</button>
          </li>
          <li>
            <button onClick={() => setActivePage("customers")}>👥 Customers</button>
          </li>
          <li>
            <button onClick={() => setActivePage("products")}>🛒 Products</button>
          </li>
          <li>
            <button onClick={() => setActivePage("invoices")}>🧾 Invoices</button>
          </li>
          <li>
            <button onClick={() => setActivePage("offersadmin")}>🎁 Offers</button>
          </li>
          <li>
            <button onClick={() => setActivePage("notifications")}>📢 Notifications</button>
          </li>
          <li>
            <button onClick={() => setActivePage("reports")}>📊 Reports</button>
          </li>
          <li>
            <button onClick={handleLogout}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activePage === "dashboard" && (
          <div>
            <h1>Welcome to Dashboard 🎉</h1>
            <div className="grid-3">
              <div className="card">Total Sales: ₹45,000</div>
              <div className="card">Invoices Generated: 20</div>
              <div className="card">Reports Generated: 12</div>
            </div>
          </div>
        )}

        {activePage === "customers" && <Customers />}
        {activePage === "products" && (
          <div>
            <h1>Product Management 🛒</h1>
            <form onSubmit={(e) => e.preventDefault()} className="form-card">
              <input type="text" name="name" placeholder="Product Name" required />
              <textarea name="description" placeholder="Product Description" required />
              <input type="number" name="price" placeholder="Price (₹)" required />
              <input type="file" name="image" accept="image/*" required />
              <button className="green">Upload Product</button>
            </form>
          </div>
        )}

        {activePage === "invoices" && <InvoicesSection />}
        {activePage === "offersadmin" && <OffersAdmin offers={offers} setOffers={setOffers} />}
        {activePage === "notifications" && <Notifications />}

        {activePage === "reports" && (
          <div>
            <h1>Reports & Analytics 📊</h1>
            <div className="grid-3">
              <div className="card">Daily Sales: ₹5,000</div>
              <div className="card">Weekly Sales: ₹20,000</div>
              <div className="card">Monthly Sales: ₹80,000</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardApp;
