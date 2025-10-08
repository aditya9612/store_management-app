import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '@/utils/auth';

export const ProtectedRoute = ({ children, userType, redirectTo }) => {
  const isAuthenticated = () => {
    switch(userType) {
      case 'shop-owner':
        // Check for either owner_id or storeman_id in localStorage
        return localStorage.getItem('owner_id') || (localStorage.getItem('storeman_id') && localStorage.getItem('auth_type') === 'storeman');
      case 'company-admin':
        return AuthService.getTempAuthData('isAdmin');
      default:
        return false;
    }
  };

  const getRedirectPath = () => {
    switch(userType) {
      case 'shop-owner':
        return '/owner-login';
      case 'company-admin':
        return '/admin-login';
      default:
        return '/';
    }
  };

  return isAuthenticated() ? children : <Navigate to={redirectTo || getRedirectPath()} replace />;
};