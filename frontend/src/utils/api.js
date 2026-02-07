import axios from 'axios';

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with base config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      status: response.status,
      data: response.data
    });
    return response.data;
  },
  (error) => {
    // Log the full error details
    console.error('❌ Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });

    // Handle network errors specifically
    if (!error.response) {
      if (error.message === 'Network Error' || error.code === 'ERR_INTERNET_DISCONNECTED') {
        throw new Error('Please check your internet connection and try again');
      }
      throw new Error('Unable to connect to the server. Please try again later');
    }

    // Handle API errors by throwing the backend's message
    const message = error.response?.data?.detail || error.response?.data?.message || error.response?.data?.error || error.response?.data?.error || 'An unexpected error occurred';
    throw new Error(message);
  }
);

// Auth Service
export const authService = {
  // Store details
  getStoreDetails: async (storeId) => {
    try {
      console.log('🏪 Fetching store details for:', storeId);
      const response = await api.get(`/stores/details?store_id=${storeId}`);
      console.log('📋 Store details fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch store details:', error);

      // Enhanced error handling to match the interceptor pattern
      if (!error.response) {
        if (error.message === 'Network Error' || error.code === 'ERR_INTERNET_DISCONNECTED') {
          throw new Error('Please check your internet connection and try again');
        }
        throw new Error('Unable to connect to the server. Please try again later');
      }

      // Handle API errors by throwing the backend's message
      const message = error.response?.data?.detail || error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch store details';
      throw new Error(message);
    }
  },

  // Update shop
  updateShop: async (storeId, shopData) => {
    try {
      console.log('🔄 Updating shop:', storeId, shopData);
      const response = await api.put(`/stores/${storeId}`, shopData);
      console.log('✅ Shop updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update shop:', error);
      console.error('❌ Error response:', error.response);

      // Enhanced error handling for validation errors
      if (error.response && error.response.status === 422) {
        const detail = error.response?.data?.detail;
        console.log('🔍 422 Error details:', error.response.data);
        if (detail && Array.isArray(detail)) {
          // FastAPI returns validation errors as array
          const errorMessages = detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
          throw new Error(`Validation error: ${errorMessages}`);
        } else if (detail) {
          throw new Error(`Validation error: ${detail}`);
        } else {
          throw new Error('Invalid request format. Please check your input data.');
        }
      }

      if (error.response && error.response.status === 404) {
        throw new Error(`Shop with ID ${storeId} not found. Please refresh and try again.`);
      }

      if (error.response && error.response.status === 403) {
        throw new Error('Access denied. Please check your authentication.');
      }

      // Handle network errors or no response
      if (!error.response) {
        if (error.message === 'Network Error' || error.code === 'ERR_INTERNET_DISCONNECTED') {
          throw new Error('Please check your internet connection and try again');
        }
        throw new Error('Unable to connect to the server. Please try again later');
      }

      // Handle other API errors by throwing the backend's message
      const message = error.response?.data?.detail || error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update shop';
      throw new Error(message);
    }
  },

  // Delete shop
  deleteShop: async (storeId) => {
    try {
      console.log('🗑️ Deleting shop:', storeId);
      const response = await api.delete(`/stores/${storeId}`);
      console.log('✅ Shop deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete shop:', error);
      throw new Error(error.message);
    }
  },
  // Request OTP
  requestOTP: async (mobile, role = 'owner') => {
    try {
      console.log('📱 Requesting OTP for mobile:', mobile, 'role:', role);
      const response = await api.post('/auth/request-otp', {
        mobile,
        role
      });
      console.log('📬 OTP requested successfully for', role, ':', response);
      return response;
    } catch (error) {
      console.error('❌ OTP request failed for', role, ':', error);
      throw new Error(error.message); // Propagate the error message from the interceptor
    }
  },

  // Verify OTP
  verifyOTP: async (mobile, otp, role = 'owner') => {
    try {
      console.log('🔐 Verifying OTP for mobile:', mobile, 'role:', role);
      const response = await api.post('/auth/verify-otp', {
        mobile,
        otp,
        role
      });
      console.log('✅ OTP verified successfully for', role, ':', response);
      return response;
    } catch (error) {
      console.error('❌ OTP verification failed for', role, ':', error);
      throw new Error(error.message); // Propagate the error message from the interceptor
    }
  },

  // Get shops for an owner
  getShops: async (ownerId) => {
    try {
      console.log('Fetching shops for owner:', ownerId);
      const response = await api.get(`/stores?owner_id=${ownerId}`);
      console.log('Shops fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to fetch shops:', error);

      // Enhanced error handling to match the interceptor pattern
      if (!error.response) {
        if (error.message === 'Network Error' || error.code === 'ERR_INTERNET_DISCONNECTED') {
          throw new Error('Please check your internet connection and try again');
        }
        throw new Error('Unable to connect to the server. Please try again later');
      }

      // Handle API errors by throwing the backend's message
      const message = error.response?.data?.detail || error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch shops';
      throw new Error(message);
    }
  },

  // Update shop status
  updateShopStatus: async (storeId, statusData) => {
    try {
      console.log('Updating shop status for store:', storeId, statusData);
      const response = await api.put(`/stores/${storeId}/status`, statusData);
      console.log('Shop status updated successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to update shop status:', error);
      throw new Error(error.message); // Propagate the error message
    }
  },

  // Create a new shop
  createShop: async (shopData) => {
    try {
      console.log('🏗️ Creating new shop:', shopData);
      const response = await api.post('/stores/create', {
        name: shopData.name,
        address: shopData.address,
        city: shopData.city,
        state: shopData.state,
        pincode: shopData.pincode,
        gstin: shopData.gstin || null,
        status: shopData.status || 'active',
        owner_id: shopData.owner_id
      });
      console.log('✨ Shop created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create shop:', error);
      throw new Error(error.message); // Propagate the error message
    }
  },

  // Customers: list by store
  getCustomersByStore: async (storeId) => {
    try {
      console.log('👥 Fetching customers for store:', storeId);
      const response = await api.get(`/customers/by-store/${storeId}`);
      console.log('📋 Customers fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch customers:', error);
      throw new Error(error.message);
    }
  },

  // Customers: create
  createCustomer: async (customerData) => {
    try {
      console.log('➕ Creating customer:', customerData);
      const response = await api.post('/customers', customerData);
      console.log('✅ Customer created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create customer:', error);
      throw new Error(error.message);
    }
  },

  // Customers: bulk upload
  bulkUploadCustomers: async (storeId, file) => {
    try {
      console.log('📤 Bulk uploading customers for store:', storeId);

      const formData = new FormData();
      formData.append('file', file);
      // Note: store_id is passed as query parameter, not in FormData

      // Use axios directly for file uploads to ensure proper FormData handling
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/customers/upload-bulk/?store_id=${storeId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });

      console.log('✅ Bulk upload completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Bulk upload failed:', error);

      // Enhanced error handling
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to backend server. Please ensure the backend is running.');
      }

      if (error.response?.status === 403) {
        throw new Error('Access denied. Please check your authentication token.');
      }

      if (error.response?.status === 404) {
        throw new Error('Upload endpoint not found. Please check if the backend is properly configured.');
      }

      if (error.response?.status === 422) {
        const detail = error.response?.data?.detail;
        if (detail && Array.isArray(detail)) {
          // FastAPI returns validation errors as array
          const errorMessages = detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
          throw new Error(`Validation error: ${errorMessages}`);
        } else if (detail) {
          throw new Error(`Validation error: ${detail}`);
        } else {
          throw new Error('Invalid request format. Please check the file format and try again.');
        }
      }

      const message = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to upload customers';
      throw new Error(message);
    }
  },

  // Create a new owner
  createOwner: async (ownerData) => {
    try {
      console.log('➕ Creating owner:', ownerData);
      const response = await api.post('/owners', ownerData);
      console.log('✅ Owner created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create owner:', error);
      throw new Error(error.message);
    }
  },

  // Get all owners
  getOwners: async () => {
    try {
      console.log('👥 Fetching all owners');
      const response = await api.get('/owners');
      console.log('📋 Owners fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch owners:', error);
      throw new Error(error.message);
    }
  },

  // Update an owner
  updateOwner: async (ownerId, ownerData) => {
    try {
      console.log('🔄 Updating owner:', ownerId, ownerData);
      const response = await api.put(`/owners/${ownerId}`, ownerData);
      console.log('✅ Owner updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update owner:', error);
      throw new Error(error.message);
    }
  },

  // Delete an owner
  deleteOwner: async (ownerId) => {
    try {
      console.log('🗑️ Deleting owner:', ownerId);
      const response = await api.delete(`/owners/${ownerId}`);
      console.log('✅ Owner deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete owner:', error);
      throw new Error(error.message);
    }
  },

  // Send notification to user (owner or storeman)
  sendNotification: async (notificationData) => {
    try {
      console.log('📬 Sending notification:', notificationData);
      const response = await api.post('/admin/notifications/send', notificationData);
      console.log('✅ Notification sent successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      throw new Error(error.message || 'Failed to send notification');
    }
  },

  // Force logout shop owner
  forceLogoutShopOwner: async (ownerId) => {
    try {
      console.log(`🔒 Forcing logout for shop owner: ${ownerId}`);
      const response = await api.post(`/admin/auth/force-logout/owner/${ownerId}`);
      console.log('✅ Force logout triggered successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to force logout shop owner:', error);
      throw new Error(error.message || 'Failed to force logout shop owner');
    }
  }
};

// Owner Settings API
export const ownerSettingsApi = {
  // Get owner settings
  getSettings: async (ownerId) => {
    try {
      console.log(` Fetching settings for owner ${ownerId}`);
      const response = await api.get(`/owners/${ownerId}/settings`);
      console.log(' Owner settings fetched:', response);
      return response;
    } catch (error) {
      console.error(' Failed to fetch owner settings:', error);
      throw new Error(error.message || 'Failed to fetch owner settings');
    }
  },

  // Update owner settings
  updateSettings: async (ownerId, settings) => {
    try {
      console.log(` Updating settings for owner ${ownerId}:`, settings);
      const response = await api.put(`/owners/${ownerId}/settings`, settings);
      console.log(' Owner settings updated:', response);
      return response;
    } catch (error) {
      console.error(' Failed to update owner settings:', error);
      throw new Error(error.message || 'Failed to update owner settings');
    }
  }
};

// Owner Reports API
export const ownerReportsApi = {
  // Get owner reports overview
  getOverview: async (ownerId, period = 'all_time') => {
    try {
      console.log(` Fetching owner reports for owner ${ownerId}`);
      const response = await api.get(`/owner/reports/overview/${ownerId}?period=${period}`);
      console.log(' Owner reports fetched:', response);
      return response;
    } catch (error) {
      console.error(' Failed to fetch owner reports:', error);
      throw new Error(error.message);
    }
  },

  // Get owner revenue report
  getRevenue: async (ownerId, period = 'all_time') => {
    try {
      console.log(` Fetching owner revenue for owner ${ownerId}`);
      const response = await api.get(`/owner/reports/revenue/${ownerId}?period=${period}`);
      console.log(' Owner revenue fetched:', response);
      return response;
    } catch (error) {
      console.error(' Failed to fetch owner revenue:', error);
      throw new Error(error.message);
    }
  },

  // Get owner sales report
  getSales: async (ownerId, period = 'all_time') => {
    try {
      console.log(` Fetching owner sales for owner ${ownerId}`);
      const response = await api.get(`/owner/reports/sales/${ownerId}?period=${period}`);
      console.log(' Owner sales fetched:', response);
      return response;
    } catch (error) {
      console.error(' Failed to fetch owner sales:', error);
      throw new Error(error.message);
    }
  },

  // Export to Excel
  exportToExcel: async (ownerId, period = 'all_time') => {
    try {
      console.log(' Exporting owner report to Excel');
      const response = await fetch(`${API_URL}/owner/reports/export/excel/${ownerId}?period=${period}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `owner_report_${ownerId}_${period}_${Date.now()}.csv`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      console.log(' Excel exported successfully');
      return true;
    } catch (error) {
      console.error(' Failed to export Excel:', error);
      throw error;
    }
  },

  // Export to PDF
  exportToPDF: async (ownerId, period = 'all_time') => {
    try {
      console.log(' Exporting owner report to PDF');
      const response = await fetch(`${API_URL}/owner/reports/export/pdf/${ownerId}?period=${period}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `owner_report_${ownerId}_${period}_${Date.now()}.html`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      console.log(' PDF exported successfully');
      return true;
    } catch (error) {
      console.error(' Failed to export PDF:', error);
      throw error;
    }
  }
};

// Products API
export const productsApi = {
  create: async ({ name, price, description, store_id, imageFile }) => {
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('price', price);
      form.append('store_id', store_id);
      if (description) form.append('description', description);
      if (imageFile) form.append('image', imageFile);
      const response = await api.post('/products', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  list: async (storeId) => {
    try {
      const response = await api.get(`/products?store_id=${storeId}`);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  update: async (productId, productData) => {
    try {
      const form = new FormData();
      if (productData.name) form.append('name', productData.name);
      if (productData.price) form.append('price', productData.price);
      if (productData.description) form.append('description', productData.description);
      if (productData.imageFile) form.append('image', productData.imageFile);

      const response = await api.put(`/products/${productId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  remove: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

// Orders API
export const ordersApi = {
  create: async (order) => {
    try {
      const response = await api.post('/orders', order);
      return response;
    } catch (error) {
      // Create a more detailed error object
      const apiError = new Error(error.message);
      
      // Attach response data if available
      if (error.response) {
        apiError.response = {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        };
      } else if (error.request) {
        // The request was made but no response was received
        apiError.request = error.request;
      }
      
      // Add the original error config
      apiError.config = error.config;
      
      throw apiError;
    }
  },
  listByStore: async (storeId) => {
    try {
      const response = await api.get(`/orders/by-store/${storeId}`);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  listByCustomer: async (customerId) => {
    try {
      const response = await api.get(`/orders/by-customer/${customerId}`);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  generateInvoice: async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/invoice`);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  downloadInvoice: async (orderId) => {
    try {
      // Use axios directly to get the raw response with responseType blob
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios({
        url: `${apiUrl}/orders/${orderId}/download-invoice`,
        method: 'GET',
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to download invoice');
    }
  },
  remove: async (orderId) => {
    try {
      const response = await api.delete(`/orders/${orderId}`);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

// Offers API
export const offersApi = {
  create: async (offer) => {
    try {
      const response = await api.post('/offers', offer);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  listByStore: async (storeId) => {
    try {
      const response = await api.get(`/offers/by-store/${storeId}`);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  sendToAllCustomers: async (offerId) => {
    try {
      const response = await api.post(`/offers/${offerId}/send`);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  update: async (offerId, offerData) => {
    try {
      const response = await api.put(`/offers/${offerId}`, offerData);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  remove: async (offerId) => {
    try {
      const response = await api.delete(`/offers/${offerId}`);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

// Customers API
export const customersApi = {
  update: async (customerId, customerData) => {
    try {
      const response = await api.put(`/customers/${customerId}`, customerData);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  remove: async (customerId) => {
    try {
      const response = await api.delete(`/customers/${customerId}`);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

// Settings API
export const settingsApi = {
  // Get company settings
  getCompanySettings: async () => {
    try {
      console.log('🔧 Fetching company settings');
      const response = await api.get('/admin/settings/company');
      console.log('✅ Company settings fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch company settings:', error);
      throw new Error(error.message);
    }
  },
  
  // Update company settings
  updateCompanySettings: async (settingsData) => {
    try {
      console.log('🔄 Updating company settings:', settingsData);
      const response = await api.put('/admin/settings/company', settingsData);
      console.log('✅ Company settings updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update company settings:', error);
      throw new Error(error.message);
    }
  },
  
  // Get admin profile
  getAdminProfile: async () => {
    try {
      console.log('👤 Fetching admin profile');
      const response = await api.get('/admin/profile');
      console.log('✅ Admin profile fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch admin profile:', error);
      throw new Error(error.message);
    }
  },
  
  // Update admin profile
  updateAdminProfile: async (profileData) => {
    try {
      console.log('🔄 Updating admin profile:', profileData);
      const response = await api.put('/admin/profile', profileData);
      console.log('✅ Admin profile updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update admin profile:', error);
      throw new Error(error.message);
    }
  },
  
  // Change admin password
  changePassword: async (passwordData) => {
    try {
      console.log('🔐 Changing admin password');
      const response = await api.post('/admin/change-password', passwordData);
      console.log('✅ Password changed successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to change password:', error);
      throw new Error(error.message);
    }
  },
  
  // Export data
  exportData: async (dataType) => {
    try {
      console.log('📤 Exporting data:', dataType);
      const response = await api.get(`/admin/export/${dataType}`, {
        responseType: 'blob'
      });
      console.log('✅ Data exported successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to export data:', error);
      throw new Error(error.message);
    }
  }
};

// Reports API
export const reportsApi = {
  // Get comprehensive reports overview
  getOverview: async (period = 'all_time') => {
    try {
      console.log('📊 Fetching reports overview');
      const response = await api.get(`/admin/reports/overview?period=${period}`);
      console.log('✅ Reports overview fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch reports overview:', error);
      throw new Error(error.message);
    }
  },
  
  // Get shop statistics
  getShopReports: async () => {
    try {
      console.log('🏪 Fetching shop reports');
      const response = await api.get('/admin/reports/shops');
      console.log('✅ Shop reports fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch shop reports:', error);
      throw new Error(error.message);
    }
  },
  
  // Get revenue statistics
  getRevenueReport: async () => {
    try {
      console.log('💰 Fetching revenue report');
      const response = await api.get('/admin/reports/revenue');
      console.log('✅ Revenue report fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch revenue report:', error);
      throw new Error(error.message);
    }
  },
  
  // Get inventory statistics
  getInventoryReport: async () => {
    try {
      console.log('📦 Fetching inventory report');
      const response = await api.get('/admin/reports/inventory');
      console.log('✅ Inventory report fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch inventory report:', error);
      throw new Error(error.message);
    }
  },
  
  // Export to PDF
  exportToPDF: async (period = 'all_time') => {
    try {
      console.log('📄 Exporting to PDF');
      const response = await fetch(`${API_URL}/admin/reports/export/pdf?period=${period}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business_report_${period}_${Date.now()}.html`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log('✅ PDF exported successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to export PDF:', error);
      throw error;
    }
  },
  
  // Export to Excel
  exportToExcel: async (period = 'all_time') => {
    try {
      console.log('📊 Exporting to Excel');
      const response = await fetch(`${API_URL}/admin/reports/export/excel?period=${period}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business_report_${period}_${Date.now()}.csv`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log('✅ Excel exported successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to export Excel:', error);
      throw error;
    }
  },
  
  // Export Summary
  exportSummary: async (period = 'all_time') => {
    try {
      console.log('📋 Exporting summary');
      const response = await fetch(`${API_URL}/admin/reports/export/summary?period=${period}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `executive_summary_${period}_${Date.now()}.json`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log('✅ Summary exported successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to export summary:', error);
      throw error;
    }
  }
};

// Activity API
export const activityApi = {
  // Get recent activities
  getRecentActivities: async (limit = 20) => {
    try {
      console.log('📋 Fetching recent activities');
      const response = await api.get(`/admin/activities/recent?limit=${limit}`);
      console.log('✅ Recent activities fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch recent activities:', error);
      throw new Error(error.message);
    }
  },
  
  // Get activities by type
  getActivitiesByType: async (activityType, limit = 10) => {
    try {
      console.log(`📋 Fetching activities of type: ${activityType}`);
      const response = await api.get(`/admin/activities/by-type/${activityType}?limit=${limit}`);
      console.log('✅ Activities by type fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch activities by type:', error);
      throw new Error(error.message);
    }
  },
  
  // Get activities for specific entity
  getActivitiesByEntity: async (entityType, entityId) => {
    try {
      console.log(`📋 Fetching activities for ${entityType} ${entityId}`);
      const response = await api.get(`/admin/activities/entity/${entityType}/${entityId}`);
      console.log('✅ Entity activities fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch entity activities:', error);
      throw new Error(error.message);
    }
  },
  
  // Log a new activity
  logActivity: async (activityData) => {
    try {
      console.log('📝 Logging new activity:', activityData);
      const response = await api.post('/admin/activities/log', activityData);
      console.log('✅ Activity logged:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to log activity:', error);
      throw new Error(error.message);
    }
  }
};