import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "@/features/shop-owner/styles/shop-owner-dashboard.css";
import { AuthService } from "@utils/auth";
import { authService } from "@/utils/api";

// Import sub-components
import InvoicesSection from "./sections/InvoicesSection";
import NotificationsSection from "./sections/NotificationsSection";
import OffersSection from "./sections/OffersSection";
import CustomersSection from "./sections/CustomersSection";
import ProductManagementSection from "./sections/ProductManagementSection";

function DashboardPage() {
  const navigate = useNavigate();
  const ownerIdStr = localStorage.getItem("owner_id");
  const ownerName = localStorage.getItem("owner_name");
  const [selectedStoreId, setSelectedStoreId] = useState(() => {
    const idStr = localStorage.getItem("selectedStoreId");
    return idStr ? parseInt(idStr) : null;
  });

  // Owner and store identifiers used across effects and state
  const ownerId = ownerIdStr ? parseInt(ownerIdStr) : null;
  const loggedInOwner = ownerId ? { id: ownerId, name: ownerName || 'Shop Owner' } : null;
  const [storeInfo, setStoreInfo] = useState(null);
  const shopKey = ownerId && selectedStoreId ? `${ownerId}_${selectedStoreId}` : null;

  useEffect(() => {
    if (!ownerId) {
      navigate("/owner-login");
    }
  }, [ownerId, navigate]);

  // -------------------- UI State --------------------
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // -------------------- Shop Data --------------------
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");

  // Fetch shop data on component mount
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        if (!selectedStoreId) {
          throw new Error("No shop selected");
        }
        const details = await authService.getStoreDetails(selectedStoreId);
        setStoreInfo(details.data);
      } catch (error) {
        toast.error(error.message);
        if (error.message.includes("unauthorized") || error.message === "Selected shop not found") {
          navigate("/owner-login");
        }
      } finally {
        setLoading(false);
      }
    };

    if (ownerId && selectedStoreId) {
      fetchShopData();
    }
  }, [ownerId, navigate, selectedStoreId]);

  // -------------------- Per-shop Data --------------------
  const [customers, setCustomers] = useState(() => {
    if (!shopKey) return [];
    try {
      return JSON.parse(AuthService.getTempAuthData(`customers_${shopKey}`)) || [];
    } catch {
      return [];
    }
  });
  const [offers, setOffers] = useState(() => {
    if (!shopKey) return [];
    try {
      return JSON.parse(AuthService.getTempAuthData(`offers_${shopKey}`)) || [];
    } catch {
      return [];
    }
  });
  const [products, setProducts] = useState(() => {
    if (!shopKey) return [];
    try {
      return JSON.parse(AuthService.getTempAuthData(`products_${shopKey}`)) || [];
    } catch {
      return [];
    }
  });
  const [invoices, setInvoices] = useState(() => {
    if (!shopKey) return [];
    try {
      return JSON.parse(AuthService.getTempAuthData(`invoices_${shopKey}`)) || [];
    } catch {
      return [];
    }
  });

  // Persist per-shop data
  useEffect(() => {
    if (!shopKey) return;
    AuthService.setTempAuthData(`customers_${shopKey}`, JSON.stringify(customers));
    AuthService.setTempAuthData(`offers_${shopKey}`, JSON.stringify(offers));
    AuthService.setTempAuthData(`products_${shopKey}`, JSON.stringify(products));
    AuthService.setTempAuthData(`invoices_${shopKey}`, JSON.stringify(invoices));
  }, [customers, offers, products, invoices, shopKey]);

  // -------------------- Handlers --------------------
  const handleLogout = () => {
    AuthService.removeTempAuthData("selectedStoreId");
    AuthService.logoutShopOwner();
    localStorage.removeItem("owner_id");
    localStorage.removeItem("owner_name");
    localStorage.removeItem("role");
    navigate("/owner-login");
    toast.info("Logged out successfully");
  };

  // -------------------- Dashboard Stats --------------------
  const activeOffersCount = offers.filter(o => new Date(o.valid_until) > new Date()).length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const productsSold = invoices.reduce((sum, inv) => sum + (inv.items?.length || 0), 0);

  // -------------------- Header --------------------
  const Header = () => (
    <header className="top-header">
      <div className="header-left">
        <button 
          className="menu-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
        </button>
        <h1>StoreHub</h1>
      </div>
      <div className="header-right">
        <span className="user-info">
          <i className="fas fa-user-circle"></i>
          <span className="user-name">{ownerName || 'Shop Owner'}</span>
        </span>
        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span className="btn-text">Logout</span>
        </button>
      </div>
    </header>
  );

  // -------------------- Render --------------------
  return (
    <div className="dashboard-wrapper">
      <Header />

      <div className="main-container">
        {/* Sidebar */}
        <aside className={`sidebar ${!isSidebarOpen ? 'hidden' : ''} ${loading ? 'loading' : ''}`}>
          {loading ? (
            <div className="sidebar-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading...</p>
            </div>
          ) : (
            <nav className="sidebar-nav">
              <button 
                className={activePage === "dashboard" ? "active" : ""}
                onClick={() => setActivePage("dashboard")}
              >
                <i className="fas fa-home"></i>
                Dashboard
              </button>
              <button 
                className={activePage === "customers" ? "active" : ""}
                onClick={() => setActivePage("customers")}
              >
                <i className="fas fa-users"></i>
                Customers
              </button>
              <button 
                className={activePage === "productmanagement" ? "active" : ""}
                onClick={() => setActivePage("productmanagement")}
              >
                <i className="fas fa-box-open"></i>
                Products
              </button>
              <button 
                className={activePage === "invoices" ? "active" : ""}
                onClick={() => setActivePage("invoices")}
              >
                <i className="fas fa-file-invoice"></i>
                Invoices
              </button>
              <button 
                className={activePage === "offersadmin" ? "active" : ""}
                onClick={() => setActivePage("offersadmin")}
              >
                <i className="fas fa-gift"></i>
                Offers
              </button>
              <button 
                className={activePage === "notifications" ? "active" : ""}
                onClick={() => setActivePage("notifications")}
              >
                <i className="fas fa-bell"></i>
                Notifications
              </button>
              <button onClick={() => navigate("/shop-selector")} className="back-btn">
                <i className="fas fa-arrow-left"></i>
                Back to Shops
              </button>
            </nav>
          )}
        </aside>

        {/* Main Content */}
        <main className="main-content">
        {loading ? (
          <div className="content-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading dashboard data...</p>
          </div>
        ) : !selectedStoreId ? (
          <div className="no-shop-selected">
            <i className="fas fa-store-slash"></i>
            <h2>No Shop Selected</h2>
            <p>Please select a shop to view the dashboard</p>
            <button onClick={() => navigate("/shop-selector")} className="select-shop-btn">
              <i className="fas fa-store"></i>
              Select a Shop
            </button>
          </div>
        ) : (
          <>
            {activePage === "dashboard" && (
              <div className="dashboard-content">
                <div className="page-header">
                  <h2>
                    <i className="fas fa-chart-line"></i>
                    {storeInfo ? `${storeInfo.name} — Dashboard` : "Dashboard Overview"}
                  </h2>
                  <p className="last-updated">
                    <i className="fas fa-sync"></i>
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>

                <div className="stats-grid">
                  <div className="stat-card customers">
                    <i className="fas fa-users"></i>
                    <h3>Total Customers</h3>
                    <span className="number">{customers.length}</span>
                    <span className="label">Registered</span>
                  </div>
                  <div className="stat-card offers">
                    <i className="fas fa-gift"></i>
                    <h3>Active Offers</h3>
                    <span className="number">{activeOffersCount}</span>
                    <span className="label">Running</span>
                  </div>
                  <div className="stat-card products">
                    <i className="fas fa-shopping-cart"></i>
                    <h3>Products Sold</h3>
                    <span className="number">{productsSold}</span>
                    <span className="label">Items</span>
                  </div>
                  <div className="stat-card revenue">
                    <i className="fas fa-rupee-sign"></i>
                    <h3>Total Revenue</h3>
                    <span className="number">
                      ₹{totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                    <span className="label">Lifetime</span>
                  </div>
                </div>
                {storeInfo && (
                  <div className="store-summary">
                    <div className="summary-card">
                      <i className="fas fa-id-badge"></i>
                      <div>
                        <h4>Store ID</h4>
                        <p>{storeInfo.id}</p>
                      </div>
                    </div>
                    <div className="summary-card">
                      <i className="fas fa-map-marker-alt"></i>
                      <div>
                        <h4>Location</h4>
                        <p>{storeInfo.location}</p>
                      </div>
                    </div>
                    <div className="summary-card">
                      <i className="fas fa-user-tie"></i>
                      <div>
                        <h4>Owner</h4>
                        <p>ID #{storeInfo.owner_id}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activePage === "customers" && (
              <CustomersSection
                loggedInOwner={loggedInOwner}
                selectedShop={{ id: selectedStoreId }}
                customers={customers}
                setCustomers={setCustomers}
              />
            )}

            {activePage === "productmanagement" && (
              <ProductManagementSection
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
                selectedShop={{ id: selectedStoreId }}
              />
            )}

            {activePage === "offersadmin" && (
              <OffersSection
                selectedShop={{ id: selectedStoreId }}
                offers={offers}
                setOffers={setOffers}
              />
            )}

            {activePage === "notifications" && (
              <NotificationsSection
                offers={offers}
                customers={customers}
                loggedInOwner={loggedInOwner}
                selectedShop={{ id: selectedStoreId }}
              />
            )}
          </>
        )}
        </main>
      </div>

      {isMobile && isSidebarOpen && (
        <div 
          className="overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default DashboardPage;