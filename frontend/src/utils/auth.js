// Temporary auth service until backend is ready
const AUTH_KEYS = {
  SHOP_OWNER: 'loggedInOwner',
  COMPANY_ADMIN: 'isAdmin',
  CUSTOMER_DATA: 'customerData',
};

class AuthService {
  // Customer methods (keep using localStorage)
  static getCustomerData(key) {
    return JSON.parse(localStorage.getItem(key)) || null;
  }

  static setCustomerData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Shop Owner methods (to be replaced with API calls)
  static async loginShopOwner(credentials) {
    // TODO: Replace with actual API call
    console.log('TODO: Implement API login for shop owner', credentials);
    return null;
  }

  static async logoutShopOwner() {
    // TODO: Replace with actual API call
    console.log('TODO: Implement API logout for shop owner');
  }

  // Company Admin methods (to be replaced with API calls)
  static async loginCompanyAdmin(credentials) {
    // TODO: Replace with actual API call
    console.log('TODO: Implement API login for company admin', credentials);
    return null;
  }

  static async logoutCompanyAdmin() {
    // TODO: Replace with actual API call
    console.log('TODO: Implement API logout for company admin');
  }

  // Temporary methods that still use localStorage (to be removed later)
  static getTempAuthData(key) {
    return localStorage.getItem(key);
  }

  static setTempAuthData(key, value) {
    localStorage.setItem(key, value);
  }
}

export { AuthService, AUTH_KEYS };