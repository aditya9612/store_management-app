"""
Authentication Context and State Management for Shop Management System

This provides centralized authentication and state management using React Context API.
"""

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Action types
const AUTH_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  SET_SELECTED_SHOP: 'SET_SELECTED_SHOP',
  UPDATE_SHOP_DATA: 'UPDATE_SHOP_DATA'
};

// Initial state
const initialState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
  selectedShop: null,
  shopData: {
    customers: [],
    products: [],
    orders: [],
    offers: [],
    inventory: []
  }
};

// Reducer function
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        user: action.payload.user,
        selectedShop: action.payload.selectedShop || null
      };

    case AUTH_ACTIONS.LOGOUT:
      // Clear all shop data from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('shop_') || key.startsWith('customers_') ||
            key.startsWith('products_') || key.startsWith('offers_') ||
            key.startsWith('invoices_')) {
          localStorage.removeItem(key);
        }
      });

      return {
        ...initialState,
        isLoading: false
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case AUTH_ACTIONS.SET_SELECTED_SHOP:
      return {
        ...state,
        selectedShop: action.payload
      };

    case AUTH_ACTIONS.UPDATE_SHOP_DATA:
      return {
        ...state,
        shopData: {
          ...state.shopData,
          ...action.payload
        }
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const ownerId = localStorage.getItem('owner_id');
        const ownerName = localStorage.getItem('owner_name');
        const selectedStoreId = localStorage.getItem('selectedStoreId');
        const storeName = localStorage.getItem('store_name');
        const role = localStorage.getItem('role');

        if (ownerId && ownerName) {
          const user = {
            id: parseInt(ownerId),
            name: ownerName,
            role: role || 'owner'
          };

          const selectedShop = selectedStoreId ? {
            id: parseInt(selectedStoreId),
            name: storeName || 'Store'
          } : null;

          dispatch({
            type: AUTH_ACTIONS.LOGIN,
            payload: { user, selectedShop }
          });
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initializeAuth();
  }, []);

  // Auto-logout on shop suspension
  useEffect(() => {
    if (!state.user?.id) return;

    const checkSuspension = () => {
      const suspensionFlag = localStorage.getItem(`shop_suspended_${state.user.id}`);
      if (suspensionFlag) {
        logout();
      }
    };

    const interval = setInterval(checkSuspension, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [state.user?.id]);

  // Login function
  const login = async (credentials, role = 'owner') => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

    try {
      // Call API to verify credentials
      const response = await fetch('/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credentials, role })
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();

      // Store auth data in localStorage
      localStorage.setItem('owner_id', data.user.id.toString());
      localStorage.setItem('owner_name', data.user.name);
      localStorage.setItem('role', data.user.role);

      // Set selected shop if available
      if (data.selectedShop) {
        localStorage.setItem('selectedStoreId', data.selectedShop.id.toString());
        localStorage.setItem('store_name', data.selectedShop.name);
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN,
        payload: {
          user: data.user,
          selectedShop: data.selectedShop || null
        }
      });

      return data;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.clear();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Set selected shop
  const setSelectedShop = (shop) => {
    localStorage.setItem('selectedStoreId', shop.id.toString());
    localStorage.setItem('store_name', shop.name);
    dispatch({ type: AUTH_ACTIONS.SET_SELECTED_SHOP, payload: shop });
  };

  // Update shop data
  const updateShopData = (data) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_SHOP_DATA, payload: data });

    // Persist to localStorage with shop-specific keys
    if (state.selectedShop) {
      const shopKey = `${state.user.id}_${state.selectedShop.id}`;
      Object.entries(data).forEach(([key, value]) => {
        const storageKey = `${key}_${shopKey}`;
        localStorage.setItem(storageKey, JSON.stringify(value));
      });
    }
  };

  // Context value
  const value = {
    ...state,
    login,
    logout,
    setSelectedShop,
    updateShopData,
    dispatch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="auth-required">
          <i className="fas fa-lock"></i>
          <h2>Authentication Required</h2>
          <p>Please log in to access this page.</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Shop-specific data hook
export function useShopData() {
  const { selectedShop, user, shopData, updateShopData } = useAuth();

  // Load shop-specific data from localStorage
  useEffect(() => {
    if (!selectedShop || !user) return;

    const shopKey = `${user.id}_${selectedShop.id}`;

    const loadShopData = () => {
      try {
        const customers = JSON.parse(localStorage.getItem(`customers_${shopKey}`)) || [];
        const products = JSON.parse(localStorage.getItem(`products_${shopKey}`)) || [];
        const orders = JSON.parse(localStorage.getItem(`invoices_${shopKey}`)) || [];
        const offers = JSON.parse(localStorage.getItem(`offers_${shopKey}`)) || [];

        updateShopData({
          customers,
          products,
          orders,
          offers,
          inventory: [] // Would be loaded from API
        });
      } catch (error) {
        console.error('Error loading shop data:', error);
      }
    };

    loadShopData();
  }, [selectedShop, user, updateShopData]);

  return {
    shopData,
    updateShopData,
    selectedShop
  };
}

// Export actions for external use
export { AUTH_ACTIONS };
