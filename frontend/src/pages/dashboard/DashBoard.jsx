import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@assets/css/dashboard.css";
import InvoicesSection from "@dashboard/InvoicesSection";
import Notifications from "@dashboard/Notifications";
import OffersAdmin from "@dashboard/OffersAdmin";

function DashboardApp() {
  const [activePage, setActivePage] = useState("dashboard");
  const [offers, setOffers] = useState([]);
  const [customers, setCustomers] = useState([
    {
      name: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      address: "New York",
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "9876501234",
      address: "California",
    },
  ]);

  const navigate = useNavigate();

  // ✅ Protect Dashboard (only for logged-in owner)
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isOwnerLoggedIn");
    if (!isLoggedIn) {
      navigate("/owner-login");
    }
  }, [navigate]);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("isOwnerLoggedIn");
    localStorage.removeItem("shopOwner"); // optional: clear stored details
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
              <div className="card">Total Customers: {customers.length}</div>
              <div className="card">Revenue: ₹45,000</div>
              <div className="card">Reports Generated: 12</div>
            </div>
          </div>
        )}

        {activePage === "customers" && (
          <div>
            <h1>Customer Management 👥</h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const name = e.target.name.value;
                const email = e.target.email.value;
                const phone = e.target.phone.value;
                const address = e.target.address.value;

                if (name && email && phone) {
                  setCustomers([...customers, { name, email, phone, address }]);
                  e.target.reset();
                }
              }}
            >
              <input type="text" name="name" placeholder="Customer Name" required />
              <input type="email" name="email" placeholder="Customer Email" required />
              <input
                type="tel"
                name="phone"
                placeholder="Customer Phone"
                pattern="[0-9]{10}"
                required
              />
              <input type="text" name="address" placeholder="Customer Address" />
              <button className="blue">Add Customer</button>
            </form>

            <ul>
              {customers.map((c, idx) => (
                <li key={idx}>
                  {c.name} - {c.email} - {c.phone} - {c.address}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activePage === "products" && (
          <div>
            <h1>Product Management 🛒</h1>
            <form onSubmit={(e) => e.preventDefault()}>
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
