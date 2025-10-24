// src/components/common/ProtectedRoute.jsx

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, staffOnly = false }) => {
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

