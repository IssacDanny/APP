import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApiService } from '../context/ApiServiceContext';

export function ProtectedRoute({ children }) {
  const api = useApiService();
  const location = useLocation();

  if (!api.token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}