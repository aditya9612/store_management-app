import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

  // Owner identifier used across effects and state
  const ownerId = ownerIdStr ? parseInt(ownerIdStr) : null;
  const isAuthenticated = !!ownerId;
  const loggedInOwner = ownerId ? { id: ownerId, name: ownerName || 'Shop Owner' } : null;
  const [storeInfo, setStoreInfo] = useState(null);
  const shopKey = ownerId && selectedStoreId ? `${ownerId}_${selectedStoreId}` : null;

  // Check for shop suspension and auto-logout
  useEffect(() => {
    if (!ownerId || !selectedStoreId) return;

    const checkShopSuspension = () => {
      // Check for suspension flag in localStorage
      const suspensionFlag = localStorage.getItem(`shop_suspended_${ownerId}`);
      if (suspensionFlag) {
        toast.error("⚠️ Your shop has been suspended. You are being logged out for security reasons.");
        setTimeout(() => {
          handleLogout();
        }, 2000);
        return;
      }

      // Also check current shop status periodically
      if (storeInfo && storeInfo.status === 'suspended') {
        toast.error("🚫 Your shop access has been suspended. Logging out...");
        setTimeout(() => {
          handleLogout();
        }, 2000);
        return;
      }
    };

    // Check immediately
    checkShopSuspension();

    // Check every 30 seconds for status changes
    const interval = setInterval(checkShopSuspension, 30000);

    return () => clearInterval(interval);
  }, [ownerId, selectedStoreId, storeInfo]);

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
  const [searchParams, setSearchParams] = useSearchParams();
  const activePage = searchParams.get('tab') || 'dashboard';

  // Fetch shop data on component mount or when store selection changes
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);

        // If no store is selected, try to fetch owner's shops and auto-select first one
        if (!selectedStoreId && ownerId) {
          try {
            console.log('🔍 No store selected, fetching owner shops for:', ownerId);
            const shopsResponse = await authService.getShops(ownerId);
            const shops = shopsResponse.data || [];

            if (shops.length > 0) {
              const firstShop = shops[0];
              console.log('🏪 Auto-selecting first shop:', firstShop);
              setSelectedStoreId(firstShop.id);
              localStorage.setItem("selectedStoreId", firstShop.id.toString());
              // Don't return here, continue to fetch store details
            } else {
              console.log('⚠️ No shops found for owner');
              toast.warning("No shops found for this owner. Please contact your administrator.");
              setLoading(false);
              return;
            }
          } catch (shopError) {
            console.error('❌ Error fetching shops:', shopError);
            toast.error("Failed to load shops. Please try again.");
            setLoading(false);
            return;
          }
        }

        // Wait for selectedStoreId to be available (either from props or auto-selected)
        if (!selectedStoreId) {
          console.log('⏳ Still no store selected, waiting...');
          setLoading(false);
          return;
        }

        console.log('📋 Fetching store details for ID:', selectedStoreId);
        const details = await authService.getStoreDetails(selectedStoreId);
        console.log('✅ Store details received:', details);

        if (!details || !details.data) {
          throw new Error("Invalid store details received from server");
        }

        setStoreInfo(details.data);
        console.log('💾 Store info set:', details.data);

        // Check store status
        if (details.data.status === 'inactive') {
          toast.warning("This store is currently inactive. Please contact your administrator.");
          return;
        }

        if (details.data.status === 'suspended') {
          toast.error("This store has been suspended. Access denied.");
          return;
        }

      } catch (error) {
        console.error('❌ Error in fetchShopData:', error);

        // Don't show error toast for common/expected errors during shop auto-selection
        const isAutoSelectionError = !selectedStoreId && ownerId;
        const isNetworkError = error.message?.includes('Network Error') || error.message?.includes('connect');

        if (!isAutoSelectionError && !isNetworkError) {
          toast.error(error.message || "Failed to load shop data");
        }

        if (error.message?.includes("unauthorized") || error.message?.includes("Selected shop not found")) {
          navigate("/owner-login");
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchShopData();
    }
  }, [isAuthenticated, navigate, ownerId]); // Removed selectedStoreId to prevent multiple runs

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

  // Persist per-shop data - only when data actually changes
  useEffect(() => {
    if (!shopKey) return;

    // Use a more efficient comparison to avoid unnecessary saves
    const currentOffers = JSON.stringify(offers);
    const currentProducts = JSON.stringify(products);
    const currentInvoices = JSON.stringify(invoices);
    const currentCustomers = JSON.stringify(customers);

    // Only save if data has actually changed (simple check)
    const offersKey = `offers_${shopKey}`;
    const productsKey = `products_${shopKey}`;
    const invoicesKey = `invoices_${shopKey}`;
    const customersKey = `customers_${shopKey}`;

    try {
      const savedOffers = localStorage.getItem(offersKey);
      const savedProducts = localStorage.getItem(productsKey);
      const savedInvoices = localStorage.getItem(invoicesKey);
      const savedCustomers = localStorage.getItem(customersKey);

      if (savedOffers !== currentOffers) {
        AuthService.setTempAuthData(offersKey, currentOffers);
      }
      if (savedProducts !== currentProducts) {
        AuthService.setTempAuthData(productsKey, currentProducts);
      }
      if (savedInvoices !== currentInvoices) {
        AuthService.setTempAuthData(invoicesKey, currentInvoices);
      }
      if (savedCustomers !== currentCustomers) {
        AuthService.setTempAuthData(customersKey, currentCustomers);
      }
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }, [offers, products, invoices, customers, shopKey]);

  // -------------------- Handlers --------------------
  const handleLogout = () => {
    AuthService.logoutShopOwner();
    localStorage.removeItem("owner_id");
    localStorage.removeItem("owner_name");
    localStorage.removeItem("role");
    localStorage.removeItem("selectedStoreId");
    navigate("/owner-login");
    toast.info("Logged out successfully");
  };

  // -------------------- Dashboard Stats --------------------
  const activeOffersCount = offers.filter(o => new Date(o.valid_until) > new Date()).length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const productsSold = invoices.reduce((sum, inv) => sum + (inv.items?.length || 0), 0);

  // -------------------- Header --------------------
  const Header = () => {
    return (
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
            <span className="user-name">{loggedInOwner?.name || 'Shop Owner'} (Owner)</span>
          </span>
          {storeInfo && (
            <span className={`store-status ${storeInfo.status}`}>
              <i className={`fas fa-${storeInfo.status === 'active' ? 'check-circle' : storeInfo.status === 'inactive' ? 'pause-circle' : 'times-circle'}`}></i>
              {storeInfo.status.charAt(0).toUpperCase() + storeInfo.status.slice(1)}
            </span>
          )}
        </div>
      </header>
    );
  };

  // -------------------- Render --------------------
  if (!isAuthenticated) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Authenticating...</p>
      </div>
    );
  }

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
            <>
              {/* Shop Header */}
              <div className={`sidebar-shop-header ${storeInfo?.status || 'active'}`}>
                <div className="shop-info">
                  <h3 className="shop-name">{storeInfo?.name || 'Store'}</h3>
                  <p className="shop-location">
                    <i className="fas fa-map-marker-alt"></i>
                    {storeInfo?.location || 'Location not set'}
                  </p>
                </div>
              </div>

              <nav className="sidebar-nav">
              <button 
                className={activePage === "dashboard" ? "active" : ""}
                onClick={() => setSearchParams({ tab: "dashboard" })}
              >
                <i className="fas fa-home"></i>
                Dashboard
              </button>
              <button 
                className={activePage === "customers" ? "active" : ""}
                onClick={() => setSearchParams({ tab: "customers" })}
              >
                <i className="fas fa-users"></i>
                Customers
              </button>
              <button 
                className={activePage === "productmanagement" ? "active" : ""}
                onClick={() => setSearchParams({ tab: "productmanagement" })}
              >
                <i className="fas fa-box-open"></i>
                Products
              </button>
              <button 
                className={activePage === "invoices" ? "active" : ""}
                onClick={() => setSearchParams({ tab: "invoices" })}
              >
                <i className="fas fa-file-invoice"></i>
                Invoices
              </button>
              <button 
                className={activePage === "offersadmin" ? "active" : ""}
                onClick={() => setSearchParams({ tab: "offersadmin" })}
              >
                <i className="fas fa-gift"></i>
                Offers
              </button>
              <button 
                className={activePage === "notifications" ? "active" : ""}
                onClick={() => setSearchParams({ tab: "notifications" })}
              >
                <i className="fas fa-bell"></i>
                Notifications
              </button>
              <button 
                onClick={handleLogout}
                className="logout-btn"
              >
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
              </nav>
            </>)
          }
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {loading ? (
            <div className="content-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading dashboard data...</p>
            </div>
          ) : !storeInfo ? (
            <div className="no-shop-selected">
              <i className="fas fa-store-slash"></i>
              <h2>No Shop Available</h2>
              <p>You don't have access to any shops. Please contact your administrator.</p>
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
                          <p>{loggedInOwner?.name || 'Shop Owner'} (ID #{storeInfo.owner_id})</p>
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