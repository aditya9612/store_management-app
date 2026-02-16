/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { authService, reportsApi } from "@/utils/api";
import "@/features/company-admin/styles/company-admin-modern.css";
import {
  FiUsers,
  FiShoppingBag,
  FiCheckCircle,
  FiPauseCircle,
  FiXCircle,
  FiAlertTriangle,
} from "react-icons/fi";

import AdminSidebar from "@/features/company-admin/components/AdminSidebar";
import AddOwnerTab from "@/features/company-admin/components/AddOwnerTab";
import ManageOwnersTab from "@/features/company-admin/components/ManageOwnersTab";
import AddShopTab from "@/features/company-admin/components/AddShopTab";
import ManageShopsTab from "@/features/company-admin/components/ManageShopsTab";
import ReportsTab from "@/features/company-admin/components/ReportsTab";

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default function CompanyAdmin() {
  const [owners, setOwners] = useState([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [shops, setShops] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [ownerSearchTerm, setOwnerSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const [loading, setLoading] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({
    totalShops: 0,
    activeShops: 0,
    totalOwners: 0,
    inactiveShops: 0,
    suspendedShops: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    address: "",
  });

  const [shopFormData, setShopFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
    owner_id: ""
  });

  const [reports, setReports] = useState(null);
  const [reportPeriod, setReportPeriod] = useState("all_time");

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInOwner");
    alert("Logged out");
    window.location.href = "/admin-login";
  };

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await authService.getOwners();
      const ownersData = Array.isArray(response.data) ? response.data : [];
      setOwners(ownersData);
      if (ownersData.length > 0 && !selectedOwnerId) {
        setSelectedOwnerId(ownersData[0].id);
      }
      setStats(prev => ({ ...prev, totalOwners: ownersData.length }));
      return ownersData;
    } catch (error) {
      console.error('Error fetching owners:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShopStatus = async (shop) => {
    try {
      setLoading(true);
      const newStatus = shop.status === "active" ? "suspended" : "active";
      await authService.updateShopStatus(shop.id, { status: newStatus });
      if (selectedOwnerId) {
        await fetchShops(selectedOwnerId);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (period = reportPeriod) => {
    try {
      setLoading(true);
      const data = await reportsApi.getOverview(period);
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authService.createShop(shopFormData);
      alert("Shop created successfully!");
      setShopFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        gstin: "",
        owner_id: ""
      });
      await fetchOwners(); // Refresh data
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const ownerData = {
        ...formData,
        address: formData.address || null,
      };
      await authService.createOwner(ownerData);
      alert("Shop Owner registered successfully!");
      setFormData({
        name: "",
        mobile: "",
        email: "",
        password: "",
        address: "",
      });
      await fetchOwners();
      setSearchParams({ tab: "manage-owners" });
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updateData = {
        name: editingOwner.name,
        mobile: editingOwner.mobile,
        email: editingOwner.email,
        address: editingOwner.address || null,
      };
      
      // Only include password if it's being changed
      if (editingOwner.password && editingOwner.password.trim()) {
        updateData.password = editingOwner.password;
      }

      await authService.updateOwner(editingOwner.id, updateData);
      alert("Shop Owner updated successfully!");
      setEditingOwner(null);
      await fetchOwners();
    } catch (error) {
      console.error('Update failed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setShowDeleteConfirm(id);
  };

  const confirmDeleteOwner = async (ownerId) => {
    try {
      setLoading(true);
      await authService.deleteOwner(ownerId);
      alert("Shop Owner deleted successfully!");
      await fetchOwners();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const ownersData = await fetchOwners();
      if (ownersData.length > 0) {
        await fetchShops(ownersData[0].id);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (owners.length > 0) {
      filterOwners(ownerSearchTerm);
    }
  }, [owners, ownerSearchTerm]);

  return (
    <div className="company-admin">
      <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout} />

      <div className="main-wrapper">
        <main className="main-content">
          {activeTab === "dashboard" && (
            <div className="dashboard-container">
              <div className="dashboard-header">
                <div className="header-content">
                  <div>
                    <h1>Dashboard Overview</h1>
                    <p>Real-time insights into your shop management system</p>
                  </div>
                  <div className="header-actions">
                    <button className="action-btn primary" onClick={() => setSearchParams({ tab: "add-owner" })}>
                      + Add Owner
                    </button>
                  </div>
                </div>
              </div>

              <div className="dashboard-section">
                <h2>System Overview</h2>
                <div className="metrics-grid">
                  <div className="metric-card primary">
                    <div className="metric-icon">
                      <FiUsers size={24} />
                    </div>
                    <div className="metric-content">
                      <h3>Total Owners</h3>
                      <p className="metric-value">{stats.totalOwners || 0}</p>
                      <span className="metric-label">Registered owners</span>
                      <div className="metric-trend positive">
                        <span>↑ Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="metric-card success">
                    <div className="metric-icon">
                      <FiShoppingBag size={24} />
                    </div>
                    <div className="metric-content">
                      <h3>Total Shops</h3>
                      <p className="metric-value">{stats.totalShops || 0}</p>
                      <span className="metric-label">All shops</span>
                      <div className="metric-trend positive">
                        <span>↑ Growing</span>
                      </div>
                    </div>
                  </div>
                  <div className="metric-card info">
                    <div className="metric-icon">
                      <FiCheckCircle size={24} />
                    </div>
                    <div className="metric-content">
                      <h3>Active Shops</h3>
                      <p className="metric-value">{stats.activeShops || 0}</p>
                      <span className="metric-label">Currently active</span>
                      <div className="metric-trend positive">
                        <span>↑ Operational</span>
                      </div>
                    </div>
                  </div>
                  <div className="metric-card warning">
                    <div className="metric-icon">
                      <FiPauseCircle size={24} />
                    </div>
                    <div className="metric-content">
                      <h3>Inactive Shops</h3>
                      <p className="metric-value">{stats.inactiveShops || 0}</p>
                      <span className="metric-label">Temporarily inactive</span>
                      <div className="metric-trend neutral">
                        <span>→ Paused</span>
                      </div>
                    </div>
                  </div>
                  <div className="metric-card danger">
                    <div className="metric-icon">
                      <FiXCircle size={24} />
                    </div>
                    <div className="metric-content">
                      <h3>Suspended Shops</h3>
                      <p className="metric-value">{stats.suspendedShops || 0}</p>
                      <span className="metric-label">Currently suspended</span>
                      <div className="metric-trend negative">
                        <span>⚠ Attention needed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "add-owner" && (
            <AddOwnerTab
              formData={formData}
              setFormData={setFormData}
              loading={loading}
              onSubmit={handleRegister}
            />
          )}

          {activeTab === "manage-owners" && (
            <ManageOwnersTab
              loading={loading}
              owners={owners}
              filteredOwners={filteredOwners}
              ownerSearchTerm={ownerSearchTerm}
              onSearch={filterOwners}
              editingOwner={editingOwner}
              setEditingOwner={setEditingOwner}
              onSubmitUpdate={handleUpdate}
              onDelete={handleDelete}
              formatDate={formatDate}
            />
          )}

          {activeTab === "add-shop" && (
            <AddShopTab
              shopFormData={shopFormData}
              setShopFormData={setShopFormData}
              owners={owners}
              loading={loading}
              onSubmit={handleCreateShop}
            />
          )}

          {activeTab === "manage-shops" && (
            <ManageShopsTab
              loading={loading}
              owners={owners}
              selectedOwnerId={selectedOwnerId}
              onChangeOwner={async (id) => {
                setSelectedOwnerId(id);
                if (id) await fetchShops(id);
              }}
              shops={shops}
              onToggleStatus={handleToggleShopStatus}
            />
          )}

          {activeTab === "reports" && (
            <ReportsTab
              reports={reports}
              reportPeriod={reportPeriod}
              onChangePeriod={async (p) => {
                setReportPeriod(p);
                await fetchReports(p);
              }}
              onLoad={() => fetchReports(reportPeriod)}
              loading={loading}
            />
          )}

          {showDeleteConfirm && (
            <div className="modal-overlay">
              <div className="confirmation-modal">
                <div className="confirmation-header">
                  <FiAlertTriangle className="warning-icon" />
                  <h3>Delete Shop Owner</h3>
                </div>
                <div className="confirmation-body">
                  <p>Are you sure you want to delete <strong>"{owners.find(o => o.id === showDeleteConfirm)?.name}"</strong>?</p>
                  <p className="warning-text">This action cannot be undone.</p>
                </div>
                <div className="form-actions">
                  <button className="submit-btn delete-confirm" onClick={() => confirmDeleteOwner(showDeleteConfirm)}>
                    Yes, Delete
                  </button>
                  <button className="cancel-btn" onClick={() => setShowDeleteConfirm(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}