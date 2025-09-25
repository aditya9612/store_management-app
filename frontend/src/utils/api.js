import axios from 'axios';

// Create axios instance with base config
export const api = axios.create({
  baseURL: 'http://localhost:8000',
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
    const message = error.response?.data?.detail || error.response?.data?.message || error.response?.data?.error || 'An unexpected error occurred';
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
      throw new Error(error.message);
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
      throw new Error(error.message);
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
  requestOTP: async (mobile) => {
    try {
      console.log('📱 Requesting OTP for mobile:', mobile);
      const response = await api.post('/auth/request-otp', {
        mobile,
        role: 'owner' // Hardcoded as per requirement
      });
      console.log('📬 OTP requested successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ OTP request failed:', error);
      throw new Error(error.message); // Propagate the error message from the interceptor
    }
  },

  // Verify OTP
  verifyOTP: async (mobile, otp) => {
    try {
      console.log('🔐 Verifying OTP for mobile:', mobile);
      const response = await api.post('/auth/verify-otp', {
        mobile,
        otp,
        role: 'owner' // Hardcoded as per requirement
      });
      console.log('✅ OTP verified successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      throw new Error(error.message); // Propagate the error message from the interceptor
    }
  },

  // Get shops for an owner
  getShops: async (ownerId) => {
    try {
      console.log('🏪 Fetching shops for owner:', ownerId);
      const response = await api.get(`/stores?owner_id=${ownerId}`);
      console.log('📋 Shops fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch shops:', error);
      throw new Error(error.message); // Propagate the error message
    }
  },

  // Create a new shop
  createShop: async (shopData) => {
    try {
      console.log('🏗️ Creating new shop:', shopData);
      const response = await api.post('/stores/create', {
        name: shopData.name,
        location: shopData.location,
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
      const response = await axios.post(`http://localhost:8000/customers/upload-bulk/?store_id=${storeId}`, formData, {
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
        throw new Error('Cannot connect to backend server. Please ensure the backend is running on http://localhost:8000');
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
      console.log('✅ Owner deleted:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete owner:', error);
      throw new Error(error.message);
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
      throw new Error(error.message);
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
      const response = await axios({
        url: `http://localhost:8000/orders/${orderId}/download-invoice`,
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