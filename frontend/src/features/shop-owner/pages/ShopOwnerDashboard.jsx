/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/utils/api";
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaTimes, FaSave, FaPlus, FaStore, FaMapMarkerAlt, FaUserAlt, FaPhoneAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import "@/features/shop-owner/styles/shop-owner-selector.css";
function ShopSelectorPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [editingShop, setEditingShop] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activePage = searchParams.get('tab') || 'shops';
  const [shopFormData, setShopFormData] = useState({ 
    name: '', 
    location: '',
    owner_name: '',
    owner_mobile: '',
    email: ''
  });
  const [otpModal, setOtpModal] = useState({
    isOpen: false,
    shop: null,
    mobile: '',
    otp: '',
    step: 'mobile'
  });
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [selectedShopForStatus, setSelectedShopForStatus] = useState(null);
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Get owner_id from localStorage
  const owner_id = localStorage.getItem("owner_id");
  const ownerName = localStorage.getItem("owner_name"); // We should save this during login

  // Resend OTP cooldown effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setResendCooldown(30); // 30 second cooldown
    await handleOtpRequest();
  };

  // State for navigation loading and errors
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationError, setNavigationError] = useState(null);

  // Function to handle dashboard redirection
  const handleDashboardClick = async (shopId) => {
    if (!shopId) {
      toast.error("Invalid shop selection");
      return;
    }

    setIsNavigating(true);
    setNavigationError(null);

    try {
      // Verify shop status before navigation
      const shop = shops.find(s => s.id === shopId);
      
      if (!shop) {
        throw new Error('Shop not found');
      }

      if (shop.status !== 'active') {
        throw new Error('This shop is not currently active');
      }

      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to the shop-specific dashboard
      navigate(`/shop-dashboard/${shopId}`);
    } catch (error) {
      console.error('Error navigating to dashboard:', error);
      setNavigationError(error.message);
      toast.error(`Failed to open dashboard: ${error.message}`);
    } finally {
      setIsNavigating(false);
    }
  };

  useEffect(() => {
    if (!owner_id) {
      navigate("/owner-login");
      return;
    }
    fetchShops();
    checkCompanyAdmin();
  }, [owner_id, navigate]);

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

      // Debug: Check if storeman data is included
      shopsData.forEach((shop, index) => {
        console.log(`Shop ${index}:`, shop);
        console.log(`Shop ${index} storeman:`, shop.storeman);
      });

      setShops(shopsData);
    } catch (error) {
      toast.error(error.message); // Show user-friendly error message
      console.error("Failed to fetch shops:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectShop = (shop, isStoremanLogin = true) => {
    console.log("🔍 Shop selected:", shop);
    console.log("🔍 Storeman login requested:", isStoremanLogin);

    if (isStoremanLogin && shop.storeman && shop.storeman.mobile) {
      console.log("✅ Opening OTP modal for storeman:", shop.storeman.mobile);
      // Open enhanced OTP login modal for storeman
      setOtpModal({
        isOpen: true,
        shop: shop,
        mobile: shop.storeman.mobile,
        otp: '',
        step: 'mobile'
      });
      console.log("✅ Modal state updated");
    } else if (shop.storeman && shop.storeman.mobile) {
      console.log("✅ Opening OTP modal for storeman:", shop.storeman.mobile);
      // Open enhanced OTP login modal for storeman
      setOtpModal({
        isOpen: true,
        shop: shop,
        mobile: shop.storeman.mobile,
        otp: '',
        step: 'mobile' 
      });
      console.log("✅ Modal state updated");
    } else { 
      console.log("❌ No storeman found for shop");
      // If no storeman, show message that storeman is required
      toast.info("This shop requires a storeman for access. Please contact your administrator to assign a storeman.");
    }
  };

  const handleOtpRequest = async () => {
    console.log("Storeman OTP Request - Mobile:", otpModal.mobile);
    if (!otpModal.mobile) {
      toast.error("Mobile number is required");
      return;
    }

    // Basic mobile number validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(otpModal.mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsOtpLoading(true);
    try {
      console.log("Sending storeman OTP request...");
      const response = await authService.requestOTP(otpModal.mobile, 'storeman');
      console.log("Storeman OTP request successful, changing to OTP step");

      if (!response) {
        throw new Error("Invalid response from server");
      }

      setOtpModal(prev => ({ ...prev, step: 'otp' }));
      toast.success("OTP sent to your mobile number for storeman verification");
    } catch (error) {
      console.error("Storeman OTP request failed:", error);
      toast.error(error.message || "Failed to send storeman OTP. Please try again.");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    console.log("OTP Verify - Mobile:", otpModal.mobile, "OTP:", otpModal.otp);

    // Validation
    if (!otpModal.otp || otpModal.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!otpModal.mobile) {
      toast.error("Mobile number is missing. Please try again.");
      return;
    }

    if (!otpModal.shop || !otpModal.shop.id) {
      toast.error("Shop information is missing. Please try again.");
      return;
    }

    setIsOtpLoading(true);
    try {
      console.log("Verifying OTP for storeman...");
      const response = await authService.verifyOTP(otpModal.mobile, otpModal.otp, 'storeman');
      console.log("Storeman OTP verification response:", response);

      // Validate response structure
      if (!response) {
        throw new Error("Invalid response from server");
      }

      // Get storeman data from the shop's storeman object
      const storemanData = otpModal.shop.storeman;
      if (!storemanData || !storemanData.id) {
        throw new Error("Storeman credentials not found for this shop");
      }

      // Ensure the storeman is associated with the correct shop
      if (storemanData.shop_id && storemanData.shop_id !== otpModal.shop.id) {
        console.warn("Storeman shop ID mismatch:", storemanData.shop_id, otpModal.shop.id);
      }

      // Store storeman authentication data
      localStorage.setItem("selectedStoreId", String(otpModal.shop.id));
      localStorage.setItem("storeman_id", storemanData.id);
      localStorage.setItem("storeman_name", storemanData.name || 'Store Manager');
      localStorage.setItem("storeman_mobile", otpModal.mobile);
      localStorage.setItem("auth_type", "storeman");
      localStorage.setItem("store_name", otpModal.shop.name || 'Store');

      // Show welcome message
      const storeName = otpModal.shop.name || 'the store';
      toast.success(`Welcome back, ${storemanData.name || 'Store Manager'}!`);

      // Close modal and navigate
      closeOtpModal();
      console.log("Storeman authentication successful, navigating to dashboard...");
      
      // Force a page reload to ensure all context is properly initialized
      window.location.href = '/dashboard';
    } catch (error) {
      console.error("Storeman OTP verification failed:", error);

      // Provide specific error messages for storeman authentication
      let errorMessage = "Storeman authentication failed. Please try again.";

      if (error.message) {
        if (error.message.includes("Invalid OTP")) {
          errorMessage = "Invalid OTP. Please check and try again.";
        } else if (error.message.includes("expired")) {
          errorMessage = "OTP has expired. Please request a new one.";
        } else if (error.message.includes("Storeman") || error.message.includes("storeman")) {
          errorMessage = error.message; // Use the specific storeman error message
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsOtpLoading(false);
    }
  };

  const closeOtpModal = () => {
    console.log("🔒 Closing OTP modal");
    setOtpModal({ isOpen: false, shop: null, mobile: '', otp: '', step: 'mobile' });
  };

  const goBackToMobileStep = () => {
    console.log("🔄 Going back to mobile step");
    setOtpModal(prev => ({ ...prev, step: 'mobile', otp: '' }));
  };

  const handleUpdateShopStatus = async (shopId, newStatus) => {
    try {
      await authService.updateShopStatus(shopId, { status: newStatus });
      toast.success(`Shop status updated to ${newStatus}`);
      fetchShops();
      setSelectedShopForStatus(null);
    } catch (error) {
      toast.error(error.message);
      console.error("Failed to update shop status:", error);
    }
  };

  const handleShopStatusClick = (shop) => {
    setSelectedShopForStatus(shop);
  };

  const handleAddShop = async (e) => {
    e.preventDefault();
    const formData = {
      name: e.target.name.value,
      location: e.target.address.value,
      owner_id: parseInt(owner_id),
      owner_name: e.target.owner_name.value,
      owner_mobile: e.target.owner_mobile.value,
      email: e.target.email.value
    };

    // Basic validation
    if (!formData.name || !formData.location || !formData.owner_name || !formData.owner_mobile) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Mobile number validation for owner
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.owner_mobile)) {
      toast.error("Please enter a valid 10-digit owner mobile number");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.createShop(formData);
      toast.success("Outlet added successfully!");
      fetchShops();
      setIsAddShopModalOpen(false);
      e.target.reset();
    } catch (error) {
      console.error("Failed to create outlet:", error);
      toast.error(error.message || "Failed to add outlet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditShop = (shop) => {
    setEditingShop(shop.id);
    setShopFormData({
      name: shop.name,
      location: shop.location || '',
      owner_name: shop.owner_name || '',
      owner_mobile: shop.owner_mobile || '',
      email: shop.email || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingShop(null);
    setShopFormData({ 
      name: '', 
      location: '',
      owner_name: '',
      owner_mobile: '',
      email: ''
    });
  };

  const handleUpdateShop = async (e, shopId) => {
    e.preventDefault();
    try {
      const response = await authService.updateShop(shopId, {
        ...shopFormData,
        owner_id: parseInt(owner_id)
      });
      toast.success(response.message);
      setEditingShop(null);
      fetchShops();
    } catch (error) {
      toast.error(error.message);
      console.error("Failed to update shop:", error);
    }
  };

  const handleDeleteShop = async (shopId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this shop? This action cannot be undone.")) {
      try {
        const response = await authService.deleteShop(shopId);
        toast.success(response.message);
        fetchShops();
      } catch (error) {
        toast.error(error.message);
        console.error("Failed to delete shop:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setShopFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/owner-login");
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
          >
            <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
          </button>
          <h1>StoreHub</h1>
        </div>
        <div className="header-right">
          <span className="user-info">
            <i className="fas fa-user-circle"></i>
            <span className="user-name">{ownerName}</span>
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span className="btn-text">Logout</span>
          </button>
        </div>
      </header>

      <div className="main-container">
        {/* Sidebar */}
        <aside className={`sidebar ${!isSidebarOpen ? 'hidden' : ''}`}>
          <nav className="sidebar-nav">
            <button 
              className={activePage === "dashboard" ? "active" : ""}
              onClick={() => {
                // Set the first available shop as selected for dashboard access
                if (shops.length > 0) {
                  const firstShop = shops[0];
                  const selectedStoreId = String(firstShop.id);
                  localStorage.setItem("selectedStoreId", selectedStoreId);
                  localStorage.setItem("store_name", firstShop.name);
                  navigate('/dashboard');
                  // Automatically set selectedStoreId for shop owner's access
                  setSelectedStoreId(selectedStoreId);
                } else {
                  toast.info("Please create a shop first to access the dashboard");
                }
              }}
            >
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </button>
            <button 
              className={activePage === "shops" ? "active" : ""}
              onClick={() => handleNavClick("shops")}
            >
              <i className="fas fa-store"></i>
              <span>My Shops</span>
            </button>
            <button 
              className={activePage === "add-shop" ? "active" : ""}
              onClick={() => handleNavClick("add-shop")}
            >
              <i className="fas fa-plus-circle"></i>
              <span>New Outlet</span>
            </button>
            {isCompanyAdmin && (
              <button
                className={activePage === "admin" ? "active" : ""}
                onClick={() => handleNavClick("admin")}
              >
                <i className="fas fa-cog"></i>
                <span>Admin</span>
              </button>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {activePage === "shops" && (
            <div className="shops-container">
              <div className="shops-section">
                <div className="shops-header">
                  <h2>
                    <i className="fas fa-store"></i>
                    Your Shops
                  </h2>
                  {/* <button 
                    className="add-shop-button"
                    onClick={() => {
                      setFormStep(1);
                      setFormData({
                        name: '',
                        location: '',
                        storeman_name: '',
                        storeman_mobile: '',
                        shopType: 'retail',
                        businessHours: {
                          open: '09:00',
                          close: '21:00',
                          days: [1, 2, 3, 4, 5, 6]
                        },
                        additionalInfo: ''
                      });
                      setIsAddShopModalOpen(true);
                    }}
                  >
                    <FaPlus /> Add New Shop
                  </button> */}
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
                        <div className="skeleton-storeman">
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
                  <p>Contact your administrator to assign shops to your account.</p>
                  <button onClick={() => handleNavClick("add-shop")}>
                    <i className="fas fa-plus"></i>
                    Add New Outlet
                  </button>
                </div>
              ) : (
                <div className="shop-cards">
                  {shops.map((shop) => (
                    <div key={shop.id} className="shop-card">
                      {editingShop === shop.id ? (
                        <div className="shop-edit-form">
                          <input
                            type="text"
                            name="name"
                            value={shopFormData.name}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Shop Name"
                          />
                          <input
                            type="text"
                            name="location"
                            value={shopFormData.location}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Location"
                          />
                          <input
                            type="text"
                            name="owner_name"
                            value={shopFormData.owner_name}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Owner Name"
                          />
                          <input
                            type="text"
                            name="owner_mobile"
                            value={shopFormData.owner_mobile}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Owner Mobile Number"
                            maxLength="10"
                          />
                          <input
                            type="email"
                            name="email"
                            value={shopFormData.email}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Email (Optional)"
                          />
                          <div className="form-actions">
                            <button 
                              type="button" 
                              className="btn-save"
                              onClick={(e) => handleUpdateShop(e, shop.id)}
                            >
                              <FaSave /> Save
                            </button>
                            <button 
                              type="button" 
                              className="btn-cancel"
                              onClick={handleCancelEdit}
                            >
                              <FaTimes /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
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
                            {shop.storeman && (
                              <p className="storeman-info">
                                <i className="fas fa-user-tie"></i>
                                Storeman: {shop.storeman.name}
                              </p>
                            )}
                            <div className="shop-actions">
                              <button 
                                className={`btn-dashboard ${isNavigating ? 'btn-loading' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isNavigating) {
                                    handleDashboardClick(shop.id);
                                  }
                                }}
                                disabled={isNavigating}
                                title={isNavigating ? 'Opening dashboard...' : 'Open Shop Dashboard'}
                              >
                                {isNavigating ? (
                                  <span className="loading-spinner"></span>
                                ) : (
                                  <i className="fas fa-tachometer-alt"></i>
                                )}
                              </button>
                              <button 
                                className="btn-edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditShop(shop);
                                }}
                                title="Edit shop"
                                disabled={isNavigating}
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="btn-delete"
                                onClick={(e) => !isNavigating && handleDeleteShop(shop.id, e)}
                                title="Delete shop"
                                disabled={isNavigating}
                              >
                                <FaTrash />
                              </button>
                            </div>
                            {navigationError && (
                              <div className="error-message">
                                {navigationError}
                              </div>
                            )}
                            <button
                              className="view-dashboard"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("🔘 Access Shop button clicked for shop:", shop.name);
                                handleSelectShop(shop); // This will trigger storeman login by default
                              }}
                              disabled={shop.status !== 'active' || !shop.storeman}
                              title={!shop.storeman ? "Storeman required for access" : shop.status !== 'active' ? "Shop is not active" : "Access shop via storeman login"}
                            >
                              {shop.storeman ? 'Access Shop' : 'Storeman Required'}
                              <i className="fas fa-arrow-right"></i>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          )}

          {/* Test Modal Button - Remove in production
          <button
            onClick={() => {
              console.log("🧪 Test modal button clicked");
              setOtpModal({
                isOpen: true,
                shop: { name: 'Test Shop', location: 'Test Location', status: 'active' },
                mobile: '1234567890',
                otp: '',
                step: 'mobile'
              });
            }}
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '20px',
              zIndex: 9999,
              padding: '10px 20px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🧪 Test Modal
          </button> */}

          {activePage === "add-shop" && (
            <div className="add-shop-form">
              <h2>
                <i className="fas fa-plus-circle"></i>
                Add New Outlet
              </h2>
              <p className="form-description">Create a new outlet/location within your shop for better management.</p>
              <form onSubmit={handleAddShop}>
                <div className="form-group">
                  <label>
                    <i className="fas fa-store"></i>
                    Outlet Name<span className="required">*</span>
                  </label>
                  <input 
                    name="name" 
                    type="text" 
                    placeholder="Enter outlet name"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-map-marker-alt"></i>
                    Location<span className="required">*</span>
                  </label>
                  <input 
                    name="address" 
                    type="text" 
                    placeholder="Enter outlet location"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-user"></i>
                    Owner Name <span className="required">*</span>
                  </label>
                  <input
                    name="owner_name"
                    type="text"
                    placeholder="Enter owner name"
                    required
                    minLength="3"
                    maxLength="50"
                    pattern="^[A-Za-z\s]{3,50}$"
                    title="Please enter a valid name (only alphabets and spaces, 3-50 characters)"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-mobile-alt"></i>
                    Owner Mobile Number <span className="required">*</span>
                  </label>
                  <input
                    name="owner_mobile"
                    type="tel"
                    placeholder="Enter owner mobile number"
                    required
                    minLength="10"
                    maxLength="10"
                    pattern="^[6-9]\d{9}$"
                    title="Phone number must start with 6-9 (e.g., 9876543210)"
                    value={shopFormData.owner_mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                      // 🚫 BLOCK: Prevent input if first digit is 1-5
                      if (value.length > 0 && /^[1-5]/.test(value.charAt(0))) {
                        return; // Don't update state if first digit is invalid
                      }
                      if (value.length <= 10) {
                        setShopFormData(prev => ({ ...prev, owner_mobile: value }));
                      }
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-envelope"></i>
                    Email (Optional)
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    Create Outlet
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => handleNavClick("shops")}
                  >
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {isMobile && isSidebarOpen && (
        <div 
          className="overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Modern Storeman Login Form - Clean & Elegant */}
      {otpModal.isOpen && (
        <div className="storeman-modal-overlay" onClick={closeOtpModal}>
          <div className="storeman-modal" onClick={(e) => e.stopPropagation()}>
            {/* Clean Header */}
            <div className="modal-header">
              <div className="header-content">
                <div className="header-icon">
                  <i className="fas fa-user-shield"></i>
                </div>
                <div className="header-text">
                  <h3>Store Access</h3>
                  <p>Login to {otpModal.shop?.name}</p>
                </div>
              </div>
              <button className="modal-close" onClick={closeOtpModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Store Info Card */}
            <div className="store-info">
              <div className="store-icon">
                <i className="fas fa-store"></i>
              </div>
              <div className="store-details">
                <h4>{otpModal.shop?.name}</h4>
                <p>{otpModal.shop?.location}</p>
                {otpModal.shop?.storeman && (
                  <div className="storeman-info">
                    <i className="fas fa-user-tie"></i>
                    <span>{otpModal.shop.storeman.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Clean Content Area */}
            <div className="modal-content">
              {otpModal.step === 'mobile' ? (
                <div className="auth-step">
                  <div className="step-header">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Enter Mobile Number</h4>
                      <p>We'll send you a verification code</p>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Mobile Number</label>
                    <div className="input-wrapper">
                      <span className="country-code">+91</span>
                      <input
                        type="tel"
                        value={otpModal.mobile}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          if (value.length <= 10) {
                            setOtpModal(prev => ({ ...prev, mobile: value }));
                          }
                        }}
                        placeholder="Enter mobile number"
                        className="mobile-input"
                        maxLength={10}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="button-group">
                    <button className="btn-secondary" onClick={closeOtpModal}>
                      Cancel
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handleOtpRequest}
                      disabled={isOtpLoading || !otpModal.mobile || otpModal.mobile.length !== 10}
                    >
                      {isOtpLoading ? 'Sending...' : 'Send Code'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="auth-step">
                  <div className="step-header">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Enter Verification Code</h4>
                      <p>Sent to +91 {otpModal.mobile}</p>
                    </div>
                  </div>

                  <div className="otp-section">
                    <div className="otp-input-wrapper">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={otpModal.otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          if (value.length <= 6) {
                            setOtpModal(prev => ({ ...prev, otp: value }));
                          }
                        }}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        disabled={isOtpLoading}
                        className="otp-input"
                        autoFocus
                      />
                    </div>

                    <div className="otp-display">
                      {[...Array(6)].map((_, index) => (
                        <div
                          key={index}
                          className={`otp-digit ${index < otpModal.otp.length ? 'filled' : ''}`}
                        >
                          {otpModal.otp[index] || ''}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="resend-section">
                    {resendCooldown > 0 ? (
                      <div className="cooldown">Resend in {resendCooldown}s</div>
                    ) : (
                      <button className="resend-btn" onClick={handleResendOtp}>
                        Resend Code
                      </button>
                    )}
                  </div>

                  <div className="button-group">
                    <button className="btn-secondary" onClick={goBackToMobileStep}>
                      Back
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handleOtpVerify}
                      disabled={!otpModal.otp || otpModal.otp.length !== 6 || isOtpLoading}
                    >
                      {isOtpLoading ? 'Verifying...' : 'Login'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopSelectorPage;