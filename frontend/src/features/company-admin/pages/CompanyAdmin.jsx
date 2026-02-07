/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { authService, settingsApi, reportsApi } from "@/utils/api";
import "@/features/company-admin/styles/company-admin.css";
import "@/features/company-admin/styles/shop-management.css";
import "@/features/company-admin/styles/reports-enhanced.css";
import { FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp, FiSave, FiLock, FiUser, FiMail, FiPhone, FiMapPin, FiSettings, FiDatabase, FiBell, FiShield, FiDownload, FiEdit2, FiTrash2, FiHome, FiUserPlus, FiUsers, FiShoppingBag, FiPlusCircle, FiBarChart2, FiLogOut, FiGrid, FiCheck, FiCheckCircle, FiPauseCircle, FiXCircle, FiAlertTriangle } from "react-icons/fi";
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
 
  // State for status change confirmation modal
  const [statusChangeModal, setStatusChangeModal] = useState({
    isOpen: false,
    shopId: null,
    newStatus: '',
    shopName: '',
    oldStatus: ''
  });
 
  // State for shop management
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [shopSearchTerm, setShopSearchTerm] = useState("");
  const [shopStatusFilter, setShopStatusFilter] = useState("all");
  const [editingShop, setEditingShop] = useState(null);
  const [showDeleteShopConfirm, setShowDeleteShopConfirm] = useState(null);
 
  // State for owner management
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [ownerSearchTerm, setOwnerSearchTerm] = useState("");
 
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
    address: "",
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
 
  // Stats state
  const [stats, setStats] = useState({
    totalShops: 0,
    activeShops: 0,
    totalOwners: 0,
  });
  // Settings state
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin',
    email: 'admin@company.com',
    mobile: '',
    address: '',
    role: 'Super Admin'
  });
  const [companySettings, setCompanySettings] = useState({
    companyName: 'Company Inc.',
    companyEmail: 'contact@company.com',
    companyPhone: '',
    companyAddress: '',
    timezone: 'UTC',
    currency: 'USD',
    language: 'en'
  });
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Reports state
  const [reportsData, setReportsData] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsPeriod, setReportsPeriod] = useState('all_time');
  const [shopSearchFilter, setShopSearchFilter] = useState('');
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingSummary, setExportingSummary] = useState(false);
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
  
  // Fetch reports data
  const fetchReportsData = async (period = reportsPeriod) => {
    try {
      setReportsLoading(true);
      const response = await reportsApi.getOverview(period);
      if (response && response.data) {
        setReportsData(response.data);
        // Also update stats from reports data
        if (response.data.overall_stats) {
          setStats({
            totalShops: response.data.overall_stats.total_shops || 0,
            activeShops: response.data.overall_stats.active_shops || 0,
            inactiveShops: response.data.overall_stats.inactive_shops || 0,
            suspendedShops: response.data.overall_stats.suspended_shops || 0,
            totalOwners: response.data.overall_stats.total_owners || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
      alert('Failed to load reports. Please try again.');
    } finally {
      setReportsLoading(false);
    }
  };
  
  // Export handlers
  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      await reportsApi.exportToPDF(reportsPeriod);
      alert('✅ PDF report downloaded successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('❌ Failed to export PDF. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };
  
  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      await reportsApi.exportToExcel(reportsPeriod);
      alert('✅ Excel report downloaded successfully!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('❌ Failed to export Excel. Please try again.');
    } finally {
      setExportingExcel(false);
    }
  };
  
  const handleExportSummary = async () => {
    try {
      setExportingSummary(true);
      await reportsApi.exportSummary(reportsPeriod);
      alert('✅ Summary report downloaded successfully!');
    } catch (error) {
      console.error('Error exporting summary:', error);
      alert('❌ Failed to export summary. Please try again.');
    } finally {
      setExportingSummary(false);
    }
  };
  // Show status change confirmation
  const showStatusChangeConfirmation = (shopId, newStatus) => {
    const shop = shops.find(s => s.id === shopId);
    if (!shop) return;
    setStatusChangeModal({
      isOpen: true,
      shopId,
      newStatus,
      shopName: shop.name,
      oldStatus: shop.status
    });
  };
  // Close status change modal
  const closeStatusChangeModal = () => {
    setStatusChangeModal({
      isOpen: false,
      shopId: null,
      newStatus: '',
      shopName: '',
      oldStatus: ''
    });
  };
  // Update shop status
  const updateShopStatus = async (shopId, newStatus, event) => {
    try {
      // Prevent default browser behavior and event propagation
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      const shop = shops.find(s => s.id === shopId);
      if (!shop) return;
      // Show our custom confirmation modal instead of browser's confirm
      showStatusChangeConfirmation(shopId, newStatus);
     
    } catch (error) {
      console.error('Error updating shop status:', error);
      alert('Failed to update shop status. Please try again.');
    }
  };
  // Confirm status change
  const confirmStatusChange = async () => {
    const { shopId, newStatus, oldStatus, shopName } = statusChangeModal;
   
    try {
      await authService.updateShopStatus(shopId, { status: newStatus });
     
      // Update local state immutably
      setShops(prevShops => {
        const updatedShops = prevShops.map(s =>
          s.id === shopId ? { ...s, status: newStatus } : s
        );
       
        // Update filtered shops with the new status
        filterShops(shopSearchTerm, shopStatusFilter, updatedShops);
       
        return updatedShops;
      });
     
      // Show success message
      alert(`Shop "${shopName}" status updated to ${newStatus} successfully!`);
     
      // Handle notifications if status changed
      if (oldStatus !== newStatus) {
        const shop = shops.find(s => s.id === shopId);
        if (shop) {
          handleStatusChangeNotification(shop, oldStatus, newStatus);
        }
      }
    } catch (error) {
      console.error('Error updating shop status:', error);
      alert('Failed to update shop status. Please try again.');
    } finally {
      closeStatusChangeModal();
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
        ? `Warning: Your shop "${shop?.name}" has been set to inactive status by the admin. Please contact support if you need assistance.`
        : `Suspension Notice: Your shop "${shop?.name}" has been suspended. You have been logged out for security reasons. Please contact the admin for reactivation.`;
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
  // Filter owners based on search term
  const filterOwners = (searchTerm = ownerSearchTerm, ownersToFilter = null) => {
    const ownersList = ownersToFilter || owners;
   
    if (searchTerm !== ownerSearchTerm) setOwnerSearchTerm(searchTerm);
   
    const filtered = ownersList.filter(owner => {
      const matchesSearch = searchTerm === '' ||
                           (owner.name && owner.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (owner.email && owner.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (owner.mobile && owner.mobile.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (owner.address && owner.address.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
   
    setFilteredOwners(filtered);
    return filtered;
  };
  // Filter shops based on search term and status
  const filterShops = (searchTerm = shopSearchTerm, statusFilter = shopStatusFilter, shopsToFilter = null) => {
    const shopsList = shopsToFilter || shops;
   
    // Update state if values changed
    if (searchTerm !== shopSearchTerm) setShopSearchTerm(searchTerm);
    if (statusFilter !== shopStatusFilter) setShopStatusFilter(statusFilter);
   
    const filtered = shopsList.filter(shop => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
                           (shop.name && shop.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (shop.address && shop.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (shop.city && shop.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (shop.state && shop.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (shop.gstin && shop.gstin.toLowerCase().includes(searchTerm.toLowerCase()));
     
      // Status filter
      const matchesStatus = statusFilter === 'all' || shop.status === statusFilter;
     
      return matchesSearch && matchesStatus;
    });
   
    setFilteredShops(filtered);
    updateShopStats(filtered);
    return filtered;
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
  // Initialize filtered owners when owners data changes
  useEffect(() => {
    if (owners.length > 0) {
      filterOwners(ownerSearchTerm, owners);
    }
  }, [owners, ownerSearchTerm]);
  // Initialize filtered shops when shops data or filters change
  useEffect(() => {
    if (shops.length > 0) {
      filterShops(shopSearchTerm, shopStatusFilter, shops);
    }
  }, [shops, shopSearchTerm, shopStatusFilter]);
  
  // Fetch reports data when reports tab is active
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReportsData(reportsPeriod);
    }
  }, [activeTab, reportsPeriod]);
  
  // Fetch settings data when settings tab is active
  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettingsData();
    }
  }, [activeTab]);
  
  // Fetch all settings data
  const fetchSettingsData = async () => {
    try {
      setSettingsLoading(true);
      
      // Fetch admin profile
      const profileResponse = await settingsApi.getAdminProfile();
      if (profileResponse && profileResponse.data) {
        setAdminProfile({
          name: profileResponse.data.name,
          email: profileResponse.data.email,
          mobile: profileResponse.data.mobile || '',
          address: profileResponse.data.address || '',
          role: profileResponse.data.role || 'Super Admin'
        });
      }
      
      // Fetch company settings
      const companyResponse = await settingsApi.getCompanySettings();
      if (companyResponse && companyResponse.data) {
        setCompanySettings({
          companyName: companyResponse.data.company_name,
          companyEmail: companyResponse.data.company_email,
          companyPhone: companyResponse.data.company_phone || '',
          companyAddress: companyResponse.data.company_address || '',
          timezone: companyResponse.data.timezone || 'UTC',
          currency: companyResponse.data.currency || 'USD',
          language: companyResponse.data.language || 'en'
        });
      }
      
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Failed to load settings. Using default values.');
    } finally {
      setSettingsLoading(false);
    }
  };
  // Handle form inputs
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  // Handle shop form inputs
  const handleShopFormChange = (e) => {
    if (editingShop) {
      setEditingShop({ ...editingShop, [e.target.name]: e.target.value });
    } else {
      setShopFormData({ ...shopFormData, [e.target.name]: e.target.value });
    }
  };
  // Create or update a shop
  const handleSaveShop = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
     
      if (editingShop) {
        // Update existing shop
        const { id, ...updateData } = editingShop;
        await authService.updateShop(id, updateData);
        alert("Shop updated successfully!");
        setEditingShop(null);
        // Navigate back to manage shops page
        setSearchParams({ tab: "manage-shops" });
      } else {
        // Create new shop
        const shopData = {
          ...shopFormData,
          owner_id: selectedOwnerId,
        };
        await authService.createShop(shopData);
        alert("Shop created successfully!");
        // Reset form
        setShopFormData({
          name: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          gstin: "",
        });
      }
     
      // Refresh shops list
      await fetchShops(selectedOwnerId);
    } catch (error) {
      console.error('Error saving shop:', error);
      alert(`${error.message || 'Failed to save shop. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };
  // Handle edit shop - now opens in a dedicated page
  const handleEditShop = (shop) => {
    setEditingShop({ ...shop });
    setSearchParams({ tab: "edit-shop", shopId: shop.id });
  };
  // Handle delete shop confirmation
  const confirmDeleteShop = async (shopId) => {
    try {
      setLoading(true);
      await authService.deleteShop(shopId);
      alert("Shop deleted successfully!");
      setShowDeleteShopConfirm(null);
      await fetchShops(selectedOwnerId);
    } catch (error) {
      console.error('Error deleting shop:', error);
      alert(`${error.message || 'Failed to delete shop. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };
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
      alert("Shop Owner registered");
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
      alert(`${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  // Create new shop
  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!selectedOwnerId) {
      alert("Please select an owner first");
      return;
    }
    try {
      setLoading(true);
      const shopData = {
        ...shopFormData,
        owner_id: selectedOwnerId,
        status: 'active',
        // Construct full address from the structured fields
        address: shopFormData.address,
        city: shopFormData.city,
        state: shopFormData.state,
        pincode: shopFormData.pincode,
        // Include GSTIN as optional field
        gstin: shopFormData.gstin || null,
      };
      await authService.createShop(shopData);
      alert("Shop created successfully!");
      // Reset form
      setShopFormData({
        name: "",
        address: "",
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
      alert(`${error.message}`);
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
      alert("Shop Owner updated successfully");
      setEditingOwner(null); // Close modal
      await fetchOwners(); // Refresh the list and update stats
      // If currently on reports tab, refresh all shops data
      if (activeTab === 'reports') {
        await fetchAllShops();
      }
    } catch (error) {
      console.error('Update error:', error);
      alert(`${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  // Delete owner
  const handleDelete = async (id) => {
    // Show confirmation modal instead of browser confirm
    setShowDeleteConfirm(id);
  };
  // Confirm delete owner
  const confirmDeleteOwner = async (ownerId) => {
    try {
      setLoading(true);
      await authService.deleteOwner(ownerId);
      alert("Shop Owner deleted");
      await fetchOwners(); // Refresh the list and update stats
      // If currently on reports tab, refresh all shops data
      if (activeTab === 'reports') {
        await fetchAllShops();
      }
    } catch (error) {
      alert(`${error.message}`);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  };
  // Settings Handlers
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSettingsLoading(true);
      const updateData = {
        name: adminProfile.name,
        email: adminProfile.email,
        mobile: adminProfile.mobile || null,
        address: adminProfile.address || null
      };
      await settingsApi.updateAdminProfile(updateData);
      alert('✅ Profile updated successfully!');
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setSettingsLoading(false);
    }
  };
  const handleUpdateCompanySettings = async (e) => {
    e.preventDefault();
    try {
      setSettingsLoading(true);
      const updateData = {
        company_name: companySettings.companyName,
        company_email: companySettings.companyEmail,
        company_phone: companySettings.companyPhone || null,
        company_address: companySettings.companyAddress || null,
        timezone: companySettings.timezone,
        currency: companySettings.currency,
        language: companySettings.language
      };
      await settingsApi.updateCompanySettings(updateData);
      alert('✅ Company settings updated successfully!');
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setSettingsLoading(false);
    }
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();
   
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      alert('❌ New password and confirm password do not match!');
      return;
    }
    if (securitySettings.newPassword.length < 6) {
      alert('❌ Password must be at least 6 characters long!');
      return;
    }
    try {
      setSettingsLoading(true);
      const passwordData = {
        current_password: securitySettings.currentPassword,
        new_password: securitySettings.newPassword,
        confirm_password: securitySettings.confirmPassword
      };
      await settingsApi.changePassword(passwordData);
      alert('✅ Password changed successfully!');
      setSecuritySettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setSettingsLoading(false);
    }
  };
  const handleExportData = async (dataType) => {
    try {
      setSettingsLoading(true);
      await settingsApi.exportData(dataType);
      alert(`✅ ${dataType} data export initiated successfully!`);
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setSettingsLoading(false);
    }
  };
  return (
    <div className="company-admin">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FiGrid size={24} />
            <span>Admin Panel</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Overview</span>
            <ul>
              <li
                className={activeTab === "dashboard" ? "active" : ""}
                onClick={() => setSearchParams({ tab: "dashboard" })}
              >
                <FiHome size={18} />
                <span>Dashboard</span>
              </li>
            </ul>
          </div>
          <div className="nav-section">
            <span className="nav-section-title">Owners</span>
            <ul>
              <li
                className={activeTab === "add-owner" ? "active" : ""}
                onClick={() => setSearchParams({ tab: "add-owner" })}
              >
                <FiUserPlus size={18} />
                <span>Add Owner</span>
              </li>
              <li
                className={activeTab === "manage-owners" ? "active" : ""}
                onClick={() => setSearchParams({ tab: "manage-owners" })}
              >
                <FiUsers size={18} />
                <span>Manage Owners</span>
              </li>
            </ul>
          </div>
          <div className="nav-section">
            <span className="nav-section-title">Shops</span>
            <ul>
              <li
                className={activeTab === "add-shop" ? "active" : ""}
                onClick={() => setSearchParams({ tab: "add-shop" })}
              >
                <FiPlusCircle size={18} />
                <span>Add Shop</span>
              </li>
              <li
                className={activeTab === "manage-shops" ? "active" : ""}
                onClick={() => setSearchParams({ tab: "manage-shops" })}
              >
                <FiShoppingBag size={18} />
                <span>Manage Shops</span>
              </li>
            </ul>
          </div>
          <div className="nav-section">
            <span className="nav-section-title">Analytics</span>
            <ul>
              <li
                className={activeTab === "reports" ? "active" : ""}
                onClick={() => setSearchParams({ tab: "reports" })}
              >
                <FiBarChart2 size={18} />
                <span>Reports</span>
              </li>
            </ul>
          </div>
          <div className="nav-section">
            <span className="nav-section-title">System</span>
            <ul>
              <li
                className={activeTab === "settings" ? "active" : ""}
                onClick={() => setSearchParams({ tab: "settings" })}
              >
                <FiSettings size={18} />
                <span>Settings</span>
              </li>
            </ul>
          </div>
        </nav>
        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("loggedInOwner");
              alert("Logged out");
              window.location.href = "/admin-login";
            }}
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
          <div className="footer-text"> 2025 Shekru Labs India</div>
        </div>
      </aside>
      {/* Main Wrapper */}
      <div className="main-wrapper">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="company-brand">
              <div className="company-icon">
                <FiGrid size={24} />
              </div>
              <div className="company-info">
                <h1 className="company-name">Shekru Labs India</h1>
                <span className="company-tagline">Admin Dashboard</span>
              </div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="admin-profile">
              <div className="admin-details">
                <span className="admin-name">Administrator</span>
                <span className="admin-role">Super Admin</span>
              </div>
              <div className="admin-avatar">
                <FiUser size={20} />
              </div>
            </div>
          </div>
        </header>
        {/* Main Content */}
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
                    <button className="action-btn primary" onClick={() => setSearchParams({ tab: "add-shop" })}>
                      + Add Shop
                    </button>
                    <button className="action-btn secondary" onClick={() => setSearchParams({ tab: "add-owner" })}>
                      + Add Owner
                    </button>
                  </div>
                </div>
              </div>
              {/* Enhanced Key Metrics Section */}
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
                        <span>↑ 12% from last month</span>
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
                        <span>↑ 8% from last month</span>
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
                        <span>↑ 5% from last week</span>
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
                        <span>→ No change</span>
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
                        <span>↓ 3% this week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Shop Status Distribution with Progress Bars */}
              <div className="dashboard-section">
                <h2>Shop Status Distribution</h2>
                <div className="status-distribution">
                  <div className="status-bar-item">
                    <div className="status-bar-header">
                      <div className="status-label">
                        <div className="status-indicator active"></div>
                        <span>Active Shops</span>
                      </div>
                      <strong className="status-value">{stats.activeShops || 0} / {stats.totalShops || 0}</strong>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill active" style={{width: `${stats.totalShops ? (stats.activeShops / stats.totalShops * 100) : 0}%`}}></div>
                    </div>
                    <span className="percentage">{stats.totalShops ? Math.round(stats.activeShops / stats.totalShops * 100) : 0}%</span>
                  </div>
                  <div className="status-bar-item">
                    <div className="status-bar-header">
                      <div className="status-label">
                        <div className="status-indicator inactive"></div>
                        <span>Inactive Shops</span>
                      </div>
                      <strong className="status-value">{stats.inactiveShops || 0} / {stats.totalShops || 0}</strong>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill inactive" style={{width: `${stats.totalShops ? (stats.inactiveShops / stats.totalShops * 100) : 0}%`}}></div>
                    </div>
                    <span className="percentage">{stats.totalShops ? Math.round(stats.inactiveShops / stats.totalShops * 100) : 0}%</span>
                  </div>
                  <div className="status-bar-item">
                    <div className="status-bar-header">
                      <div className="status-label">
                        <div className="status-indicator suspended"></div>
                        <span>Suspended Shops</span>
                      </div>
                      <strong className="status-value">{stats.suspendedShops || 0} / {stats.totalShops || 0}</strong>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill suspended" style={{width: `${stats.totalShops ? (stats.suspendedShops / stats.totalShops * 100) : 0}%`}}></div>
                    </div>
                    <span className="percentage">{stats.totalShops ? Math.round(stats.suspendedShops / stats.totalShops * 100) : 0}%</span>
                  </div>
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
                  type="tel"
                  id="phone"
                  name="phone"
                  pattern="[6-9][0-9]{9}"
                  maxlength="10"
                  required
                  placeholder="Enter 10-digit mobile number"
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                    // BLOCK: Prevent input if first digit is 1-5
                    if (value.length > 0 && /^[1-5]/.test(value.charAt(0))) {
                      return; // Don't update state if first digit is invalid
                    }
                    if (value.length <= 10) {
                      setFormData({
                        ...formData,
                        mobile: value,
                      });
                    }
                  }}
                  title="Phone number must start with 6-9 and be 10 digits"
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
          {/* Dedicated Edit Shop Page */}
          {activeTab === "edit-shop" && editingShop && (
            <div id="shop-form">
              <h1>Edit Shop</h1>
              <form onSubmit={handleSaveShop} className="form-card">
                <div className="form-row">
                  <div className="form-group">
                    <label>Owner:</label>
                    <select
                      value={editingShop.owner_id}
                      onChange={(e) => {
                        setEditingShop({ ...editingShop, owner_id: e.target.value });
                      }}
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
                  value={editingShop.name}
                  onChange={handleShopFormChange}
                  required
                />
                <div className="address-section">
                  <h3>Shop Address</h3>
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={editingShop.address}
                    onChange={handleShopFormChange}
                    required
                  />
                  <div className="address-row">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={editingShop.city}
                      onChange={handleShopFormChange}
                      required
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={editingShop.state}
                      onChange={handleShopFormChange}
                      required
                    />
                  </div>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode"
                    value={editingShop.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setEditingShop({ ...editingShop, pincode: value });
                    }}
                    required
                    title="Pincode must be 6 digits"
                  />
                </div>
                <input
                  type="text"
                  name="gstin"
                  placeholder="GSTIN / Business ID (Optional)"
                  value={editingShop.gstin || ''}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setEditingShop({ ...editingShop, gstin: value });
                  }}
                  title="Enter GSTIN or Business ID (optional)"
                />
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingShop(null);
                      setSearchParams({ tab: "manage-shops" });
                    }}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? "Saving..." : "Update Shop"}
                  </button>
                </div>
              </form>
            </div>
          )}
          {/* Add Shop Page */}
          {activeTab === "add-shop" && !editingShop && (
            <div id="shop-form">
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
                    name="address"
                    placeholder="Address"
                    value={shopFormData.address}
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setShopFormData({ ...shopFormData, pincode: value });
                    }}
                    required
                    title="Pincode must be 6 digits"
                  />
                </div>
                <input
                  type="text"
                  name="gstin"
                  placeholder="GSTIN / Business ID (Optional)"
                  value={shopFormData.gstin || ''}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setShopFormData({ ...shopFormData, gstin: value });
                  }}
                  title="Enter GSTIN or Business ID (optional)"
                />
                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={loading || !selectedOwnerId}
                    className="btn-primary"
                  >
                    {loading ? "Creating..." : "Create Shop"}
                  </button>
                </div>
              </form>
            </div>
          )}
          {activeTab === "manage-owners" && (
            <div className="manage-owners">
              <div className="owners-header">
                <h1>Manage Shop Owners</h1>
                <div className="owners-actions">
                  <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search owners..."
                      value={ownerSearchTerm}
                      onChange={(e) => filterOwners(e.target.value)}
                      className="search-input"
                    />
                    {ownerSearchTerm && (
                      <button
                        className="clear-search"
                        onClick={() => filterOwners('')}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                  <div className="stats-badge">
                    <span className="stats-count">{filteredOwners.length}</span>
                    <span className="stats-label">Owners</span>
                  </div>
                </div>
              </div>
             
              {loading && filteredOwners.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading owners...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>Error loading owners: {error}</p>
                  <button
                    className="btn-text"
                    onClick={() => fetchOwners()}
                  >
                    Retry
                  </button>
                </div>
              ) : filteredOwners.length > 0 ? (
                <div className="owners-grid">
                  {filteredOwners.map((owner) => (
                    editingOwner && editingOwner.id === owner.id ? (
                      <div key={owner.id} className="owner-card editing">
                        <div className="owner-card-header">
                          <h3>Edit Shop Owner</h3>
                          <button
                            onClick={() => setEditingOwner(null)}
                            className="close-btn"
                            title="Cancel editing"
                          >
                            ×
                          </button>
                        </div>
                        <form onSubmit={handleUpdate} className="owner-edit-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Full Name</label>
                              <input
                                type="text"
                                placeholder="Owner Full Name"
                                value={editingOwner.name}
                                onChange={(e) =>
                                  setEditingOwner({ ...editingOwner, name: e.target.value })
                                }
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Email Address</label>
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
                            </div>
                          </div>
                         
                          <div className="form-row">
                            <div className="form-group">
                              <label>Mobile Number</label>
                              <input
                                type="tel"
                                placeholder="Enter 10-digit mobile number"
                                value={editingOwner.mobile}
                                onChange={(e) =>
                                  setEditingOwner({
                                    ...editingOwner,
                                    mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                                  })
                                }
                                required
                                pattern="[6-9][0-9]{9}"
                                title="Phone number must start with 6-9 and be 10 digits"
                              />
                            </div>
                            <div className="form-group">
                              <label>Address</label>
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
                            </div>
                          </div>
                         
                          <div className="form-row">
                            <div className="form-group">
                              <label>New Password (Optional)</label>
                              <input
                                type="password"
                                placeholder="Leave empty to keep current password"
                                value={editingOwner.password || ""}
                                onChange={(e) =>
                                  setEditingOwner({
                                    ...editingOwner,
                                    password: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                         
                          <div className="form-actions">
                            <button type="submit" disabled={loading} className="btn-primary">
                              {loading ? "Updating..." : "Update Owner"}
                            </button>
                            <button type="button" onClick={() => setEditingOwner(null)} className="btn-secondary">
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div key={owner.id} className="owner-card">
                        <div className="owner-card-header">
                          <div className="owner-avatar">
                            <FiUser size={24} />
                          </div>
                          <div className="owner-info">
                            <h3>{owner.name}</h3>
                            <div className="owner-meta">
                              <span className="owner-id">ID: #{owner.id}</span>
                              <span className="owner-join-date">Joined {formatDate(owner.created_at)}</span>
                            </div>
                          </div>
                        </div>
                       
                        <div className="owner-details">
                          <div className="detail-item">
                            <FiMail className="detail-icon" />
                            <span className="detail-value">{owner.email}</span>
                          </div>
                          <div className="detail-item">
                            <FiPhone className="detail-icon" />
                            <span className="detail-value">{owner.mobile}</span>
                          </div>
                          {owner.address && (
                            <div className="detail-item">
                              <FiMapPin className="detail-icon" />
                              <span className="detail-value">{owner.address}</span>
                            </div>
                          )}
                        </div>
                       
                        <div className="owner-actions">
                          <button
                            onClick={() => setEditingOwner(owner)}
                            className="btn-icon edit"
                            title="Edit Owner"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="btn-icon danger"
                            onClick={() => handleDelete(owner.id)}
                            title="Delete Owner"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">Owners</div>
                  <h3>No owners found</h3>
                  <p>
                    {ownerSearchTerm
                      ? `No owners match "${ownerSearchTerm}". Try adjusting your search.`
                      : "No shop owners have been registered yet."}
                  </p>
                  {ownerSearchTerm ? (
                    <button
                      className="btn-primary"
                      onClick={() => filterOwners('')}
                    >
                      Clear search
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={() => setSearchParams({ tab: "add-owner" })}
                    >
                      Add First Owner
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Delete Shop Owner Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="modal-overlay">
              <div className="confirmation-modal">
                <div className="confirmation-header">
                  <i className="fas fa-exclamation-triangle warning-icon"></i>
                  <h3>Delete Shop Owner</h3>
                </div>
                <div className="confirmation-body">
                  <p>Are you sure you want to delete the shop owner <strong>"{owners.find(o => o.id === showDeleteConfirm)?.name}"</strong>?</p>
                  <p className="warning-text">This action cannot be undone and will permanently remove the owner and all associated data from the system.</p>
                </div>
                <div className="form-actions">
                  <button className="submit-btn delete-confirm" onClick={() => confirmDeleteOwner(showDeleteConfirm)}>
                    <i className="fas fa-trash"></i>
                    Yes, Delete
                  </button>
                  <button className="cancel-btn" onClick={() => setShowDeleteConfirm(null)}>
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Delete Shop Confirmation Modal */}
          {showDeleteShopConfirm && (
            <div className="modal-overlay">
              <div className="confirmation-modal">
                <div className="confirmation-header">
                  <i className="fas fa-exclamation-triangle warning-icon"></i>
                  <h3>Delete Shop</h3>
                </div>
                <div className="confirmation-body">
                  <p>Are you sure you want to delete the shop <strong>"{shops.find(s => s.id === showDeleteShopConfirm)?.name}"</strong>?</p>
                  <p className="warning-text">This action cannot be undone and will permanently remove the shop and all associated data from the system.</p>
                </div>
                <div className="form-actions">
                  <button
                    className="submit-btn delete-confirm"
                    onClick={() => confirmDeleteShop(showDeleteShopConfirm)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-trash"></i>
                        Yes, Delete
                      </>
                    )}
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setShowDeleteShopConfirm(null)}
                    disabled={loading}
                  >
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === "manage-shops" && (
            <div className="manage-shops">
              <div className="shops-header">
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
                      <div key={shop.id} className="shop-card-container">
                        <div className={`shop-card status-${shop.status || 'inactive'}`}>
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
                              <span className="detail-value">
                                {shop.address || 'N/A'}
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
                          </div>
                         
                          <div className="shop-status-actions">
                            <div className="status-buttons">
                              <button
                                className={`btn-status ${shop.status === 'active' ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  updateShopStatus(shop.id, 'active', e);
                                }}
                                title="Set as Active"
                              >
                                Active
                              </button>
                              <button
                                className={`btn-status ${shop.status === 'inactive' ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  updateShopStatus(shop.id, 'inactive', e);
                                }}
                                title="Set as Inactive"
                              >
                                Inactive
                              </button>
                              <button
                                className={`btn-status ${shop.status === 'suspended' ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  updateShopStatus(shop.id, 'suspended', e);
                                }}
                                title="Suspend Shop"
                              >
                                Suspend
                              </button>
                            </div>
                            <div className="action-buttons">
                              <button
                                className="btn-icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditShop(shop);
                                }}
                                title="Edit Shop"
                              >
                                Edit
                              </button>
                              <button
                                className="btn-icon danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteShopConfirm(shop.id);
                                }}
                                title="Delete Shop"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">Shop</div>
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
          {activeTab === "reports" && (
            <div className="reports-page">
              {/* Enhanced Reports Header */}
              <div className="reports-header">
                <div className="reports-header-content">
                  <div className="reports-title-section">
                    <h1>Business Analytics & Reports</h1>
                    <p>Historical data analysis, trends, and comprehensive business intelligence</p>
                  </div>
                  <div className="reports-actions">
                    <button 
                      className="report-action-btn refresh" 
                      onClick={() => fetchReportsData(reportsPeriod)}
                      disabled={reportsLoading}
                    >
                      {reportsLoading ? (
                        <>
                          <div className="spinner-small"></div> Refreshing...
                        </>
                      ) : (
                        <>
                          <FiDownload /> Refresh Data
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              {/* Time Period Selector */}
              <div className="reports-section time-period">
                <h2>Reporting Period</h2>
                <div className="period-selector">
                  <button 
                    className={`period-btn ${reportsPeriod === 'last_7_days' ? 'active' : ''}`}
                    onClick={() => setReportsPeriod('last_7_days')}
                  >
                    Last 7 Days
                  </button>
                  <button 
                    className={`period-btn ${reportsPeriod === 'last_30_days' ? 'active' : ''}`}
                    onClick={() => setReportsPeriod('last_30_days')}
                  >
                    Last 30 Days
                  </button>
                  <button 
                    className={`period-btn ${reportsPeriod === 'last_quarter' ? 'active' : ''}`}
                    onClick={() => setReportsPeriod('last_quarter')}
                  >
                    Last Quarter
                  </button>
                  <button 
                    className={`period-btn ${reportsPeriod === 'last_year' ? 'active' : ''}`}
                    onClick={() => setReportsPeriod('last_year')}
                  >
                    Last Year
                  </button>
                  <button 
                    className={`period-btn ${reportsPeriod === 'all_time' ? 'active' : ''}`}
                    onClick={() => setReportsPeriod('all_time')}
                  >
                    All Time
                  </button>
                </div>
              </div>
              {/* Historical Growth Trends */}
              <div className="reports-section growth-trends">
                <h2>Historical Growth Trends</h2>
                <div className="trends-grid">
                  <div className="trend-card">
                    <div className="trend-header">
                      <h4>Shop Registrations</h4>
                      <span className="trend-period">Past 6 Months</span>
                    </div>
                    <div className="trend-chart">
                      <div className="mini-bar" style={{height: '40%'}}></div>
                      <div className="mini-bar" style={{height: '55%'}}></div>
                      <div className="mini-bar" style={{height: '48%'}}></div>
                      <div className="mini-bar" style={{height: '72%'}}></div>
                      <div className="mini-bar" style={{height: '85%'}}></div>
                      <div className="mini-bar" style={{height: '100%'}}></div>
                    </div>
                    <div className="trend-stats">
                      <span className="trend-value">+{reportsData?.overall_stats?.total_shops || stats.totalShops || 0}</span>
                      <span className="trend-change positive">↑ {reportsData?.growth_trends?.shops_growth?.growth_percentage || 15}% Growth</span>
                    </div>
                  </div>
                  <div className="trend-card">
                    <div className="trend-header">
                      <h4>Owner Registration</h4>
                      <span className="trend-period">Past 6 Months</span>
                    </div>
                    <div className="trend-chart">
                      <div className="mini-bar" style={{height: '35%'}}></div>
                      <div className="mini-bar" style={{height: '42%'}}></div>
                      <div className="mini-bar" style={{height: '58%'}}></div>
                      <div className="mini-bar" style={{height: '65%'}}></div>
                      <div className="mini-bar" style={{height: '80%'}}></div>
                      <div className="mini-bar" style={{height: '100%'}}></div>
                    </div>
                    <div className="trend-stats">
                      <span className="trend-value">+{reportsData?.overall_stats?.total_owners || stats.totalOwners || 0}</span>
                      <span className="trend-change positive">↑ {reportsData?.growth_trends?.owners_growth?.growth_percentage || 12}% Growth</span>
                    </div>
                  </div>
                  <div className="trend-card">
                    <div className="trend-header">
                      <h4>Activation Rate</h4>
                      <span className="trend-period">Past 6 Months</span>
                    </div>
                    <div className="trend-chart">
                      <div className="mini-bar" style={{height: '68%'}}></div>
                      <div className="mini-bar" style={{height: '72%'}}></div>
                      <div className="mini-bar" style={{height: '70%'}}></div>
                      <div className="mini-bar" style={{height: '78%'}}></div>
                      <div className="mini-bar" style={{height: '82%'}}></div>
                      <div className="mini-bar" style={{height: '100%'}}></div>
                    </div>
                    <div className="trend-stats">
                      <span className="trend-value">{reportsData?.growth_trends?.activation_rate?.current_period || (stats.totalShops ? Math.round((stats.activeShops / stats.totalShops) * 100) : 0)}%</span>
                      <span className="trend-change positive">↑ {reportsData?.growth_trends?.activation_rate?.growth_percentage || 8}% Increase</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Owner Performance Breakdown */}
              <div className="reports-section owner-breakdown">
                <h2>Owner Performance Breakdown</h2>
                <div className="owner-table-container">
                  <table className="owner-performance-table">
                    <thead>
                      <tr>
                        <th>Owner</th>
                        <th>Total Shops</th>
                        <th>Active</th>
                        <th>Inactive</th>
                        <th>Success Rate</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsLoading ? (
                        <tr>
                          <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>
                            <div className="spinner"></div>
                            <p>Loading reports...</p>
                          </td>
                        </tr>
                      ) : reportsData?.owner_breakdown && reportsData.owner_breakdown.length > 0 ? (
                        reportsData.owner_breakdown.map((owner) => (
                          <tr key={owner.owner_id}>
                            <td>
                              <div className="owner-cell">
                                <div className="owner-avatar-small">{owner.owner_name?.charAt(0) || 'O'}</div>
                                <span>{owner.owner_name || 'Unknown'}</span>
                              </div>
                            </td>
                            <td><strong>{owner.total_shops}</strong></td>
                            <td><span className="badge-success">{owner.active_shops}</span></td>
                            <td><span className="badge-warning">{owner.inactive_shops}</span></td>
                            <td>
                              <div className="rate-bar">
                                <div className="rate-fill" style={{width: `${owner.success_rate}%`}}></div>
                                <span>{owner.success_rate}%</span>
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge-sm ${owner.status === 'excellent' ? 'active' : owner.status === 'good' ? 'warning' : 'danger'}`}>
                                {owner.status === 'excellent' ? 'Excellent' : owner.status === 'good' ? 'Good' : 'Needs Attention'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>
                            <p>No owner data available</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Shop-wise Breakdown */}
              <div className="reports-section shop-breakdown">
                <h2>Shop-wise Performance</h2>
                <div className="shop-filter-container">
                  <div className="input-group">
                    <FiSearch className="input-icon" />
                    <input
                      type="text"
                      placeholder="Enter Shop ID or Shop Name to view details..."
                      value={shopSearchFilter}
                      onChange={(e) => setShopSearchFilter(e.target.value)}
                      className="shop-id-input"
                    />
                    {shopSearchFilter && (
                      <button 
                        className="clear-filter-btn"
                        onClick={() => setShopSearchFilter('')}
                        title="Clear filter"
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                </div>
                <div className="shop-breakdown-grid">
                  {reportsLoading ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Loading shop data...</p>
                    </div>
                  ) : reportsData?.shop_breakdown && reportsData.shop_breakdown.length > 0 ? (
                    (() => {
                      const filteredShops = shopSearchFilter 
                        ? reportsData.shop_breakdown.filter(shop => 
                            shop.shop_id.toString() === shopSearchFilter.toString() ||
                            shop.shop_name.toLowerCase().includes(shopSearchFilter.toLowerCase())
                          )
                        : [];
                      
                      if (shopSearchFilter && filteredShops.length === 0) {
                        return (
                          <div className="empty-state">
                            <p>No shop found matching: {shopSearchFilter}</p>
                            <small>Try searching by Shop ID or Shop Name</small>
                          </div>
                        );
                      }
                      
                      if (!shopSearchFilter) {
                        return (
                          <div className="empty-state">
                            <FiSearch size={48} style={{color: '#9ca3af', marginBottom: '1rem'}} />
                            <p>Enter a Shop ID or Shop Name to view performance details</p>
                            <small>Type the Shop ID or Name in the search box above</small>
                          </div>
                        );
                      }
                      
                      return filteredShops.map((shop) => (
                        <div key={shop.shop_id} className="shop-breakdown-card">
                          <div className="shop-breakdown-header">
                            <h4>{shop.shop_name}</h4>
                            <span className={`status-badge ${shop.status}`}>{shop.status}</span>
                          </div>
                          <div className="shop-breakdown-details">
                            <div className="detail-item">
                              <span className="label">Shop ID:</span>
                              <span className="value">{shop.shop_id}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Owner:</span>
                              <span className="value">{shop.owner_name}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Location:</span>
                              <span className="value">{shop.city || shop.state || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Total Orders:</span>
                              <span className="value">{shop.total_orders}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Revenue:</span>
                              <span className="value">₹{shop.total_revenue.toFixed(2)}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Products:</span>
                              <span className="value">{shop.total_products}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Customers:</span>
                              <span className="value">{shop.total_customers}</span>
                            </div>
                          </div>
                        </div>
                      ));
                    })()
                  ) : (
                    <div className="empty-state">
                      <p>No shop data available</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Overall Statistics Summary */}
              <div className="reports-section overall-summary">
                <h2>Overall Statistics</h2>
                <div className="summary-grid">
                  <div className="summary-card">
                    <div className="summary-icon revenue">
                      <FiBarChart2 size={32} />
                    </div>
                    <div className="summary-content">
                      <h3>Total Revenue</h3>
                      <p className="summary-value">₹{reportsData?.overall_stats?.total_revenue?.toFixed(2) || '0.00'}</p>
                      <span className="summary-label">From {reportsData?.overall_stats?.total_orders || 0} orders</span>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-icon shops">
                      <FiShoppingBag size={32} />
                    </div>
                    <div className="summary-content">
                      <h3>Active Shops</h3>
                      <p className="summary-value">{reportsData?.overall_stats?.active_shops || 0}</p>
                      <span className="summary-label">Out of {reportsData?.overall_stats?.total_shops || 0} total</span>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-icon customers">
                      <FiUsers size={32} />
                    </div>
                    <div className="summary-content">
                      <h3>Total Customers</h3>
                      <p className="summary-value">{reportsData?.overall_stats?.total_customers || 0}</p>
                      <span className="summary-label">Registered customers</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Export Options */}
              <div className="reports-section export-section">
                <h2>Export & Download Options</h2>
                <div className="export-options">
                  <button 
                    className="export-option-btn" 
                    onClick={handleExportPDF}
                    disabled={exportingPDF}
                  >
                    {exportingPDF ? (
                      <>
                        <div className="spinner-small"></div>
                        <span>Downloading...</span>
                        <small>Please wait</small>
                      </>
                    ) : (
                      <>
                        <FiDownload size={24} />
                        <span>Download PDF Report</span>
                        <small>Complete analytics report</small>
                      </>
                    )}
                  </button>
                  <button 
                    className="export-option-btn" 
                    onClick={handleExportExcel}
                    disabled={exportingExcel}
                  >
                    {exportingExcel ? (
                      <>
                        <div className="spinner-small"></div>
                        <span>Exporting...</span>
                        <small>Please wait</small>
                      </>
                    ) : (
                      <>
                        <FiDownload size={24} />
                        <span>Export to Excel</span>
                        <small>Raw data for analysis</small>
                      </>
                    )}
                  </button>
                  <button 
                    className="export-option-btn" 
                    onClick={handleExportSummary}
                    disabled={exportingSummary}
                  >
                    {exportingSummary ? (
                      <>
                        <div className="spinner-small"></div>
                        <span>Generating...</span>
                        <small>Please wait</small>
                      </>
                    ) : (
                      <>
                        <FiDownload size={24} />
                        <span>Generate Summary</span>
                        <small>Executive summary</small>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="settings-page">
              <div className="settings-header">
                <h1><FiSettings /> Settings</h1>
                <p>Manage your account, company settings, and system preferences</p>
              </div>
              {/* Settings Navigation Tabs */}
              <div className="settings-tabs">
                <button
                  className={`settings-tab ${activeSettingsTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveSettingsTab('profile')}
                >
                  <FiUser /> Admin Profile
                </button>
                <button
                  className={`settings-tab ${activeSettingsTab === 'company' ? 'active' : ''}`}
                  onClick={() => setActiveSettingsTab('company')}
                >
                  <FiSettings /> Company Settings
                </button>
                <button
                  className={`settings-tab ${activeSettingsTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveSettingsTab('security')}
                >
                  <FiShield /> Security
                </button>
              </div>

              {/* ---------- Admin Profile ---------- */}
              {activeSettingsTab === 'profile' && (
                <div className="settings-section">
                  <h2>Admin Profile</h2>
                  <form onSubmit={handleUpdateProfile} className="settings-form">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={adminProfile.name}
                        onChange={(e) =>
                          setAdminProfile({ ...adminProfile, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={adminProfile.email}
                        onChange={(e) =>
                          setAdminProfile({ ...adminProfile, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input
                        type="tel"
                        value={adminProfile.mobile}
                        onChange={(e) =>
                          setAdminProfile({ ...adminProfile, mobile: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        value={adminProfile.address}
                        onChange={(e) =>
                          setAdminProfile({ ...adminProfile, address: e.target.value })
                        }
                      />
                    </div>
                    <button type="submit" disabled={settingsLoading}>
                      {settingsLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </form>
                </div>
              )}

              {/* ---------- Company Settings ---------- */}
              {activeSettingsTab === 'company' && (
                <div className="settings-section">
                  <h2>Company Settings</h2>
                  <form onSubmit={handleUpdateCompanySettings} className="settings-form">
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={companySettings.companyName}
                        onChange={(e) =>
                          setCompanySettings({ ...companySettings, companyName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Email</label>
                      <input
                        type="email"
                        value={companySettings.companyEmail}
                        onChange={(e) =>
                          setCompanySettings({ ...companySettings, companyEmail: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Phone</label>
                      <input
                        type="tel"
                        value={companySettings.companyPhone}
                        onChange={(e) =>
                          setCompanySettings({ ...companySettings, companyPhone: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Address</label>
                      <textarea
                        rows={3}
                        value={companySettings.companyAddress}
                        onChange={(e) =>
                          setCompanySettings({ ...companySettings, companyAddress: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Timezone</label>
                        <select
                          value={companySettings.timezone}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, timezone: e.target.value })
                          }
                        >
                          <option value="UTC">UTC</option>
                          <option value="Asia/Kolkata">Asia/Kolkata</option>
                          <option value="America/New_York">America/New_York</option>
                          {/* add more as needed */}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Currency</label>
                        <select
                          value={companySettings.currency}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, currency: e.target.value })
                          }
                        >
                          <option value="USD">USD</option>
                          <option value="INR">INR</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Language</label>
                        <select
                          value={companySettings.language}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, language: e.target.value })
                          }
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="es">Spanish</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" disabled={settingsLoading}>
                      {settingsLoading ? 'Saving...' : 'Save Company Settings'}
                    </button>
                  </form>
                </div>
              )}

              {/* ---------- Security ---------- */}
              {activeSettingsTab === 'security' && (
                <div className="settings-section">
                  <h2>Change Password</h2>
                  <form onSubmit={handleChangePassword} className="settings-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={securitySettings.currentPassword}
                        onChange={(e) =>
                          setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={securitySettings.newPassword}
                        onChange={(e) =>
                          setSecuritySettings({ ...securitySettings, newPassword: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={securitySettings.confirmPassword}
                        onChange={(e) =>
                          setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })
                        }
                        required
                      />
                    </div>
                    <button type="submit" disabled={settingsLoading}>
                      {settingsLoading ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              )}


            </div>
          )}

          {/* ---------- Status Change Confirmation Modal ---------- */}
          {statusChangeModal.isOpen && (
            <div className="modal-overlay">
              <div className="confirmation-modal">
                <div className="confirmation-header">
                  <h3>Confirm Status Change</h3>
                </div>
                <div className="confirmation-body">
                  <p>
                    Change <strong>{statusChangeModal.shopName}</strong> status from{' '}
                    <strong>{statusChangeModal.oldStatus}</strong> to{' '}
                    <strong>{statusChangeModal.newStatus}</strong>?
                  </p>
                  {statusChangeModal.newStatus === 'suspended' && (
                    <p className="warning-text">
                      Suspending a shop will log the owner out of all sessions.
                    </p>
                  )}
                </div>
                <div className="form-actions">
                  <button
                    className="submit-btn"
                    onClick={confirmStatusChange}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Confirm'}
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={closeStatusChangeModal}
                    disabled={loading}
                  >
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