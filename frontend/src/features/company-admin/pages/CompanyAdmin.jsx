/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { authService } from "@/utils/api";
import "@/features/company-admin/styles/company-admin.css";
import "@/features/company-admin/styles/shop-management.css";
import { FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";

// Status Badge Component
const StatusBadge = ({ status, onChange }) => {
  const statusConfig = {
    active: { label: 'Active', className: 'status-active' },
    inactive: { label: 'Inactive', className: 'status-inactive' },
    suspended: { label: 'Suspended', className: 'status-suspended' },
  };
  
  const config = statusConfig[status?.toLowerCase()] || { label: status || 'Unknown', className: 'status-default' };
  
  return (
    <div className="status-badge-container">
      <span className={`status-badge ${config.className}`}>
        {config.label}
        {onChange && <FiChevronDown className="ml-1" size={12} />}
      </span>
      {onChange && (
        <div className="status-dropdown">
          {Object.entries(statusConfig).map(([key, { label, className }]) => (
            <div 
              key={key}
              className={`status-option ${className}`}
              onClick={() => onChange(key)}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default function CompanyAdmin() {
  // State for owners
  const [owners, setOwners] = useState([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  
  // State for shops
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [shopSearchTerm, setShopSearchTerm] = useState('');
  const [shopStatusFilter, setShopStatusFilter] = useState('all');
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    address: "",
  });
  
  // Shop form state
  const [shopFormData, setShopFormData] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
  });
  
  // Get active tab from URL or default to 'dashboard'
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingOwner, setEditingOwner] = useState(null);
  
  // Stats state
  const [stats, setStats] = useState({
    totalShops: 0,
    activeShops: 0,
    totalOwners: 0,
  });

  // Fetch owners
  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await authService.getOwners();
      const ownersData = Array.isArray(response.data) ? response.data : [];
      setOwners(ownersData);

      // If no owner is selected, select the first one by default
      if (ownersData.length > 0 && !selectedOwnerId) {
        setSelectedOwnerId(ownersData[0].id);
      }

      // Update stats with the new owners data
      updateAllShopsStats([], ownersData.length);

      return ownersData;
    } catch (error) {
      setError(error.message);
      console.error('Error fetching owners:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch shops for selected owner
  const fetchShops = async (ownerId) => {
    if (!ownerId) return;
    
    try {
      setLoading(true);
      const response = await authService.getShops(ownerId);
      const shopsData = Array.isArray(response.data) ? response.data : [];
      setShops(shopsData);
      setFilteredShops(shopsData);
      updateShopStats(shopsData);
      return shopsData;
    } catch (error) {
      setError('Failed to fetch shops: ' + error.message);
      console.error('Error fetching shops:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Update shop statistics
  const updateShopStats = (shopsList) => {
    const totalShops = shopsList.length;
    const activeShops = shopsList.filter(shop => shop.status === 'active').length;
    const inactiveShops = shopsList.filter(shop => shop.status === 'inactive').length;
    const suspendedShops = shopsList.filter(shop => shop.status === 'suspended').length;

    setStats({
      totalShops,
      activeShops,
      inactiveShops,
      suspendedShops,
      totalOwners: owners.length
    });
  };

  // Fetch all shops across all owners for reports
  const fetchAllShops = async () => {
    try {
      setLoading(true);
      const response = await authService.getOwners();
      const allOwners = Array.isArray(response.data) ? response.data : [];

      let allShops = [];
      let totalOwners = allOwners.length;

      // Fetch shops for each owner
      for (const owner of allOwners) {
        try {
          const shopsResponse = await authService.getShops(owner.id);
          const ownerShops = Array.isArray(shopsResponse.data) ? shopsResponse.data : [];
          allShops = allShops.concat(ownerShops);
        } catch (error) {
          console.error(`Error fetching shops for owner ${owner.id}:`, error);
        }
      }

      // Update stats with all shops data
      updateAllShopsStats(allShops, totalOwners);

      return { allShops, totalOwners };
    } catch (error) {
      console.error('Error fetching all shops:', error);
      return { allShops: [], totalOwners: 0 };
    } finally {
      setLoading(false);
    }
  };

  // Update stats with all shops data
  const updateAllShopsStats = (allShops, totalOwners) => {
    const totalShops = allShops.length;
    const activeShops = allShops.filter(shop => shop.status === 'active').length;
    const inactiveShops = allShops.filter(shop => shop.status === 'inactive').length;
    const suspendedShops = allShops.filter(shop => shop.status === 'suspended').length;

    setStats({
      totalShops,
      activeShops,
      inactiveShops,
      suspendedShops,
      totalOwners
    });
  };

  // Update shop status
  const updateShopStatus = async (shopId, newStatus) => {
    try {
      setLoading(true);

      // Get the shop details before updating
      const shop = shops.find(s => s.id === shopId);
      const oldStatus = shop?.status;

      // Call your API to update the status
      const response = await authService.updateShopStatus(shopId, { status: newStatus });

      // Update the shop in the local state
      const updatedShops = shops.map(shop =>
        shop.id === shopId ? { ...shop, status: newStatus, updated_at: new Date().toISOString() } : shop
      );

      setShops(updatedShops);
      setFilteredShops(updatedShops);
      updateShopStats(updatedShops);

      // If currently on reports tab, refresh all shops data for accurate counts
      if (activeTab === 'reports') {
        await fetchAllShops();
      }

      // Send notifications based on status change
      if (oldStatus !== newStatus) {
        await handleStatusChangeNotification(shop, oldStatus, newStatus);
      }

      // Show success message
      alert(`Shop status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating shop status:', error);
      alert('Failed to update shop status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle status change notifications
  const handleStatusChangeNotification = async (shop, oldStatus, newStatus) => {
    try {
      const shopOwner = shop ? { id: shop.owner_id, name: shop.owner_name || 'Shop Owner' } : null;

      if (newStatus === 'inactive' && oldStatus === 'active') {
        // Send warning message to shop owner
        await sendNotificationToShopOwner(shopOwner, 'warning', shop);
      } else if (newStatus === 'suspended') {
        // Send suspension notification and trigger logout
        await sendNotificationToShopOwner(shopOwner, 'suspended', shop);
        await triggerShopOwnerLogout(shopOwner);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Send notification to shop owner
  const sendNotificationToShopOwner = async (shopOwner, type, shop) => {
    if (!shopOwner) return;

    try {
      const message = type === 'warning'
        ? `⚠️ Warning: Your shop "${shop?.name}" has been set to inactive status by the admin. Please contact support if you need assistance.`
        : `🚫 Suspension Notice: Your shop "${shop?.name}" has been suspended. You have been logged out for security reasons. Please contact the admin for reactivation.`;

      // Call API to send notification
      await authService.sendNotification({
        recipient_id: shopOwner.id,
        recipient_type: 'owner',
        type: type === 'warning' ? 'status_warning' : 'status_suspended',
        message: message,
        shop_id: shop?.id
      });

      console.log(`Notification sent to shop owner ${shopOwner.name}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Trigger shop owner logout
  const triggerShopOwnerLogout = async (shopOwner) => {
    try {
      // Call API to force logout shop owner
      await authService.forceLogoutShopOwner(shopOwner.id);

      // Also trigger logout in all open browser tabs/windows for this owner
      // This can be done via WebSocket or by setting a flag in localStorage that the dashboard checks
      localStorage.setItem(`shop_suspended_${shopOwner.id}`, Date.now());

      console.log(`Logout triggered for shop owner ${shopOwner.name}`);
    } catch (error) {
      console.error('Error triggering logout:', error);
    }
  };

  // Filter shops based on search term and status
  const filterShops = (searchTerm = shopSearchTerm, statusFilter = shopStatusFilter) => {
    setShopSearchTerm(searchTerm);
    setShopStatusFilter(statusFilter);
    
    const filtered = shops.filter(shop => {
      const matchesSearch = searchTerm === '' || 
                         (shop.name && shop.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (shop.location && shop.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (shop.street && shop.street.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (shop.city && shop.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (shop.state && shop.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (shop.gstin && shop.gstin.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || shop.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    setFilteredShops(filtered);
    updateShopStats(filtered);
  };

  // Handle owner selection change
  const handleOwnerChange = async (e) => {
    const ownerId = e.target.value;
    setSelectedOwnerId(ownerId);
    await fetchShops(ownerId);
  };
  
  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      const ownersData = await fetchOwners();
      if (ownersData.length > 0) {
        await fetchShops(ownersData[0].id);
      }
    };

    initializeData();
  }, []);

  // Ensure stats are updated when dashboard tab is accessed
  useEffect(() => {
    if (activeTab === 'dashboard') {
      // Ensure we have the latest data for dashboard display
      const loadDashboardData = async () => {
        if (owners.length === 0) {
          await fetchOwners();
        }
        if (selectedOwnerId && shops.length === 0) {
          await fetchShops(selectedOwnerId);
        }
        // For total shops count, we need all shops data
        await fetchAllShops();
      };

      loadDashboardData();
    }
  }, [activeTab]);

  // Handle form inputs
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle shop form inputs
  const handleShopFormChange = (e) =>
    setShopFormData({ ...shopFormData, [e.target.name]: e.target.value });

  // Register new shop owner
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const ownerData = {
        ...formData,
        address: formData.address || null,
      };
      await authService.createOwner(ownerData);
      alert("✅ Shop Owner registered");
      setFormData({
        name: "",
        mobile: "",
        email: "",
        password: "",
        address: "",
      });
      await fetchOwners(); // This will now update stats with the new owners count

      // If currently on reports tab, refresh all shops data
      if (activeTab === 'reports') {
        await fetchAllShops();
      }

      setSearchParams({ tab: "manage-owners" });
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create new shop
  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!selectedOwnerId) {
      alert("❌ Please select an owner first");
      return;
    }

    try {
      setLoading(true);
      const shopData = {
        ...shopFormData,
        owner_id: selectedOwnerId,
        status: 'active',
        // Construct full address from the structured fields
        location: `${shopFormData.street}, ${shopFormData.city}, ${shopFormData.state} - ${shopFormData.pincode}`,
        // Include GSTIN as optional field
        gstin: shopFormData.gstin || null,
      };

      await authService.createShop(shopData);
      alert("✅ Shop created successfully!");

      // Reset form
      setShopFormData({
        name: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        gstin: "",
      });

      // Refresh shops for the selected owner
      await fetchShops(selectedOwnerId);

      // If currently on reports tab, refresh all shops data for accurate counts
      if (activeTab === 'reports') {
        await fetchAllShops();
      }

      // Navigate back to manage shops
      setSearchParams({ tab: "manage-shops" });
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update existing owner
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Prepare update data - only send fields that have values
      const updateData = {
        ...(editingOwner.name && { name: editingOwner.name }),
        ...(editingOwner.mobile && { mobile: editingOwner.mobile }),
        ...(editingOwner.email && { email: editingOwner.email }),
        ...(editingOwner.address !== undefined && { address: editingOwner.address || null }),
        ...(editingOwner.password && editingOwner.password.trim() && { password: editingOwner.password }),
      };

      console.log('Updating owner with data:', updateData);

      await authService.updateOwner(editingOwner.id, updateData);
      alert("✅ Shop Owner updated successfully");
      setEditingOwner(null); // Close modal
      await fetchOwners(); // Refresh the list and update stats

      // If currently on reports tab, refresh all shops data
      if (activeTab === 'reports') {
        await fetchAllShops();
      }
    } catch (error) {
      console.error('Update error:', error);
      alert(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete owner
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this owner?")) return;
    try {
      setLoading(true);
      await authService.deleteOwner(id);
      alert("🗑️ Shop Owner deleted");
      await fetchOwners(); // Refresh the list and update stats

      // If currently on reports tab, refresh all shops data
      if (activeTab === 'reports') {
        await fetchAllShops();
      }
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-admin">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>🏢 Admin Panel</h2>
        <ul>
          <li
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setSearchParams({ tab: "dashboard" })}
          >
            📊 Dashboard
          </li>
          <li
            className={activeTab === "add-owner" ? "active" : ""}
            onClick={() => setSearchParams({ tab: "add-owner" })}
          >
            ➕ Add Owner
          </li>
          <li
            className={activeTab === "manage-owners" ? "active" : ""}
            onClick={() => setSearchParams({ tab: "manage-owners" })}
          >
            👥 Manage Owners
          </li>
          <li
            className={activeTab === "add-shop" ? "active" : ""}
            onClick={() => setSearchParams({ tab: "add-shop" })}
          >
            🏪 Add Shop
          </li>
          <li
            className={activeTab === "manage-shops" ? "active" : ""}
            onClick={() => setSearchParams({ tab: "manage-shops" })}
          >
            🏬 Manage Shops
          </li>
          {/* <li
            className={activeTab === "all-shops" ? "active" : ""}
            onClick={() => setSearchParams({ tab: "all-shops" })}
          >
            📈 All Shops
          </li> */}
          <li
            className={activeTab === "reports" ? "active" : ""}
            onClick={() => setSearchParams({ tab: "reports" })}
          >
            📊 Reports
          </li>
          <li
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => setSearchParams({ tab: "settings" })}
          >
            ⚙️ Settings
          </li>
          <li
            className="logout"
            onClick={() => {
              localStorage.removeItem("loggedInOwner");
              alert("Logged out ✅");
              window.location.href = "/admin-login";
            }}
          >
            🚪 Logout
          </li>
        </ul>
        <div className="sidebar-footer">© 2025 Company Inc.</div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        {/* Topbar */}
        <header className="topbar">
          <div className="logo">🛒 Company Admin</div>
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>
          <div className="profile">
            <span>Hi, Admin</span>
            <img
              src="https://img.icons8.com/ios-filled/50/company.png"
              alt="Company Admin Logo"
              className="avatar"
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {activeTab === "dashboard" && (
            <div className="dashboard-container">
              <div className="dashboard-header">
                <h1>📊 Dashboard Overview</h1>
                <p>Real-time insights into your shop management system</p>
              </div>

              {/* Key Metrics Section */}
              <div className="dashboard-section">
                <h2>🏢 System Overview</h2>
                <div className="metrics-grid">
                  <div className="metric-card primary">
                    <div className="metric-icon">👥</div>
                    <div className="metric-content">
                      <h3>Total Owners</h3>
                      <p className="metric-value">{stats.totalOwners || 0}</p>
                      <span className="metric-label">Registered owners</span>
                    </div>
                  </div>

                  <div className="metric-card success">
                    <div className="metric-icon">🏪</div>
                    <div className="metric-content">
                      <h3>Total Shops</h3>
                      <p className="metric-value">{stats.totalShops || 0}</p>
                      <span className="metric-label">All shops</span>
                    </div>
                  </div>

                  <div className="metric-card info">
                    <div className="metric-icon">✅</div>
                    <div className="metric-content">
                      <h3>Active Shops</h3>
                      <p className="metric-value">{stats.activeShops || 0}</p>
                      <span className="metric-label">Currently active</span>
                    </div>
                  </div>

                  <div className="metric-card warning">
                    <div className="metric-icon">⏸️</div>
                    <div className="metric-content">
                      <h3>Inactive Shops</h3>
                      <p className="metric-value">{stats.inactiveShops || 0}</p>
                      <span className="metric-label">Temporarily inactive</span>
                    </div>
                  </div>

                  <div className="metric-card danger">
                    <div className="metric-icon">🚫</div>
                    <div className="metric-content">
                      <h3>Suspended Shops</h3>
                      <p className="metric-value">{stats.suspendedShops || 0}</p>
                      <span className="metric-label">Currently suspended</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="dashboard-section">
                <h2>📈 Shop Status Distribution</h2>
                <div className="status-overview">
                  <div className="status-item">
                    <div className="status-indicator active"></div>
                    <div className="status-content">
                      <span className="status-label">Active Shops</span>
                      <strong className="status-value">{stats.activeShops || 0}</strong>
                    </div>
                  </div>

                  <div className="status-item">
                    <div className="status-indicator inactive"></div>
                    <div className="status-content">
                      <span className="status-label">Inactive Shops</span>
                      <strong className="status-value">{stats.inactiveShops || 0}</strong>
                    </div>
                  </div>

                  <div className="status-item">
                    <div className="status-indicator suspended"></div>
                    <div className="status-content">
                      <span className="status-label">Suspended Shops</span>
                      <strong className="status-value">{stats.suspendedShops || 0}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="dashboard-section">
                <h2>⚡ Quick Actions</h2>
                <div className="quick-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => setSearchParams({ tab: "add-owner" })}
                  >
                    <span className="action-icon">➕</span>
                    <span>Add New Owner</span>
                  </button>

                  <button
                    className="action-btn secondary"
                    onClick={() => setSearchParams({ tab: "add-shop" })}
                  >
                    <span className="action-icon">🏪</span>
                    <span>Add New Shop</span>
                  </button>

                  <button
                    className="action-btn tertiary"
                    onClick={() => setSearchParams({ tab: "reports" })}
                  >
                    <span className="action-icon">📊</span>
                    <span>View Reports</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "add-owner" && (
            <div>
              <h1>Add New Shop Owner</h1>
              <form onSubmit={handleRegister} className="form-card">
                <input
                  type="text"
                  name="name"
                  placeholder="Owner Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="mobile"
                  placeholder="Phone Number"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                  required
                  title="Phone must be 10 digits"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Owner Gmail"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  title="Email must be Gmail"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Register Shop Owner"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "add-shop" && (
            <div>
              <h1>Add New Shop</h1>
              <form onSubmit={handleCreateShop} className="form-card">
                <div className="form-row">
                  <div className="form-group">
                    <label>Owner:</label>
                    <select
                      value={selectedOwnerId || ''}
                      onChange={(e) => setSelectedOwnerId(e.target.value)}
                      required
                      className="owner-select-input"
                    >
                      <option value="">Select an owner...</option>
                      {owners.map(owner => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name} {owner.shop_name && `(${owner.shop_name})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <input
                  type="text"
                  name="name"
                  placeholder="Shop Name"
                  value={shopFormData.name}
                  onChange={handleShopFormChange}
                  required
                />

                <div className="address-section">
                  <h3>Shop Address</h3>
                  <input
                    type="text"
                    name="street"
                    placeholder="Street Address"
                    value={shopFormData.street}
                    onChange={handleShopFormChange}
                    required
                  />
                  <div className="address-row">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={shopFormData.city}
                      onChange={handleShopFormChange}
                      required
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={shopFormData.state}
                      onChange={handleShopFormChange}
                      required
                    />
                  </div>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode"
                    value={shopFormData.pincode}
                    onChange={(e) =>
                      setShopFormData({
                        ...shopFormData,
                        pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                      })
                    }
                    required
                    title="Pincode must be 6 digits"
                  />
                </div>

                <input
                  type="text"
                  name="gstin"
                  placeholder="GSTIN / Business ID (Optional)"
                  value={shopFormData.gstin}
                  onChange={(e) =>
                    setShopFormData({
                      ...shopFormData,
                      gstin: e.target.value.toUpperCase(),
                    })
                  }
                  title="Enter GSTIN or Business ID (optional)"
                />

                <button type="submit" disabled={loading || !selectedOwnerId}>
                  {loading ? "Creating Shop..." : "Create Shop"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "manage-owners" && (
            <div>
              <h1>Manage Shop Owners</h1>
              <div className="grid">
                {owners.length === 0 && <p key="no-owners-message">No shop owners registered yet.</p>}
                {owners.map((o) => (
                  editingOwner && editingOwner.id === o.id ? (
                    <div key={o.id} className="card">
                      <h3>Edit Shop Owner</h3>
                      <form onSubmit={handleUpdate}>
                        <input
                          type="text"
                          placeholder="Owner Full Name"
                          value={editingOwner.name}
                          onChange={(e) =>
                            setEditingOwner({ ...editingOwner, name: e.target.value })
                          }
                          required
                        />
                        <input
                          type="text"
                          placeholder="Phone Number"
                          value={editingOwner.mobile}
                          onChange={(e) =>
                            setEditingOwner({
                              ...editingOwner,
                              mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                            })
                          }
                          required
                          title="Phone must be 10 digits"
                        />
                        <input
                          type="text"
                          placeholder="Address"
                          value={editingOwner.address || ""}
                          onChange={(e) =>
                            setEditingOwner({
                              ...editingOwner,
                              address: e.target.value,
                            })
                          }
                        />
                        <input
                          type="email"
                          placeholder="Owner Gmail"
                          value={editingOwner.email}
                          onChange={(e) =>
                            setEditingOwner({
                              ...editingOwner,
                              email: e.target.value,
                            })
                          }
                          required
                          title="Email must be Gmail"
                        />
                        <input
                          type="password"
                          placeholder="New Password (optional)"
                          value={editingOwner.password || ""}
                          onChange={(e) =>
                            setEditingOwner({
                              ...editingOwner,
                              password: e.target.value,
                            })
                          }
                        />
                        <div className="form-buttons">
                          <button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Owner"}
                          </button>
                          <button type="button" onClick={() => setEditingOwner(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div key={o.id} className="card">
                      <h3>{o.name}</h3>
                      <p>Email: {o.email}</p>
                      <p>Phone: {o.mobile}</p>
                      <p>Address: {o.address}</p>
                      <div className="button-container">
                        <button onClick={() => setEditingOwner(o)}>✏️ Edit</button>
                        <button className="red" onClick={() => handleDelete(o.id)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {activeTab === "manage-shops" && (
            <div className="manage-shops">
              <div className="shops-header">
                <h1>🏪 Manage Shops</h1>
                <div className="shops-actions">
                  <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search shops..." 
                      value={shopSearchTerm}
                      onChange={(e) => filterShops(e.target.value, shopStatusFilter)}
                      className="search-input"
                    />
                    {shopSearchTerm && (
                      <button 
                        className="clear-search"
                        onClick={() => filterShops('', shopStatusFilter)}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                  
                  <div className="filter-dropdown">
                    <select 
                      value={shopStatusFilter}
                      onChange={(e) => filterShops(shopSearchTerm, e.target.value)}
                      className="status-filter"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <FiFilter className="filter-icon" />
                  </div>
                  
                  <div className="owner-filter">
                    <span>Owner:</span>
                    <select
                      value={selectedOwnerId || ''}
                      onChange={handleOwnerChange}
                      disabled={loading || owners.length === 0}
                      className="owner-select"
                    >
                      {owners.map(owner => {
                        const displayText = `${owner.name}`;
                        return (
                          <option key={owner.id} value={owner.id}>
                            {displayText.length > 40 ? `${displayText.substring(0, 37)}...` : displayText}
                          </option>
                        );
                      })}
                      {owners.length === 0 && (
                        <option value="">No owners available</option>
                      )}
                    </select>
                  </div>

                </div>
              </div>
              
              {loading && shops.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading shops...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>Error loading shops: {error}</p>
                  <button 
                    className="btn-text"
                    onClick={() => selectedOwnerId && fetchShops(selectedOwnerId)}
                  >
                    Retry
                  </button>
                </div>
              ) : filteredShops.length > 0 ? (
                <div className="shops-grid">
                  {filteredShops.map(shop => {
                    const owner = owners.find(o => o.id === shop.owner_id) || {};
                    return (
                      <div key={shop.id} className={`shop-card status-${shop.status || 'inactive'}`}>
                        <div className="shop-card-header">
                          <h3>{shop.name || 'Unnamed Shop'}</h3>
                          <StatusBadge status={shop.status} />
                        </div>
                        
                        <div className="shop-details">
                          <div className="detail-row">
                            <span className="detail-label">Owner:</span>
                            <span className="detail-value" title={owner.email}>
                              {owner.name || 'N/A'} (ID #{shop.owner_id})
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Shop ID:</span>
                            <span className="detail-value">
                              #{shop.id}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Address:</span>
                            <span className="detail-value" title={shop.location}>
                              {shop.street && shop.city ? `${shop.street}, ${shop.city}` : (shop.location || 'N/A')}
                            </span>
                          </div>
                          {shop.state && (
                            <div className="detail-row">
                              <span className="detail-label">State/Pincode:</span>
                              <span className="detail-value">
                                {shop.state} - {shop.pincode || 'N/A'}
                              </span>
                            </div>
                          )}
                          {shop.gstin && (
                            <div className="detail-row">
                              <span className="detail-label">GSTIN:</span>
                              <span className="detail-value">
                                {shop.gstin}
                              </span>
                            </div>
                          )}
                          <div className="detail-row">
                            <span className="detail-label">Last Updated:</span>
                            <span className="detail-value">
                              {formatDate(shop.updated_at) || 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="shop-status-actions">
                          <button 
                            className={`btn-status ${shop.status === 'active' ? 'active' : ''}`}
                            onClick={() => updateShopStatus(shop.id, 'active')}
                            title="Set as Active"
                          >
                            ✅ Active
                          </button>
                          <button 
                            className={`btn-status ${shop.status === 'inactive' ? 'active' : ''}`}
                            onClick={() => updateShopStatus(shop.id, 'inactive')}
                            title="Set as Inactive"
                          >
                            ⏸️ Inactive
                          </button>
                          <button 
                            className={`btn-status ${shop.status === 'suspended' ? 'active' : ''}`}
                            onClick={() => updateShopStatus(shop.id, 'suspended')}
                            title="Suspend Shop"
                          >
                            ⛔ Suspend
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🏪</div>
                  <h3>No shops found</h3>
                  <p>No shops match your current filters. Try adjusting your search criteria.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setShopSearchTerm('');
                      setShopStatusFilter('all');
                      setFilteredShops(shops);
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
              
            </div>
          )}

          {/* {activeTab === "all-shops" && (
            <div>
              <h1>All Shops 📊</h1>
              <p>(Future section: Show all shops summary and statistics here)</p>
            </div>
          )} */}

          {activeTab === "reports" && (
            <div className="reports-page">
              <div className="reports-header">
                <h1>📊 Analytics & Reports</h1>
                <p>Comprehensive business insights and performance metrics</p>
              </div>

              {/* Company Overview Section */}
              <div className="reports-section">
                <h2>🏢 Company Overview</h2>
                <div className="stats-grid">
                  <div className="stat-card primary">
                    <div className="stat-icon">🏪</div>
                    <div className="stat-info">
                      <h3>Total Shops</h3>
                      <p className="stat-value">{stats.totalShops || 0}</p>
                      <span className="stat-trend positive">↗ +{stats.activeShops || 0} active</span>
                    </div>
                  </div>
                  <div className="stat-card success">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <h3>Total Owners</h3>
                      <p className="stat-value">{stats.totalOwners || 0}</p>
                      <span className="stat-trend">Active network</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shop Status Distribution */}
              <div className="reports-section">
                <h2>📊 Shop Status Distribution</h2>
                <div className="status-distribution">
                  <div className="status-item">
                    <div className="status-color active"></div>
                    <span>Active Shops</span>
                    <strong>{stats.activeShops || 0}</strong>
                  </div>
                  <div className="status-item">
                    <div className="status-color inactive"></div>
                    <span>Inactive Shops</span>
                    <strong>{stats.inactiveShops || 0}</strong>
                  </div>
                  <div className="status-item">
                    <div className="status-color suspended"></div>
                    <span>Suspended Shops</span>
                    <strong>{stats.suspendedShops || 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h1>⚙️ Settings</h1>
              <p>Admin profile, system settings, and preferences go here.</p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>© 2025 Company Inc. | Admin Dashboard v1.0</p>
        </footer>
      </div>
    </div>
  );
}