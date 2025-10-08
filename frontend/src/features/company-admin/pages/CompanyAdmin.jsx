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
    shop_name: "",
    address: "",
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
  
  // Update shop status
  const updateShopStatus = async (shopId, newStatus) => {
    try {
      setLoading(true);
      // Call your API to update the status
      const response = await authService.updateShopStatus(shopId, { status: newStatus });
      
      // Update the shop in the local state
      const updatedShops = shops.map(shop => 
        shop.id === shopId ? { ...shop, status: newStatus, updated_at: new Date().toISOString() } : shop
      );
      
      setShops(updatedShops);
      setFilteredShops(updatedShops);
      updateShopStats(updatedShops);
      
      // Show success message
      alert(`Shop status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating shop status:', error);
      alert('Failed to update shop status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter shops based on search term and status
  const filterShops = (searchTerm = shopSearchTerm, statusFilter = shopStatusFilter) => {
    setShopSearchTerm(searchTerm);
    setShopStatusFilter(statusFilter);
    
    const filtered = shops.filter(shop => {
      const matchesSearch = searchTerm === '' || 
                         (shop.name && shop.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (shop.location && shop.location.toLowerCase().includes(searchTerm.toLowerCase()));
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

  // Handle form inputs
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Register new shop owner
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const ownerData = {
        ...formData,
        shop_name: formData.shop_name || null,
        address: formData.address || null,
      };
      await authService.createOwner(ownerData);
      alert("✅ Shop Owner registered");
      setFormData({
        name: "",
        mobile: "",
        email: "",
        password: "",
        shop_name: "",
        address: "",
      });
      fetchOwners();
      setSearchParams({ tab: "manage-owners" });
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
        ...(editingOwner.shop_name !== undefined && { shop_name: editingOwner.shop_name || null }),
        ...(editingOwner.address !== undefined && { address: editingOwner.address || null }),
        ...(editingOwner.password && editingOwner.password.trim() && { password: editingOwner.password }),
      };

      console.log('Updating owner with data:', updateData);

      await authService.updateOwner(editingOwner.id, updateData);
      alert("✅ Shop Owner updated successfully");
      setEditingOwner(null); // Close modal
      fetchOwners(); // Refresh the list
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
      fetchOwners();
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
            📌 Dashboard
          </li>
          <li
            className={activeTab === "add-owner" ? "active" : ""}
            onClick={() => setSearchParams({ tab: "add-owner" })}
          >
            ➕ Add Shop Owner
          </li>
          <li
            className={activeTab === "manage-owners" ? "active" : ""}
            onClick={() => setSearchParams({ tab: "manage-owners" })}
          >
            👤 Manage Owners
          </li>
          <li
            className={activeTab === "manage-shops" ? "active" : ""}
            onClick={() => setSearchParams({ tab: "manage-shops" })}
          >
            🏬 Manage Shops
          </li>
          <li
            className={activeTab === "all-shops" ? "active" : ""}
            onClick={() => setSearchParams({ tab: "all-shops" })}
          >
            📊 All Shops
          </li>
          <li
            className={activeTab === "reports" ? "active" : ""}
            onClick={() => setSearchParams({ tab: "reports" })}
          >
            📈 Reports
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
              src="https://i.pravatar.cc/40"
              alt="Admin Avatar"
              className="avatar"
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {activeTab === "dashboard" && (
            <div>
              <h1>📌 Dashboard</h1>
              <p>Welcome to the Company Admin Dashboard.</p>
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
                  name="shop_name"
                  placeholder="Shop Name (Optional)"
                  value={formData.shop_name}
                  onChange={handleChange}
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
                          placeholder="Shop Name (Optional)"
                          value={editingOwner.shop_name || ""}
                          onChange={(e) =>
                            setEditingOwner({
                              ...editingOwner,
                              shop_name: e.target.value,
                            })
                          }
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
                      <p>Shop: {o.shop_name}</p>
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
                  
                  {/* Add New Shop button removed as per request */}
                </div>
              </div>
              
              {/* Stats Overview */}
              <div className="stats-overview">
                <div className="stat-card">
                  <div className="stat-icon">🏪</div>
                  <h3>Total Shops</h3>
                  <p className="stat-value">{stats.totalShops || 0}</p>
                </div>
                <div className="stat-card stat-active">
                  <div className="stat-icon">✅</div>
                  <h3>Active</h3>
                  <p className="stat-value">{stats.activeShops || 0}</p>
                </div>
                <div className="stat-card stat-inactive">
                  <div className="stat-icon">⏸️</div>
                  <h3>Inactive</h3>
                  <p className="stat-value">{stats.inactiveShops || 0}</p>
                </div>
                <div className="stat-card stat-suspended">
                  <div className="stat-icon">⛔</div>
                  <h3>Suspended</h3>
                  <p className="stat-value">{stats.suspendedShops || 0}</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <h3>Total Owners</h3>
                  <p className="stat-value">{stats.totalOwners || 0}</p>
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
                              {owner.name || 'N/A'}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Location:</span>
                            <span className="detail-value" title={shop.location}>
                              {shop.location || 'N/A'}
                            </span>
                          </div>
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

          {activeTab === "all-shops" && (
            <div>
              <h1>All Shops 📊</h1>
              <p>(Future section: Show all shops summary and statistics here)</p>
            </div>
          )}

          {activeTab === "reports" && (
            <div>
              <h1>📈 Reports</h1>
              <p>Generate sales, revenue, and performance reports here.</p>
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