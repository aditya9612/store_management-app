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

  useEffect(() => {
    if (!loggedInOwner) navigate("/owner-login");
  }, [loggedInOwner, navigate]);

  // -------------------- Shops & Selection --------------------
  const [shops, setShops] = useState(() =>
    loggedInOwner?.id
      ? JSON.parse(localStorage.getItem(`shops_${loggedInOwner.id}`)) || []
      : []
  );
  const [selectedShop, setSelectedShop] = useState(
    JSON.parse(localStorage.getItem("selectedShop")) || null
  );

  // Active page
  const [activePage, setActivePage] = useState(
    localStorage.getItem("activePage") || "shop-selector"
  );

  // -------------------- Per-shop Data --------------------
  const shopKey = selectedShop ? `${loggedInOwner.id}_${selectedShop.id}` : null;
  const [customers, setCustomers] = useState(() =>
    shopKey ? JSON.parse(localStorage.getItem(`customers_${shopKey}`)) || [] : []
  );
  const [offers, setOffers] = useState(() =>
    shopKey ? JSON.parse(localStorage.getItem(`offers_${shopKey}`)) || [] : []
  );
  const [products, setProducts] = useState(() =>
    shopKey ? JSON.parse(localStorage.getItem(`products_${shopKey}`)) || [] : []
  );
  const [invoices, setInvoices] = useState(() =>
    shopKey ? JSON.parse(localStorage.getItem(`invoices_${shopKey}`)) || [] : []
  );

  // Persist per-shop data
  useEffect(() => {
    if (!shopKey) return;
    localStorage.setItem(`customers_${shopKey}`, JSON.stringify(customers));
    localStorage.setItem(`offers_${shopKey}`, JSON.stringify(offers));
    localStorage.setItem(`products_${shopKey}`, JSON.stringify(products));
    localStorage.setItem(`invoices_${shopKey}`, JSON.stringify(invoices));
  }, [customers, offers, products, invoices, shopKey]);

  // -------------------- Handlers --------------------
  const handleAddShop = (e) => {
    e.preventDefault();
    const form = e.target;
    const newShop = {
      id: Date.now(),
      name: form.name.value,
      address: form.address.value,
      contact: form.contact.value,
      description: form.description.value,
    };
    const updatedShops = [...shops, newShop];
    setShops(updatedShops);
    localStorage.setItem(`shops_${loggedInOwner.id}`, JSON.stringify(updatedShops));
    setSelectedShop(newShop);
    localStorage.setItem("selectedShop", JSON.stringify(newShop));
    setActivePage("dashboard");
  };

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    localStorage.setItem("selectedShop", JSON.stringify(shop));
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInOwner");
    localStorage.removeItem("selectedShop");
    navigate("/owner-login");
  };

  // -------------------- Dashboard Stats --------------------
  const activeOffersCount = offers.filter((o) => o.active).length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const productsSold = invoices.reduce((sum, inv) => sum + (inv.items?.length || 0), 0);

  // -------------------- Header --------------------
  const Header = () => (
    <header className="app-header">
      <div className="header-actions">
        <span>👤 {loggedInOwner?.name}</span>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>
    </header>
  );

  // -------------------- Layout Rendering --------------------
  // --- Shop Selector & Add Shop (no header/footer)
  if (activePage === "shop-selector" || activePage === "add-shop") {
    return (
      <div className="dashboard-wrapper">
        <div className="sidebar">
          <h2>Shop Manager</h2>
          <ul>
            {activePage !== "add-shop" && (
              <li>
                <button onClick={() => setActivePage("add-shop")}>➕ Add New Shop</button>
              </li>
            )}
            {shops.map((s) => (
              <li key={s.id}>
                <button onClick={() => handleSelectShop(s)}>{s.name}</button>
              </li>
            ))}
            {activePage !== "shop-selector" && (
              <li>
                <button onClick={() => setActivePage("shop-selector")}>⬅ Back to Shops</button>
              </li>
            )}
            <li>
              <button onClick={handleLogout}>🚪 Logout</button>
            </li>
          </ul>
        </div>

        <div className="main-content">
          {activePage === "shop-selector" && (
            <>
              <h2>Welcome, {loggedInOwner?.name}</h2>
              <h3>Your Shops ({shops.length})</h3>
              {shops.length === 0 && <p>No shops added yet. Click Add New Shop to get started.</p>}
            </>
          )}
          {activePage === "add-shop" && (
            <>
              <h2>Add New Shop</h2>
              <form className="form-card" onSubmit={handleAddShop}>
                <input name="name" placeholder="Shop Name" required />
                <input name="address" placeholder="Shop Address" required />
                <input name="contact" placeholder="Contact Number" />
                <textarea name="description" placeholder="Description (optional)" />
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button type="submit">Save Shop</button>
                  <button type="button" onClick={() => setActivePage("shop-selector")}>
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- Dashboard & Per-Shop Pages (with header)
  return (
    <div className="dashboard-wrapper">
      <Header />

      <div className="sidebar">
        <h2>{selectedShop?.name}</h2>
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
            <button onClick={() => setActivePage("shop-selector")}>⬅ Back to Shops</button>
          </li>
          <li>
            <button onClick={handleLogout}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        {activePage === "dashboard" && (
          <div>
            <h2>Dashboard 🎉</h2>
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
            customers={customers}
            setCustomers={setCustomers}
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
      </div>
    </div>
  );
}

export default DashboardApp;
