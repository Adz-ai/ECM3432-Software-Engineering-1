// src/components/common/ProtectedRoute.tsx

import React, { useContext, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  staffOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, staffOnly = false }) => {
  const { currentUser, isLoading, isStaff } = useContext(AuthContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (staffOnly && !isStaff()) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;

