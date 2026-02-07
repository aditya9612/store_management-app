import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService, ownerReportsApi } from "@/utils/api";
import { toast } from 'react-toastify';
import "@/features/shop-owner/styles/shop-owner-selector.css";
function ShopSelectorPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activePage = searchParams.get('tab') || 'shops';
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);
  const [settings, setSettings] = useState({
    // Dashboard Preferences
    dashboard: {
      defaultView: 'shops',
      showWelcomeSection: true,
      compactMode: false,
      autoRefresh: true,
      refreshInterval: 300, // seconds
    },
    // Notifications
    notifications: {
      emailAlerts: true,
      pushNotifications: false,
      shopUpdates: true,
      revenueAlerts: true,
      inventoryAlerts: false,
      orderNotifications: true,
    },
    // Appearance
    appearance: {
      theme: 'light',
      sidebarCollapsed: false,
      showAnimations: true,
      fontSize: 'medium',
      language: 'en',
    },
    // Shop Management
    shopManagement: {
      autoBackup: true,
      exportFormat: 'excel',
      dataRetention: 365, // days
      multiShopView: false,
    }
  });
  
  // Reports state
  const [reportsData, setReportsData] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  
  // Revenue state
  const [revenueData, setRevenueData] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  
  // Sales state
  const [salesData, setSalesData] = useState(null);
  const [salesLoading, setSalesLoading] = useState(false);

  const normalizedShops = useMemo(() => {
    if (!Array.isArray(shops)) {
      return [];
    }

    return shops.map((shop) => {
      const metrics = shop?.metrics || {};
      const totalRevenue = Number(
        metrics.totalRevenue ??
        shop?.total_revenue ??
        shop?.revenue ??
        metrics.revenue ??
        0
      );
      const monthlyRevenue = Number(
        metrics.monthlyRevenue ??
        shop?.current_month_revenue ??
        metrics.currentMonthRevenue ??
        0
      );
      const previousMonthlyRevenue = Number(
        metrics.previousMonthlyRevenue ??
        shop?.previous_month_revenue ??
        metrics.previousMonthRevenue ??
        0
      );

      const trend = previousMonthlyRevenue > 0
        ? ((monthlyRevenue - previousMonthlyRevenue) / previousMonthlyRevenue) * 100
        : (monthlyRevenue > 0 ? 100 : 0);

      return {
        id: shop.id,
        name: shop.name ?? "Unnamed Shop",
        location: shop.location ?? shop.address ?? "Location not specified",
        status: shop.status ?? "unknown",
        totalRevenue,
        monthlyRevenue,
        previousMonthlyRevenue,
        trend,
      };
    });
  }, [shops]);

  const revenueMetrics = useMemo(() => {
    // Use backend revenue data if available
    if (revenueData && revenueData.summary_stats && revenueData.shop_breakdown) {
      const stats = revenueData.summary_stats;
      const shops = revenueData.shop_breakdown;
      
      const totalRevenue = stats.total_revenue || 0;
      const monthlyRevenue = stats.monthly_revenue || 0;
      const previousMonthlyRevenue = stats.previous_monthly_revenue || 0;
      const activeShops = stats.active_shops || 0;
      const shopsCount = stats.total_shops || 0;
      const growthPercent = stats.growth_percent || 0;
      const averagePerShop = shopsCount > 0 ? totalRevenue / shopsCount : 0;
      
      // Top performers from backend data
      const topPerformers = [...shops]
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 4)
        .map(shop => ({
          id: shop.shop_id,
          name: shop.shop_name,
          location: shop.location,
          status: shop.status,
          totalRevenue: shop.total_revenue,
          monthlyRevenue: shop.monthly_revenue,
          previousMonthlyRevenue: shop.previous_monthly_revenue,
          trend: shop.trend
        }));
      
      // Performance alerts
      const performanceAlerts = shopsCount > 1
        ? shops
            .filter((shop) => shop.monthly_revenue < averagePerShop * 0.5)
            .map((shop) => ({
              id: shop.shop_id,
              name: shop.shop_name,
              location: shop.location,
              status: shop.status,
              totalRevenue: shop.total_revenue,
              monthlyRevenue: shop.monthly_revenue,
              previousMonthlyRevenue: shop.previous_monthly_revenue,
              trend: shop.trend,
              message: `${shop.shop_name} is operating below 50% of the average monthly revenue`,
            }))
        : [];
      
      return {
        totalRevenue,
        monthlyRevenue,
        previousMonthlyRevenue,
        averagePerShop,
        activeShops,
        growthPercent,
        topPerformers,
        performanceAlerts,
        shopsCount,
      };
    }
    
    // Fallback to frontend calculated data
    const totalRevenue = normalizedShops.reduce((sum, shop) => sum + shop.totalRevenue, 0);
    const monthlyRevenue = normalizedShops.reduce((sum, shop) => sum + shop.monthlyRevenue, 0);
    const previousMonthlyRevenue = normalizedShops.reduce(
      (sum, shop) => sum + shop.previousMonthlyRevenue,
      0
    );
    const averagePerShop = normalizedShops.length ? totalRevenue / normalizedShops.length : 0;
    const activeShops = normalizedShops.filter((shop) => shop.status === "active").length;
    const growthPercent = previousMonthlyRevenue > 0
      ? ((monthlyRevenue - previousMonthlyRevenue) / previousMonthlyRevenue) * 100
      : (monthlyRevenue > 0 ? 100 : 0);

    const topPerformers = [...normalizedShops]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 4);

    const performanceAlerts = normalizedShops.length > 1
      ? normalizedShops
          .filter((shop) => shop.monthlyRevenue < averagePerShop * 0.5)
          .map((shop) => ({
            ...shop,
            message: `${shop.name} is operating below 50% of the average monthly revenue`,
          }))
      : [];

    return {
      totalRevenue,
      monthlyRevenue,
      previousMonthlyRevenue,
      averagePerShop,
      activeShops,
      growthPercent,
      topPerformers,
      performanceAlerts,
      shopsCount: normalizedShops.length,
    };
  }, [revenueData, normalizedShops]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );

  const formatCurrency = (value) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    return currencyFormatter.format(Math.max(0, safeValue));
  };

  const salesMetrics = useMemo(() => {
    // Use backend sales data if available
    if (salesData && salesData.summary_stats) {
      const stats = salesData.summary_stats;
      const topProducts = salesData.top_products || [];
      const recentOrders = salesData.recent_orders || [];
      const categoryBreakdown = salesData.category_breakdown || {};
      
      return {
        totalSales: stats.total_sales || 0,
        totalRevenue: stats.total_revenue || 0,
        averageSaleValue: stats.average_sale_value || 0,
        topProducts: topProducts,
        categoryBreakdown: categoryBreakdown,
        recentOrders: recentOrders.map(order => ({
          ...order,
          date: order.date ? new Date(order.date) : new Date()
        })),
        lowPerformingProducts: [],
        topPerformingProducts: [],
        productsCount: stats.products_count || 0,
        activeShops: stats.active_shops || 0,
        categoriesCount: stats.categories_count || 0
      };
    }
    
    // Fallback to mock data if backend data not available
    const mockProducts = [
      {
        id: 1,
        name: 'Wireless Headphones',
        category: 'Electronics',
        shop_id: normalizedShops[0]?.id || 1,
        shop_name: normalizedShops[0]?.name || 'Main Store',
        sales_count: 45,
        revenue: 67500,
        trend: 12.5
      },
      {
        id: 2,
        name: 'Smart Watch',
        category: 'Electronics',
        shop_id: normalizedShops[0]?.id || 1,
        shop_name: normalizedShops[0]?.name || 'Main Store',
        sales_count: 32,
        revenue: 96000,
        trend: -3.2
      },
      {
        id: 3,
        name: 'Laptop Stand',
        category: 'Accessories',
        shop_id: normalizedShops[1]?.id || 2,
        shop_name: normalizedShops[1]?.name || 'Branch Store',
        sales_count: 28,
        revenue: 11200,
        trend: 8.7
      },
      {
        id: 4,
        name: 'USB Cable',
        category: 'Accessories',
        shop_id: normalizedShops[0]?.id || 1,
        shop_name: normalizedShops[0]?.name || 'Main Store',
        sales_count: 67,
        revenue: 20100,
        trend: 15.3
      },
      {
        id: 5,
        name: 'Wireless Mouse',
        category: 'Electronics',
        shop_id: normalizedShops[1]?.id || 2,
        shop_name: normalizedShops[1]?.name || 'Branch Store',
        sales_count: 41,
        revenue: 20500,
        trend: 5.8
      }
    ];

    // Calculate total sales metrics
    const totalSales = mockProducts.reduce((sum, product) => sum + product.sales_count, 0);
    const totalRevenue = mockProducts.reduce((sum, product) => sum + product.revenue, 0);
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Top selling products
    const topProducts = [...mockProducts]
      .sort((a, b) => b.sales_count - a.sales_count)
      .slice(0, 5);

    // Products by category
    const categoryBreakdown = mockProducts.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          total_sales: 0,
          total_revenue: 0,
          products: 0
        };
      }
      acc[product.category].total_sales += product.sales_count;
      acc[product.category].total_revenue += product.revenue;
      acc[product.category].products += 1;
      return acc;
    }, {});

    // Recent orders (mock data)
    const recentOrders = [
      {
        id: 1,
        customer_name: 'John Doe',
        product_name: 'Wireless Headphones',
        shop_name: normalizedShops[0]?.name || 'Main Store',
        amount: 1500,
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'completed'
      },
      {
        id: 2,
        customer_name: 'Jane Smith',
        product_name: 'Smart Watch',
        shop_name: normalizedShops[0]?.name || 'Main Store',
        amount: 3000,
        date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        status: 'completed'
      },
      {
        id: 3,
        customer_name: 'Bob Johnson',
        product_name: 'USB Cable',
        shop_name: normalizedShops[1]?.name || 'Branch Store',
        amount: 300,
        date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        status: 'pending'
      }
    ];

    // Performance insights
    const lowPerformingProducts = mockProducts
      .filter(product => product.sales_count < 30)
      .map(product => ({
        ...product,
        message: `${product.name} has low sales (${product.sales_count} units)`
      }));

    const topPerformingProducts = mockProducts
      .filter(product => product.sales_count > 40)
      .map(product => ({
        ...product,
        message: `${product.name} is a top seller (${product.sales_count} units)`
      }));

    return {
      totalSales,
      totalRevenue,
      averageSaleValue,
      topProducts,
      categoryBreakdown,
      recentOrders,
      lowPerformingProducts,
      topPerformingProducts,
      productsCount: mockProducts.length,
      activeShops: normalizedShops.filter(shop => shop.status === 'active').length,
      categoriesCount: Object.keys(categoryBreakdown).length
    };
  }, [salesData, normalizedShops]);

  // Get owner_id from localStorage
  const owner_id = localStorage.getItem("owner_id");
  const ownerName = localStorage.getItem("owner_name"); // We should save this during login

  useEffect(() => {
    if (!owner_id) {
      navigate("/owner-login");
      return;
    }
    fetchShops();
    checkCompanyAdmin();

    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('shopSelectorSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsedSettings
        }));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, [owner_id, navigate]);
  
  // Fetch reports data when reports tab is active
  useEffect(() => {
    if (activePage === 'reports' && ownerId) {
      fetchReportsData();
    }
  }, [activePage, ownerId]);
  
  // Fetch revenue data when revenue tab is active
  useEffect(() => {
    if (activePage === 'revenue' && ownerId) {
      fetchRevenueData();
    }
  }, [activePage, ownerId]);
  
  // Fetch sales data when sales tab is active
  useEffect(() => {
    if (activePage === 'sales' && ownerId) {
      fetchSalesData();
    }
  }, [activePage, ownerId]);

  const checkCompanyAdmin = async () => {
    try {
      // Check if current user is company admin
      // This could be based on role in localStorage or API call
      const role = localStorage.getItem("role");
      setIsCompanyAdmin(role === "company_admin");
    } catch (error) {
      console.error("Failed to check admin status:", error);
    }
  };

  const fetchShops = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching shops for owner:", owner_id);
      const response = await authService.getShops(owner_id);
      console.log("Shops response:", response);
      // The api interceptor returns response.data directly, so we use the response
      const shopsData = Array.isArray(response.data) ? response.data : [];
      console.log("Shops data:", shopsData);

      setShops(shopsData);
      // Set owner ID for reports
      setOwnerId(owner_id);
    } catch (error) {
      toast.error(error.message); // Show user-friendly error message
      console.error("Failed to fetch shops:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch reports data
  const fetchReportsData = async () => {
    if (!ownerId) return;
    
    try {
      setReportsLoading(true);
      const response = await ownerReportsApi.getOverview(ownerId, 'all_time');
      if (response && response.data) {
        setReportsData(response.data);
        console.log('Reports data:', response.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports. Please try again.');
    } finally {
      setReportsLoading(false);
    }
  };
  
  // Fetch revenue data
  const fetchRevenueData = async () => {
    if (!ownerId) return;
    
    try {
      setRevenueLoading(true);
      const response = await ownerReportsApi.getRevenue(ownerId, 'all_time');
      if (response && response.data) {
        setRevenueData(response.data);
        console.log('Revenue data:', response.data);
      }
    } catch (error) {
      console.error('Error fetching revenue:', error);
      toast.error('Failed to load revenue data. Please try again.');
    } finally {
      setRevenueLoading(false);
    }
  };
  
  // Fetch sales data
  const fetchSalesData = async () => {
    if (!ownerId) return;
    
    try {
      setSalesLoading(true);
      const response = await ownerReportsApi.getSales(ownerId, 'all_time');
      if (response && response.data) {
        setSalesData(response.data);
        console.log('Sales data:', response.data);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Failed to load sales data. Please try again.');
    } finally {
      setSalesLoading(false);
    }
  };
  
  // Export handlers
  const handleExportExcel = async () => {
    if (!ownerId) return;
    try {
      await ownerReportsApi.exportToExcel(ownerId, 'all_time');
      toast.success('✅ Excel report downloaded successfully!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('❌ Failed to export Excel. Please try again.');
    }
  };
  
  const handleExportPDF = async () => {
    if (!ownerId) return;
    try {
      await ownerReportsApi.exportToPDF(ownerId, 'all_time');
      toast.success('✅ PDF report downloaded successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('❌ Failed to export PDF. Please try again.');
    }
  };

  const handleSelectShop = (shop) => {
    console.log("🔍 Shop selected:", shop);

    // Store shop authentication data directly
    localStorage.setItem("selectedStoreId", String(shop.id));
    localStorage.setItem("store_name", shop.name || 'Store');

    // Show welcome message
    toast.success(`Accessing ${shop.name} dashboard...`);

    console.log("Shop authentication successful, navigating to dashboard...");

    // Navigate directly to dashboard
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/owner-login");
  };

  const handleSettingsChange = (category, setting, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [setting]: value
      }
    }));

    // Show success message
    toast.success(`${setting.charAt(0).toUpperCase() + setting.slice(1)} updated successfully`);
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage or API
    localStorage.setItem('shopSelectorSettings', JSON.stringify(settings));
    toast.success('All settings saved successfully!');
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      dashboard: {
        defaultView: 'shops',
        showWelcomeSection: true,
        compactMode: false,
        autoRefresh: true,
        refreshInterval: 300,
      },
      notifications: {
        emailAlerts: true,
        pushNotifications: false,
        shopUpdates: true,
        revenueAlerts: true,
        inventoryAlerts: false,
        orderNotifications: true,
      },
      appearance: {
        theme: 'light',
        sidebarCollapsed: false,
        showAnimations: true,
        fontSize: 'medium',
        language: 'en',
      },
      shopManagement: {
        autoBackup: true,
        exportFormat: 'excel',
        dataRetention: 365,
        multiShopView: false,
      }
    };

    setSettings(defaultSettings);
    localStorage.setItem('shopSelectorSettings', JSON.stringify(defaultSettings));
    toast.success('Settings reset to defaults!');
  };

  const handleNavClick = (page) => {
    if (activePage === page && isMobile) {
      setIsSidebarOpen(false);
    } else {
      setSearchParams({ tab: page });
      if (isMobile) {
        setIsSidebarOpen(true);
      }
    }
  };

  return (
    <div className="shop-selector-page">
      {/* Header */}
      <header className="top-header">
        <div className="header-left">
          <button
            className="menu-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
          </button>
          <div className="header-brand">
            <div className="brand-logo">
              <i className="fas fa-store-alt"></i>
            </div>
            
          </div>
        </div>
        
        <div className="header-right">
          <div className="header-owner" aria-label="Signed in owner">
            <div className="owner-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="owner-info">
              <span className="owner-name">{ownerName || 'Shop Owner'}</span>
              <span className="owner-role">Account Owner</span>
            </div>
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* Sidebar */}
        <aside className={`sidebar ${!isSidebarOpen ? 'hidden' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <div className="brand-icon">
                <i className="fas fa-store-alt"></i>
              </div>
              <div className="brand-info">
                <h3>StoreHub</h3>
                <span>Shop Selection</span>
              </div>
            </div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section">
              <span className="nav-section-title">Management</span>
              <ul>
                <li
                  className={activePage === "shops" ? "active" : ""}
                  onClick={() => handleNavClick("shops")}
                >
                  <i className="fas fa-store"></i>
                  <span>My Shops</span>
                </li>
              </ul>
            </div>
            <div className="nav-section">
              <span className="nav-section-title">Analytics</span>
              <ul>
                <li
                  className={activePage === "revenue" ? "active" : ""}
                  onClick={() => handleNavClick("revenue")}
                >
                  <i className="fas fa-chart-line"></i>
                  <span>Revenue</span>
                </li>
                <li
                  className={activePage === "sales" ? "active" : ""}
                  onClick={() => handleNavClick("sales")}
                >
                  <i className="fas fa-shopping-cart"></i>
                  <span>Sales</span>
                </li>
                <li
                  className={activePage === "reports" ? "active" : ""}
                  onClick={() => handleNavClick("reports")}
                >
                  <i className="fas fa-boxes"></i>
                  <span>Reports</span>
                </li>
              </ul>
            </div>
            <div className="nav-section">
              <span className="nav-section-title">Settings</span>
              <ul>
                <li
                  className={activePage === "settings" ? "active" : ""}
                  onClick={() => handleNavClick("settings")}
                >
                  <i className="fas fa-cog"></i>
                  <span>Settings</span>
                </li>
              </ul>
            </div>
          </nav>

          <div className="sidebar-footer">
            <button className="sidebar-logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          </div>

        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Horizontal Welcome Section - Above Header Level */}
          <div className="welcome-section-horizontal">
            <div className="welcome-content">
              <div className="welcome-left">
                <h1>Welcome back, {ownerName}</h1>
                <p>Manage your shops and track your business performance with our advanced dashboard system</p>
              </div>
              <div className="welcome-right">
                <div className="stat-card">
                  <span className="stat-number">{shops.length}</span>
                  <span className="stat-label">Total Shops</span>
                </div>
              </div>
            </div>
          </div>

          {activePage === "shops" && (
            <div className="shops-container">
              <div className="shops-section">
                <div className="shops-header">
                  <h2>
                    <i className="fas fa-store"></i>
                    Your Shops
                  </h2>
                </div>
              
              {isLoading ? (
                <div className="shop-cards">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="shop-card skeleton-card">
                      <div className="shop-card-header">
                        <div className="shop-icon skeleton-icon">
                          <div className="skeleton-pulse"></div>
                        </div>
                        <div className="skeleton-status">
                          <div className="skeleton-pulse"></div>
                        </div>
                      </div>
                      <div className="shop-content">
                        <div className="skeleton-title">
                          <div className="skeleton-pulse"></div>
                        </div>
                        <div className="skeleton-text">
                          <div className="skeleton-pulse"></div>
                        </div>
                        <div className="shop-actions">
                          <div className="skeleton-btn">
                            <div className="skeleton-pulse"></div>
                          </div>
                          <div className="skeleton-btn">
                            <div className="skeleton-pulse"></div>
                          </div>
                        </div>
                        <div className="skeleton-dashboard-btn">
                          <div className="skeleton-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : shops.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-store-alt-slash"></i>
                  <h3>No Shops Found</h3>
                  <p>You don't have any shops yet.</p>
                </div>
              ) : (
                <div className="shop-cards">
                  {shops.map((shop) => (
                    <div key={shop.id} className="shop-card">
                      <div className="shop-card-header">
                        <div className="shop-icon">
                          <i className="fas fa-store"></i>
                        </div>
                        <span className={`shop-status-indicator ${shop.status}`}>
                          <i className={`fas fa-${shop.status === 'active' ? 'check-circle' : shop.status === 'inactive' ? 'pause-circle' : 'times-circle'}`}></i>
                          {shop.status}
                        </span>
                      </div>
                      <div className="shop-content">
                        <h3>{shop.name}</h3>
                        <p>{shop.location}</p>
                        <button
                          className="view-dashboard"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("🔘 Access Shop button clicked for shop:", shop.name);
                            handleSelectShop(shop);
                          }}
                          disabled={shop.status !== 'active'}
                          title={shop.status !== 'active' ? "Shop is not active" : "Access shop dashboard"}
                        >
                          Access Dashboard
                          <i className="fas fa-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          )}

          {activePage === "revenue" && (
            <section className="revenue-dashboard">
              <div className="section-header">
                <div>
                  <h2>Revenue Intelligence</h2>
                  <p>
                    Track performance across all of your stores with a clean, data-driven
                    overview designed for quick insights.
                  </p>
                </div>
                <div className="section-meta">
                  <span className="meta-pill">
                    <i className="fas fa-store"></i>
                    {revenueMetrics.shopsCount} Stores
                  </span>
                  <span className="meta-pill">
                    <i className="fas fa-sync-alt"></i>
                    Updated {new Date().toLocaleDateString()}
                  </span>
                  <button
                    className="btn-refresh"
                    onClick={fetchRevenueData}
                    disabled={revenueLoading}
                    title="Refresh revenue data"
                  >
                    <i className={`fas fa-sync-alt ${revenueLoading ? 'fa-spin' : ''}`}></i>
                    {revenueLoading ? 'Loading...' : 'Refresh Data'}
                  </button>
                </div>
              </div>
              
              {revenueLoading && !revenueData ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading revenue data...</p>
                </div>
              ) : (
                <>

              <div className="revenue-summary-grid">
                <div className="summary-card highlight">
                  <span className="summary-label">Total Revenue</span>
                  <span className="summary-value">
                    {formatCurrency(revenueMetrics.totalRevenue)}
                  </span>
                  <span className="summary-meta">
                    Across {revenueMetrics.shopsCount || 0} shops
                  </span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Current Month</span>
                  <span className="summary-value">
                    {formatCurrency(revenueMetrics.monthlyRevenue)}
                  </span>
                  <span className={`summary-trend ${revenueMetrics.growthPercent >= 0 ? "up" : "down"}`}>
                    <i className={`fas fa-arrow-${revenueMetrics.growthPercent >= 0 ? "up" : "down"}`}></i>
                    {Math.abs(revenueMetrics.growthPercent || 0).toFixed(1)}%
                    <span className="trend-meta">vs previous month</span>
                  </span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Average per Shop</span>
                  <span className="summary-value">
                    {formatCurrency(revenueMetrics.averagePerShop)}
                  </span>
                  <span className="summary-meta">
                    {revenueMetrics.activeShops} active locations
                  </span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Performance Health</span>
                  <span className="summary-value">
                    {revenueMetrics.performanceAlerts.length === 0 ? "Stable" : "Attention"}
                  </span>
                  <span className="summary-meta">
                    {revenueMetrics.performanceAlerts.length === 0
                      ? "No critical alerts"
                      : `${revenueMetrics.performanceAlerts.length} shop(s) below target`}
                  </span>
                </div>
              </div>

              <div className="revenue-content-grid single-column">
                <div className="revenue-card top-performers">
                  <div className="card-header">
                    <h3>Top Performing Shops</h3>
                    <span className="card-subtitle">Ranking by lifetime revenue</span>
                  </div>
                  {revenueMetrics.topPerformers.length === 0 ? (
                    <div className="empty-state subtle">
                      <i className="fas fa-chart-line"></i>
                      <h4>No revenue data</h4>
                      <p>Data will appear here once your shops report earnings.</p>
                    </div>
                  ) : (
                    <ul className="performer-list">
                      {revenueMetrics.topPerformers.map((shop, index) => {
                        const maxRevenue = revenueMetrics.topPerformers[0]?.totalRevenue || 1;
                        const progress = Math.min(
                          100,
                          Math.round((shop.totalRevenue / maxRevenue) * 100)
                        );
                        return (
                          <li key={shop.id ?? index}>
                            <div className="performer-rank">#{index + 1}</div>
                            <div className="performer-info">
                              <div className="performer-name">{shop.name}</div>
                              <div className="performer-meta">
                                <span>{shop.location}</span>
                                <span>{formatCurrency(shop.totalRevenue)}</span>
                              </div>
                              <div className="progress-track">
                                <div
                                  className="progress-bar"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className={`status-pill ${shop.status}`}>
                              {shop.status}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="revenue-card revenue-alerts">
                  <div className="card-header">
                    <h3>Insights & Alerts</h3>
                    <span className="card-subtitle">
                      Highlights to help you take the right next steps
                    </span>
                  </div>
                  {revenueMetrics.performanceAlerts.length === 0 ? (
                    <div className="insight-list">
                      <div className="insight-item positive">
                        <i className="fas fa-check-circle"></i>
                        <div>
                          <h4>All shops on track</h4>
                          <p>Revenue levels look healthy across your network.</p>
                        </div>
                      </div>
                      <div className="insight-item neutral">
                        <i className="fas fa-lightbulb"></i>
                        <div>
                          <h4>Monitor momentum</h4>
                          <p>
                            Keep tracking monthly trends to spot emerging leaders early.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="insight-list">
                      {revenueMetrics.performanceAlerts.map((alert, index) => (
                        <div key={alert.id ?? index} className="insight-item warning">
                          <i className="fas fa-exclamation-triangle"></i>
                          <div>
                            <h4>{alert.name}</h4>
                            <p>{alert.message}</p>
                            <div className="insight-meta">
                              <span>Monthly: {formatCurrency(alert.monthlyRevenue)}</span>
                              <span>Trend: {alert.trend.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              </>
              )}
            </section>
          )}

          {activePage === "sales" && (
            <section className="sales-dashboard">
              <div className="section-header">
                <div>
                  <h2>Sales Performance</h2>
                  <p>
                    Monitor product sales across all stores with detailed insights into
                    top performers, categories, and recent orders.
                  </p>
                </div>
                <div className="section-meta">
                  <span className="meta-pill">
                    <i className="fas fa-box"></i>
                    {salesMetrics.productsCount} Products
                  </span>
                  <span className="meta-pill">
                    <i className="fas fa-tags"></i>
                    {salesMetrics.categoriesCount} Categories
                  </span>
                  <span className="meta-pill">
                    <i className="fas fa-sync-alt"></i>
                    Updated {new Date().toLocaleDateString()}
                  </span>
                  <button
                    className="btn-refresh"
                    onClick={fetchSalesData}
                    disabled={salesLoading}
                    title="Refresh sales data"
                  >
                    <i className={`fas fa-sync-alt ${salesLoading ? 'fa-spin' : ''}`}></i>
                    {salesLoading ? 'Loading...' : 'Refresh Data'}
                  </button>
                </div>
              </div>
              
              {salesLoading && !salesData ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading sales data...</p>
                </div>
              ) : (
                <>

              <div className="sales-summary-grid">
                <div className="summary-card highlight">
                  <span className="summary-label">Total Units Sold</span>
                  <span className="summary-value">
                    {salesMetrics.totalSales}
                  </span>
                  <span className="summary-meta">
                    Across all products
                  </span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Sales Revenue</span>
                  <span className="summary-value">
                    {formatCurrency(salesMetrics.totalRevenue)}
                  </span>
                  <span className="summary-meta">
                    From product sales
                  </span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Average Sale Value</span>
                  <span className="summary-value">
                    {formatCurrency(salesMetrics.averageSaleValue)}
                  </span>
                  <span className="summary-meta">
                    Per unit sold
                  </span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Active Categories</span>
                  <span className="summary-value">
                    {salesMetrics.categoriesCount}
                  </span>
                  <span className="summary-meta">
                    Product categories
                  </span>
                </div>
              </div>

              <div className="sales-content-grid">
                <div className="sales-card top-products">
                  <div className="card-header">
                    <h3>Top Selling Products</h3>
                    <span className="card-subtitle">Most popular items across all shops</span>
                  </div>
                  {salesMetrics.topProducts.length === 0 ? (
                    <div className="empty-state subtle">
                      <i className="fas fa-shopping-cart"></i>
                      <h4>No product data</h4>
                      <p>Product sales information will appear here once available.</p>
                    </div>
                  ) : (
                    <ul className="product-list">
                      {salesMetrics.topProducts.map((product, index) => {
                        const maxSales = salesMetrics.topProducts[0]?.sales_count || 1;
                        const progress = Math.min(
                          100,
                          Math.round((product.sales_count / maxSales) * 100)
                        );
                        return (
                          <li key={product.id ?? index}>
                            <div className="product-rank">#{index + 1}</div>
                            <div className="product-info">
                              <div className="product-name">{product.name}</div>
                              <div className="product-meta">
                                <span className="product-category">{product.category}</span>
                                <span className="product-sales">{product.sales_count} units</span>
                                <span className="product-revenue">{formatCurrency(product.revenue)}</span>
                              </div>
                              <div className="progress-track">
                                <div
                                  className="progress-bar"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="product-shop">
                              <span className="shop-badge">{product.shop_name}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="sales-card recent-orders">
                  <div className="card-header">
                    <h3>Recent Orders</h3>
                    <span className="card-subtitle">Latest customer purchases</span>
                  </div>
                  {salesMetrics.recentOrders.length === 0 ? (
                    <div className="empty-state subtle">
                      <i className="fas fa-clock"></i>
                      <h4>No recent orders</h4>
                      <p>Order history will appear here as customers make purchases.</p>
                    </div>
                  ) : (
                    <div className="orders-list">
                      {salesMetrics.recentOrders.map((order) => (
                        <div key={order.id} className="order-item">
                          <div className="order-header">
                            <div className="customer-info">
                              <span className="customer-name">{order.customer_name}</span>
                              <span className="order-time">
                                {new Date(order.date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="order-details">
                            <span className="product-name">{order.product_name}</span>
                            <span className="shop-name">{order.shop_name}</span>
                            <span className="order-amount">{formatCurrency(order.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sales-card category-breakdown">
                  <div className="card-header">
                    <h3>Category Performance</h3>
                    <span className="card-subtitle">Sales breakdown by product category</span>
                  </div>
                  {Object.keys(salesMetrics.categoryBreakdown).length === 0 ? (
                    <div className="empty-state subtle">
                      <i className="fas fa-chart-pie"></i>
                      <h4>No category data</h4>
                      <p>Category information will appear as products are categorized.</p>
                    </div>
                  ) : (
                    <div className="category-grid">
                      {Object.entries(salesMetrics.categoryBreakdown).map(([category, data]) => {
                        const totalSales = Object.values(salesMetrics.categoryBreakdown)
                          .reduce((sum, cat) => sum + cat.total_sales, 0);
                        const percentage = totalSales > 0 ? (data.total_sales / totalSales) * 100 : 0;

                        return (
                          <div key={category} className="category-card">
                            <div className="category-header">
                              <h4>{category}</h4>
                              <span className="category-percentage">{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="category-metrics">
                              <div className="metric">
                                <span className="metric-label">Units</span>
                                <span className="metric-value">{data.total_sales}</span>
                              </div>
                              <div className="metric">
                                <span className="metric-label">Revenue</span>
                                <span className="metric-value">{formatCurrency(data.total_revenue)}</span>
                              </div>
                              <div className="metric">
                                <span className="metric-label">Products</span>
                                <span className="metric-value">{data.products}</span>
                              </div>
                            </div>
                            <div className="category-bar">
                              <div
                                className="category-bar-fill"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              </>
              )}
            </section>
          )}

          {activePage === "reports" && (
            <section className="reports-dashboard">
              <div className="section-header">
                <div>
                  <h2>Comprehensive Reports</h2>
                  <p>
                    Detailed analytics and performance reports across all your shops
                  </p>
                </div>
                <div className="section-meta">
                  <span className="meta-pill">
                    <i className="fas fa-store"></i>
                    {revenueMetrics.shopsCount} Stores
                  </span>
                  <span className="meta-pill">
                    <i className="fas fa-sync-alt"></i>
                    Updated {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="reports-summary-grid">
                <div className="summary-card highlight">
                  <span className="summary-label">Total Performance</span>
                  <span className="summary-value">
                    {reportsLoading ? '...' : formatCurrency(reportsData?.summary_stats?.total_revenue || revenueMetrics.totalRevenue)}
                  </span>
                  <span className="summary-meta">
                    Across {reportsData?.summary_stats?.total_shops || revenueMetrics.shopsCount} shops
                  </span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Active Shops</span>
                  <span className="summary-value">
                    {reportsLoading ? '...' : (reportsData?.summary_stats?.active_shops || revenueMetrics.activeShops)}
                  </span>
                  <span className="summary-meta">
                    {reportsData?.summary_stats?.inactive_shops || (revenueMetrics.shopsCount - revenueMetrics.activeShops)} inactive
                  </span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Monthly Growth</span>
                  <span className="summary-value">
                    {reportsLoading ? '...' : `${(reportsData?.summary_stats?.growth_percent || revenueMetrics.growthPercent) >= 0 ? '+' : ''}${Math.abs(reportsData?.summary_stats?.growth_percent || revenueMetrics.growthPercent || 0).toFixed(1)}%`}
                  </span>
                  <span className="summary-meta">
                    vs previous month
                  </span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Total Orders</span>
                  <span className="summary-value">
                    {reportsLoading ? '...' : (reportsData?.summary_stats?.total_orders || salesMetrics.totalSales)}
                  </span>
                  <span className="summary-meta">
                    Across all shops
                  </span>
                </div>
              </div>

              <div className="reports-content-grid">
                <div className="reports-card shop-performance">
                  <div className="card-header">
                    <h3>Shop Performance</h3>
                    <span className="card-subtitle">Revenue comparison by shop</span>
                  </div>
                  {reportsLoading ? (
                    <div className="empty-state subtle">
                      <i className="fas fa-spinner fa-spin"></i>
                      <h4>Loading shop data...</h4>
                      <p>Please wait</p>
                    </div>
                  ) : (reportsData?.shop_breakdown || normalizedShops).length === 0 ? (
                    <div className="empty-state subtle">
                      <i className="fas fa-chart-line"></i>
                      <h4>No shop data</h4>
                      <p>Data will appear when shops are added</p>
                    </div>
                  ) : (
                    <div className="performance-grid">
                      {(reportsData?.shop_breakdown || normalizedShops).map(shop => (
                        <div key={shop.shop_id || shop.id} className="performance-card">
                          <div className="performance-header">
                            <h4>{shop.shop_name || shop.name}</h4>
                            <span className={`status-pill ${shop.status}`}>
                              {shop.status}
                            </span>
                          </div>
                          <div className="performance-metrics">
                            <div className="metric">
                              <span>Monthly</span>
                              <span>{formatCurrency(shop.monthly_revenue || shop.monthlyRevenue)}</span>
                            </div>
                            <div className="metric">
                              <span>Lifetime</span>
                              <span>{formatCurrency(shop.total_revenue || shop.totalRevenue)}</span>
                            </div>
                            <div className="metric">
                              <span>Trend</span>
                              <span className={`trend ${shop.trend >= 0 ? 'up' : 'down'}`}>
                                {shop.trend >= 0 ? '+' : ''}{Math.abs(shop.trend || 0).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="reports-card recent-activity">
                  <div className="card-header">
                    <h3>Recent Orders</h3>
                    <span className="card-subtitle">Latest orders across shops</span>
                  </div>
                  {reportsLoading ? (
                    <div className="empty-state subtle">
                      <i className="fas fa-spinner fa-spin"></i>
                      <h4>Loading orders...</h4>
                      <p>Please wait</p>
                    </div>
                  ) : (reportsData?.recent_orders || salesMetrics.recentOrders).length === 0 ? (
                    <div className="empty-state subtle">
                      <i className="fas fa-clock"></i>
                      <h4>No recent orders</h4>
                      <p>Orders will appear as shops process them</p>
                    </div>
                  ) : (
                    <div className="activity-list">
                      {(reportsData?.recent_orders || salesMetrics.recentOrders).map(order => (
                        <div key={order.id} className="activity-item">
                          <div className="activity-icon">
                            <i className="fas fa-shopping-bag"></i>
                          </div>
                          <div className="activity-content">
                            <div className="activity-meta">
                              <span>{order.customer_name}</span>
                              <span>{order.shop_name}</span>
                              <span>{formatCurrency(order.amount)}</span>
                            </div>
                            <div className="activity-details">
                              <span>{order.product_name}</span>
                              {order.status && order.status.toLowerCase() !== 'pending' && (
                                <span className={`status ${order.status}`}>{order.status}</span>
                              )}
                            </div>
                            <div className="activity-time">
                              {order.date ? new Date(order.date).toLocaleString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="reports-card export-section">
                  <div className="card-header">
                    <h3>Export Reports</h3>
                    <span className="card-subtitle">Generate and download reports</span>
                  </div>
                  <div className="export-options">
                    <button className="export-btn" onClick={handleExportExcel}>
                      <i className="fas fa-file-excel"></i>
                      <span>Excel Report</span>
                    </button>
                    <button className="export-btn" onClick={handleExportPDF}>
                      <i className="fas fa-file-pdf"></i>
                      <span>PDF Summary</span>
                    </button>
                    <button className="export-btn" onClick={fetchReportsData}>
                      <i className="fas fa-sync-alt"></i>
                      <span>Refresh Data</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activePage === "settings" && (
            <section className="settings-dashboard">
              <div className="section-header">
                <div>
                  <h2>Settings & Preferences</h2>
                  <p>
                    Customize your dashboard experience and manage your shop preferences
                    with advanced configuration options.
                  </p>
                </div>
                <div className="section-meta">
                  <span className="meta-pill">
                    <i className="fas fa-cog"></i>
                    Advanced Settings
                  </span>
                  <span className="meta-pill">
                    <i className="fas fa-sync-alt"></i>
                    Auto-save enabled
                  </span>
                </div>
              </div>

              <div className="settings-content-grid">
                {/* Dashboard Preferences */}
                <div className="settings-card">
                  <div className="card-header">
                    <h3>
                      <i className="fas fa-tachometer-alt"></i>
                      Dashboard Preferences
                    </h3>
                    <span className="card-subtitle">Customize your dashboard experience</span>
                  </div>
                  <div className="settings-group">
                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Default View</label>
                        <span className="setting-description">Choose which page to show when you log in</span>
                      </div>
                      <select
                        className="setting-select"
                        value={settings.dashboard.defaultView}
                        onChange={(e) => handleSettingsChange('dashboard', 'defaultView', e.target.value)}
                      >
                        <option value="shops">My Shops</option>
                        <option value="revenue">Revenue</option>
                        <option value="sales">Sales</option>
                        <option value="reports">Reports</option>
                      </select>
                    </div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Show Welcome Section</label>
                        <span className="setting-description">Display welcome message and quick stats</span>
                      </div>
                      <label className="setting-toggle">
                        <input
                          type="checkbox"
                          checked={settings.dashboard.showWelcomeSection}
                          onChange={(e) => handleSettingsChange('dashboard', 'showWelcomeSection', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Compact Mode</label>
                        <span className="setting-description">Reduce spacing for more content visibility</span>
                      </div>
                      <label className="setting-toggle">
                        <input
                          type="checkbox"
                          checked={settings.dashboard.compactMode}
                          onChange={(e) => handleSettingsChange('dashboard', 'compactMode', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Auto Refresh</label>
                        <span className="setting-description">Automatically refresh dashboard data</span>
                      </div>
                      <label className="setting-toggle">
                        <input
                          type="checkbox"
                          checked={settings.dashboard.autoRefresh}
                          onChange={(e) => handleSettingsChange('dashboard', 'autoRefresh', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="settings-card">
                  <div className="card-header">
                    <h3>
                      <i className="fas fa-bell"></i>
                      Notifications
                    </h3>
                    <span className="card-subtitle">Manage your notification preferences</span>
                  </div>
                  <div className="settings-group">
                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Email Alerts</label>
                        <span className="setting-description">Receive important updates via email</span>
                      </div>
                      <label className="setting-toggle">
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailAlerts}
                          onChange={(e) => handleSettingsChange('notifications', 'emailAlerts', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Push Notifications</label>
                        <span className="setting-description">Browser push notifications for urgent alerts</span>
                      </div>
                      <label className="setting-toggle">
                        <input
                          type="checkbox"
                          checked={settings.notifications.pushNotifications}
                          onChange={(e) => handleSettingsChange('notifications', 'pushNotifications', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Shop Updates</label>
                        <span className="setting-description">Notifications for shop status changes</span>
                      </div>
                      <label className="setting-toggle">
                        <input
                          type="checkbox"
                          checked={settings.notifications.shopUpdates}
                          onChange={(e) => handleSettingsChange('notifications', 'shopUpdates', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Revenue Alerts</label>
                        <span className="setting-description">Get notified about revenue milestones</span>
                      </div>
                      <label className="setting-toggle">
                        <input
                          type="checkbox"
                          checked={settings.notifications.revenueAlerts}
                          onChange={(e) => handleSettingsChange('notifications', 'revenueAlerts', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Appearance */}
                <div className="settings-card">
                  <div className="card-header">
                    <h3>
                      <i className="fas fa-palette"></i>
                      Appearance
                    </h3>
                    <span className="card-subtitle">Customize the look and feel</span>
                  </div>
                  <div className="settings-group">
                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Theme</label>
                        <span className="setting-description">Choose your preferred color scheme</span>
                      </div>
                      <select
                        className="setting-select"
                        value={settings.appearance.theme}
                        onChange={(e) => handleSettingsChange('appearance', 'theme', e.target.value)}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Font Size</label>
                        <span className="setting-description">Adjust text size for better readability</span>
                      </div>
                      <select
                        className="setting-select"
                        value={settings.appearance.fontSize}
                        onChange={(e) => handleSettingsChange('appearance', 'fontSize', e.target.value)}
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Show Animations</label>
                        <span className="setting-description">Enable smooth transitions and animations</span>
                      </div>
                      <label className="setting-toggle">
                        <input
                          type="checkbox"
                          checked={settings.appearance.showAnimations}
                          onChange={(e) => handleSettingsChange('appearance', 'showAnimations', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Shop Management */}
                <div className="settings-card">
                  <div className="card-header">
                    <h3>
                      <i className="fas fa-store-alt"></i>
                      Shop Management
                    </h3>
                    <span className="card-subtitle">Configure shop-related settings</span>
                  </div>
                  <div className="settings-group">
                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Auto Backup</label>
                        <span className="setting-description">Automatically backup shop data</span>
                      </div>
                      <label className="setting-toggle">
                        <input
                          type="checkbox"
                          checked={settings.shopManagement.autoBackup}
                          onChange={(e) => handleSettingsChange('shopManagement', 'autoBackup', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Export Format</label>
                        <span className="setting-description">Default format for data exports</span>
                      </div>
                      <select
                        className="setting-select"
                        value={settings.shopManagement.exportFormat}
                        onChange={(e) => handleSettingsChange('shopManagement', 'exportFormat', e.target.value)}
                      >
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                        <option value="pdf">PDF</option>
                      </select>
                    </div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Data Retention</label>
                        <span className="setting-description">How long to keep historical data (days)</span>
                      </div>
                      <select
                        className="setting-select"
                        value={settings.shopManagement.dataRetention}
                        onChange={(e) => handleSettingsChange('shopManagement', 'dataRetention', parseInt(e.target.value))}
                      >
                        <option value={90}>90 days</option>
                        <option value={180}>180 days</option>
                        <option value={365}>1 year</option>
                        <option value={730}>2 years</option>
                      </select>
                    </div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <label className="setting-label">Multi-Shop View</label>
                        <span className="setting-description">Enable advanced multi-shop management features</span>
                      </div>
                      <label className="setting-toggle">
                        <input
                          type="checkbox"
                          checked={settings.shopManagement.multiShopView}
                          onChange={(e) => handleSettingsChange('shopManagement', 'multiShopView', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Actions */}
              <div className="settings-actions">
                <button className="settings-btn primary" onClick={handleSaveSettings}>
                  <i className="fas fa-save"></i>
                  Save All Settings
                </button>
                <button className="settings-btn secondary" onClick={handleResetSettings}>
                  <i className="fas fa-undo"></i>
                  Reset to Defaults
                </button>
              </div>
            </section>
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

export default ShopSelectorPage;