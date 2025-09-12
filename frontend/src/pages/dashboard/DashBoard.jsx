 
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@assets/css/dashboard.css";

import InvoicesSection from "@dashboard/InvoicesSection";
import Notifications from "@dashboard/Notifications";
import OffersAdmin from "@dashboard/OffersAdmin";
import Customers from "@dashboard/Customers";
import ProductManagement from "@dashboard/ProductManagement";

function DashboardApp() {
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();

  const loggedInOwner = JSON.parse(localStorage.getItem("loggedInOwner"));

  useEffect(() => {
    if (!loggedInOwner) navigate("/owner-login");
  }, [navigate, loggedInOwner]);

  // Per-owner state
  const [customers, setCustomers] = useState(() =>
    loggedInOwner?.id
      ? JSON.parse(localStorage.getItem(`customers_${loggedInOwner.id}`)) || []
      : []
  );
  const [offers, setOffers] = useState(() =>
    loggedInOwner?.id
      ? JSON.parse(localStorage.getItem(`offers_${loggedInOwner.id}`)) || []
      : []
  );
  const [products, setProducts] = useState(() =>
    loggedInOwner?.id
      ? JSON.parse(localStorage.getItem(`products_${loggedInOwner.id}`)) || []
      : []
  );
  const [invoices, setInvoices] = useState(() =>
    loggedInOwner?.id
      ? JSON.parse(localStorage.getItem(`invoices_${loggedInOwner.id}`)) || []
      : []
  );

  // Persist data
  useEffect(() => {
    if (loggedInOwner?.id)
      localStorage.setItem(
        `customers_${loggedInOwner.id}`,
        JSON.stringify(customers)
      );
  }, [customers, loggedInOwner]);

  useEffect(() => {
    if (loggedInOwner?.id)
      localStorage.setItem(`offers_${loggedInOwner.id}`, JSON.stringify(offers));
  }, [offers, loggedInOwner]);

  useEffect(() => {
    if (loggedInOwner?.id)
      localStorage.setItem(`products_${loggedInOwner.id}`, JSON.stringify(products));
  }, [products, loggedInOwner]);

  useEffect(() => {
    if (loggedInOwner?.id)
      localStorage.setItem(`invoices_${loggedInOwner.id}`, JSON.stringify(invoices));
  }, [invoices, loggedInOwner]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("loggedInOwner");
    alert("Logged out!");
    navigate("/owner-login");
  };

  // Dashboard stats
  const activeOffersCount = offers.filter((o) => o.active).length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const productsSold = invoices.reduce(
    (sum, inv) => sum + (inv.items ? inv.items.length : 0),
    0
  );

  return (
    <div className="dashboard-wrapper">
      <div className="sidebar">
        <h2>{loggedInOwner?.shopName || "Store Admin"}</h2>
        <ul>
          <li>
            <button onClick={() => setActivePage("dashboard")}>🏠 Dashboard</button>
          </li>
          <li>
            <button onClick={() => setActivePage("customers")}>👥 Customers</button>
          </li>
          <li>
            <button onClick={() => setActivePage("productmanagement")}>🛒 Products</button>
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

      <div className="main-content">
        {activePage === "dashboard" && (
          <div>
            <h1>Dashboard 🎉</h1>
            <div className="grid-4">
              <div className="card">👥 Customers <span>{customers.length}</span></div>
              <div className="card">🎁 Active Offers <span>{activeOffersCount}</span></div>
              <div className="card">🛒 Products Sold <span>{productsSold}</span></div>
              <div className="card">💰 Total Revenue <span>₹{totalRevenue.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}</span></div>
            </div>
          </div>
        )}

        {activePage === "customers" && (
          <Customers loggedInOwner={loggedInOwner} onCustomersChange={setCustomers} />
        )}

        {activePage === "productmanagement" && (
          <ProductManagement loggedInOwner={loggedInOwner} products={products} setProducts={setProducts} />
        )}

        {activePage === "invoices" && (
          <InvoicesSection
            invoices={invoices}
            setInvoices={setInvoices}
            loggedInOwner={loggedInOwner}
            products={products}
            setProducts={setProducts}
          />
        )}

        {activePage === "offersadmin" && (
          <OffersAdmin offers={offers} setOffers={setOffers} />
        )}

        {activePage === "notifications" && <Notifications />}

        {activePage === "reports" && (
          <div>
            <h1>Reports 📊</h1>
            <div className="grid-4">
              <div className="card">Total Revenue: ₹{totalRevenue}</div>
              <div className="card">Products Sold: {productsSold}</div>
              <div className="card">Customers: {customers.length}</div>
              <div className="card">Active Offers: {activeOffersCount}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardApp;
