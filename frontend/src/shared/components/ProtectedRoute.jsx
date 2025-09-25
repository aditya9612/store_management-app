import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '@/utils/auth';

export const ProtectedRoute = ({ children, userType, redirectTo }) => {
  const isAuthenticated = () => {
    switch(userType) {
      case 'shop-owner':
        return localStorage.getItem('owner_id');
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