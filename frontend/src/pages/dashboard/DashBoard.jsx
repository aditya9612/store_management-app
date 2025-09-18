import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@assets/css/dashboard.css";

import InvoicesSection from "@dashboard/InvoicesSection";
import Notifications from "@dashboard/Notifications";
import OffersAdmin from "@dashboard/OffersAdmin";
import Customers from "@dashboard/Customers";
import ProductManagement from "@dashboard/ProductManagement";

function DashboardApp() {
  const navigate = useNavigate();
  const loggedInOwner = JSON.parse(localStorage.getItem("loggedInOwner"));

  // activePage
  const [activePage, setActivePage] = useState(localStorage.getItem("activePage") || "dashboard");
  useEffect(() => localStorage.setItem("activePage", activePage), [activePage]);

  // selected shop
  const [selectedShop, setSelectedShop] = useState(JSON.parse(localStorage.getItem("selectedShop")) || null);

  // All shops
  const [shops, setShops] = useState(() => {
    return loggedInOwner?.id
      ? JSON.parse(localStorage.getItem(`shops_${loggedInOwner.id}`)) || []
      : [];
  });

  // Per-shop key
  const shopKey = selectedShop && loggedInOwner ? `${loggedInOwner.id}_${selectedShop.id}` : null;

  // Per-shop data
  const [customers, setCustomers] = useState(() => shopKey ? JSON.parse(localStorage.getItem(`customers_${shopKey}`)) || [] : []);
  const [offers, setOffers] = useState(() => shopKey ? JSON.parse(localStorage.getItem(`offers_${shopKey}`)) || [] : []);
  const [products, setProducts] = useState(() => shopKey ? JSON.parse(localStorage.getItem(`products_${shopKey}`)) || [] : []);
  const [invoices, setInvoices] = useState(() => shopKey ? JSON.parse(localStorage.getItem(`invoices_${shopKey}`)) || [] : []);

  // Ensure login
  useEffect(() => {
    if (!loggedInOwner) navigate("/owner-login");
  }, [loggedInOwner, navigate]);

  // Save per-shop data to localStorage whenever it changes
  useEffect(() => {
    if (!shopKey) return;
    localStorage.setItem(`customers_${shopKey}`, JSON.stringify(customers));
    localStorage.setItem(`offers_${shopKey}`, JSON.stringify(offers));
    localStorage.setItem(`products_${shopKey}`, JSON.stringify(products));
    localStorage.setItem(`invoices_${shopKey}`, JSON.stringify(invoices));
  }, [customers, offers, products, invoices, shopKey]);

  // Save shops list
  useEffect(() => {
    if (loggedInOwner?.id) {
      localStorage.setItem(`shops_${loggedInOwner.id}`, JSON.stringify(shops));
    }
  }, [shops, loggedInOwner]);

  // Add shop
  const [showAddForm, setShowAddForm] = useState(false);
  const handleSaveShop = (e) => {
    e.preventDefault();
    const form = e.target;
    const newShop = {
      id: Date.now(),
      name: form.name.value,
      address: form.address.value,
      contact: form.contact.value,
      description: form.description.value,
    };
    setShops([...shops, newShop]);
    setShowAddForm(false);
  };

  // Select shop
  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    localStorage.setItem("selectedShop", JSON.stringify(shop));
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("loggedInOwner");
    localStorage.removeItem("selectedShop");
    navigate("/owner-login");
  };

  // Dashboard stats
  const activeOffersCount = offers.filter(o => o.active).length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const productsSold = invoices.reduce((sum, inv) => sum + (inv.items?.length || 0), 0);

  // Show shop selector if no shop selected
  if (!selectedShop) {
    return (
      <div className="shop-selector">
        <h1>Welcome, {loggedInOwner?.name}</h1>
        <h2>Your Shops ({shops.length})</h2>

        {showAddForm ? (
          <form className="form-card" onSubmit={handleSaveShop}>
            <h3>Add New Shop</h3>
            <input name="name" placeholder="Shop Name" required />
            <input name="address" placeholder="Shop Address" required />
            <input name="contact" placeholder="Contact Number" />
            <textarea name="description" placeholder="Description (optional)" />
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit">Save Shop</button>
              <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <div className="shops-grid">
              {shops.map((s, idx) => (
                <div key={s.id} className="shop-card">
                  <h3>{idx + 1}. {s.name}</h3>
                  <p>{s.address}</p>
                  {s.contact && <p>📞 {s.contact}</p>}
                  {s.description && <p>{s.description}</p>}
                  <button onClick={() => handleSelectShop(s)}>Enter Dashboard</button>
                </div>
              ))}
              {shops.length === 0 && <p>No shops added yet.</p>}
            </div>
            <button className="add-shop" onClick={() => setShowAddForm(true)}>➕ Add Shop</button>
            <button className="logout" onClick={handleLogout}>🚪 Logout</button>
          </>
        )}
      </div>
    );
  }

  // Normal shop dashboard
  return (
    <div className="dashboard-wrapper">
      <div className="sidebar">
        <h2>{selectedShop.name}</h2>
        <ul>
          <li><button onClick={() => setActivePage("dashboard")}>🏠 Dashboard</button></li>
          <li><button onClick={() => setActivePage("customers")}>👥 Customers</button></li>
          <li><button onClick={() => setActivePage("productmanagement")}>🛒 Products</button></li>
          <li><button onClick={() => setActivePage("invoices")}>🧾 Invoices</button></li>
          <li><button onClick={() => setActivePage("offersadmin")}>🎁 Offers</button></li>
          <li><button onClick={() => setActivePage("notifications")}>📢 Notifications</button></li>
          <li><button onClick={() => setActivePage("reports")}>📊 Reports</button></li>
          <li><button onClick={() => setSelectedShop(null)}>⬅ Back to Shops</button></li>
          <li><button onClick={handleLogout}>🚪 Logout</button></li>
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
              <div className="card">💰 Total Revenue <span>₹{totalRevenue.toFixed(2)}</span></div>
            </div>
          </div>
        )}

        {activePage === "customers" && (
          <Customers
            loggedInOwner={loggedInOwner}
            selectedShop={selectedShop}
            customers={customers}
            setCustomers={setCustomers}
          />
        )}

        {activePage === "productmanagement" && (
          <ProductManagement
            loggedInOwner={loggedInOwner}
            products={products}
            setProducts={setProducts}
          />
        )}

      {activePage === "invoices" && (
  <InvoicesSection
    invoices={invoices}
    setInvoices={setInvoices}
    customers={customers}           // ✅ pass current customers
    setCustomers={setCustomers}     // ✅ pass setter
    loggedInOwner={loggedInOwner}
    selectedShop={selectedShop}
  />
)}


        {activePage === "offersadmin" && (
          <OffersAdmin
            offers={offers}
            setOffers={setOffers}
            loggedInOwner={loggedInOwner}
            selectedShop={selectedShop}
          />
        )}

        {activePage === "notifications" && (
          <Notifications
            offers={offers}
            customers={customers}
            loggedInOwner={loggedInOwner}
            selectedShop={selectedShop}
          />
        )}

        {activePage === "reports" && (
          <div>
            <h1>Reports 📊</h1>
            <div className="grid-4">
              <div className="card">💰 Total Revenue <span>₹{totalRevenue.toFixed(2)}</span></div>
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
