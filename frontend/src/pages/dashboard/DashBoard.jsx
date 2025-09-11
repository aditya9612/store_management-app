import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@assets/css/dashboard.css";
import InvoicesSection from "@dashboard/InvoicesSection";
import Notifications from "@dashboard/Notifications";
import OffersAdmin from "@dashboard/OffersAdmin";
import Customers from "@dashboard/Customers";

function DashboardApp() {
  const [activePage, setActivePage] = useState("dashboard");

  // ✅ Centralized State
  const [customers, setCustomers] = useState(() =>
    JSON.parse(localStorage.getItem("customers")) || []
  );
  const [offers, setOffers] = useState(() =>
    JSON.parse(localStorage.getItem("offers")) || []
  );
  const [invoices, setInvoices] = useState(() =>
    JSON.parse(localStorage.getItem("invoices")) || []
  );

  const navigate = useNavigate();

  // ✅ Protect Dashboard
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isOwnerLoggedIn");
    if (!isLoggedIn) {
      navigate("/owner-login");
    }
  }, [navigate]);

  // ✅ Persist data in localStorage
  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("offers", JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem("invoices", JSON.stringify(invoices));
  }, [invoices]);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("isOwnerLoggedIn");
    localStorage.removeItem("shopOwner");
    alert("You have been logged out!");
    navigate("/owner-login");
  };

  // ✅ Calculations
  const activeOffersCount = offers.filter((o) => o.active).length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const productsSold = invoices.reduce(
    (sum, inv) => sum + (inv.items ? inv.items.length : 0),
    0
  );

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Store Admin</h2>
        <ul>
          <li>
            <button
              className={activePage === "dashboard" ? "active" : ""}
              onClick={() => setActivePage("dashboard")}
            >
              🏠 Dashboard
            </button>
          </li>
          <li>
            <button
              className={activePage === "customers" ? "active" : ""}
              onClick={() => setActivePage("customers")}
            >
              👥 Customers
            </button>
          </li>
          <li>
            <button
              className={activePage === "products" ? "active" : ""}
              onClick={() => setActivePage("products")}
            >
              🛒 Products
            </button>
          </li>
          <li>
            <button
              className={activePage === "invoices" ? "active" : ""}
              onClick={() => setActivePage("invoices")}
            >
              🧾 Invoices
            </button>
          </li>
          <li>
            <button
              className={activePage === "offersadmin" ? "active" : ""}
              onClick={() => setActivePage("offersadmin")}
            >
              🎁 Offers
            </button>
          </li>
          <li>
            <button
              className={activePage === "notifications" ? "active" : ""}
              onClick={() => setActivePage("notifications")}
            >
              📢 Notifications
            </button>
          </li>
          <li>
            <button
              className={activePage === "reports" ? "active" : ""}
              onClick={() => setActivePage("reports")}
            >
              📊 Reports
            </button>
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
            <div className="grid-4">
              <div className="card highlight">
                👥 Customers <span>{customers.length}</span>
              </div>
              <div className="card highlight">
                🎁 Active Offers <span>{activeOffersCount}</span>
              </div>
              <div className="card highlight">
                🛒 Products Sold <span>{productsSold}</span>
              </div>
              <div className="card highlight">
                💰 Total Revenue <span>₹{totalRevenue}</span>
              </div>
            </div>
          </div>
        )}

        {activePage === "customers" && (
          <Customers customers={customers} setCustomers={setCustomers} />
        )}

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

        {activePage === "invoices" && (
          <InvoicesSection invoices={invoices} setInvoices={setInvoices} />
        )}

        {activePage === "offersadmin" && (
          <OffersAdmin offers={offers} setOffers={setOffers} />
        )}

        {activePage === "notifications" && <Notifications />}

        {activePage === "reports" && (
          <div>
            <h1>Reports & Analytics 📊</h1>
            <div className="grid-3">
              <div className="card">Total Revenue: ₹{totalRevenue}</div>
              <div className="card">Products Sold: {productsSold}</div>
              <div className="card">Total Customers: {customers.length}</div>
              <div className="card">Active Offers: {activeOffersCount}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardApp;
