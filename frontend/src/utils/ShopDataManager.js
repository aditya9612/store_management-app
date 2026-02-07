/**
 * Shop Data Management Utilities
 *
 * This module provides utilities for managing shop-specific data isolation,
 * ensuring that each shop's data (customers, products, orders, etc.) is properly
 * separated and secured.
 */

import { authService } from '@/utils/api';

// Shop data isolation utilities
export class ShopDataManager {
  constructor(ownerId, shopId) {
    this.ownerId = ownerId;
    this.shopId = shopId;
    this.shopKey = `${ownerId}_${shopId}`;
  }

  // Generate storage key for shop-specific data
  getStorageKey(dataType) {
    return `${dataType}_${this.shopKey}`;
  }

  // Save shop-specific data to localStorage
  saveData(dataType, data) {
    try {
      const key = this.getStorageKey(dataType);
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving ${dataType} data:`, error);
      return false;
    }
  }

  // Load shop-specific data from localStorage
  loadData(dataType) {
    try {
      const key = this.getStorageKey(dataType);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error loading ${dataType} data:`, error);
      return [];
    }
  }

  // Clear all shop-specific data
  clearShopData() {
    try {
      const keysToRemove = [
        this.getStorageKey('customers'),
        this.getStorageKey('products'),
        this.getStorageKey('invoices'),
        this.getStorageKey('offers'),
        this.getStorageKey('inventory'),
        this.getStorageKey('settings')
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      return true;
    } catch (error) {
      console.error('Error clearing shop data:', error);
      return false;
    }
  }

  // Validate shop access permissions
  validateAccess(userRole, userId) {
    if (userRole === 'admin') return true;
    if (userRole === 'owner' && userId === this.ownerId) return true;
    return false;
  }

  // Sync data with backend (for critical data)
  async syncWithBackend(dataType, data) {
    try {
      // Only sync critical data types
      if (!['customers', 'products', 'orders'].includes(dataType)) {
        return { success: true, synced: false };
      }

      // Call appropriate API endpoint based on data type
      let response;
      switch (dataType) {
        case 'customers':
          response = await authService.syncCustomers(this.shopId, data);
          break;
        case 'products':
          response = await authService.syncProducts(this.shopId, data);
          break;
        case 'orders':
          response = await authService.syncOrders(this.shopId, data);
          break;
        default:
          return { success: false, error: 'Unsupported data type' };
      }

      return { success: true, synced: true, response };
    } catch (error) {
      console.error(`Error syncing ${dataType} data:`, error);
      return { success: false, error: error.message };
    }
  }
}

// Shop-specific API wrapper
export class ShopAPI {
  constructor(ownerId, shopId) {
    this.ownerId = ownerId;
    this.shopId = shopId;
    this.dataManager = new ShopDataManager(ownerId, shopId);
  }

  // Get customers for this shop
  async getCustomers() {
    try {
      // Try to load from localStorage first (faster)
      let customers = this.dataManager.loadData('customers');

      // If no local data, fetch from API
      if (customers.length === 0) {
        const response = await authService.getCustomersByStore(this.shopId);
        customers = response.data || [];
        this.dataManager.saveData('customers', customers);
      }

      return customers;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Create customer for this shop
  async createCustomer(customerData) {
    try {
      const response = await authService.createCustomer({
        ...customerData,
        store_id: this.shopId
      });

      // Update local data
      const customers = this.dataManager.loadData('customers');
      customers.push(response.data);
      this.dataManager.saveData('customers', customers);

      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Get products for this shop
  async getProducts() {
    try {
      let products = this.dataManager.loadData('products');

      if (products.length === 0) {
        const response = await authService.products.list(this.shopId);
        products = response.data || [];
        this.dataManager.saveData('products', products);
      }

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Create product for this shop
  async createProduct(productData) {
    try {
      const response = await authService.products.create({
        ...productData,
        store_id: this.shopId
      });

      // Update local data
      const products = this.dataManager.loadData('products');
      products.push(response.data);
      this.dataManager.saveData('products', products);

      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Get orders for this shop
  async getOrders() {
    try {
      let orders = this.dataManager.loadData('invoices');

      if (orders.length === 0) {
        const response = await authService.orders.listByStore(this.shopId);
        orders = response.data || [];
        this.dataManager.saveData('invoices', orders);
      }

      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Create order for this shop
  async createOrder(orderData) {
    try {
      const response = await authService.orders.create({
        ...orderData,
        store_id: this.shopId
      });

      // Update local data
      const orders = this.dataManager.loadData('invoices');
      orders.push(response.data);
      this.dataManager.saveData('invoices', orders);

      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Get offers for this shop
  async getOffers() {
    try {
      let offers = this.dataManager.loadData('offers');

      if (offers.length === 0) {
        const response = await authService.offers.listByStore(this.shopId);
        offers = response.data || [];
        this.dataManager.saveData('offers', offers);
      }

      return offers;
    } catch (error) {
      console.error('Error fetching offers:', error);
      throw error;
    }
  }

  // Create offer for this shop
  async createOffer(offerData) {
    try {
      const response = await authService.offers.create({
        ...offerData,
        store_id: this.shopId
      });

      // Update local data
      const offers = this.dataManager.loadData('offers');
      offers.push(response.data);
      this.dataManager.saveData('offers', offers);

      return response.data;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  // Get inventory for this shop
  async getInventory() {
    try {
      // Inventory typically comes from API
      const response = await authService.getInventory(this.shopId);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
  }

  // Update inventory for this shop
  async updateInventory(productId, inventoryData) {
    try {
      const response = await authService.updateInventory(productId, inventoryData);

      // Refresh inventory data
      await this.getInventory();

      return response.data;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }

  // Get shop dashboard data
  async getDashboardData() {
    try {
      const response = await authService.getShopDashboard(this.shopId);

      return {
        shop: response.data.shop,
        stats: response.data.stats,
        recentOrders: response.data.recent_orders || [],
        lowStockProducts: response.data.low_stock_products || [],
        topProducts: response.data.top_products || []
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Get shop settings
  getSettings() {
    return this.dataManager.loadData('settings');
  }

  // Save shop settings
  saveSettings(settings) {
    return this.dataManager.saveData('settings', settings);
  }

  // Clear all shop data (useful for shop switching or logout)
  clearAllData() {
    return this.dataManager.clearShopData();
  }

  // Export shop data (for backup/transfer)
  exportData() {
    const data = {
      customers: this.dataManager.loadData('customers'),
      products: this.dataManager.loadData('products'),
      orders: this.dataManager.loadData('invoices'),
      offers: this.dataManager.loadData('offers'),
      settings: this.dataManager.loadData('settings'),
      exported_at: new Date().toISOString(),
      shop_id: this.shopId,
      owner_id: this.ownerId
    };

    return JSON.stringify(data, null, 2);
  }

  // Import shop data (for restore)
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);

      if (data.shop_id !== this.shopId || data.owner_id !== this.ownerId) {
        throw new Error('Data does not match current shop/owner');
      }

      // Import each data type
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'exported_at' && key !== 'shop_id' && key !== 'owner_id') {
          this.dataManager.saveData(key, value);
        }
      });

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

// Factory function to create shop API instance
export function createShopAPI(ownerId, shopId) {
  return new ShopAPI(ownerId, shopId);
}

// Hook for using shop data in React components
export function useShopAPI(ownerId, shopId) {
  const shopAPI = React.useMemo(() => {
    return createShopAPI(ownerId, shopId);
  }, [ownerId, shopId]);

  return shopAPI;
}
