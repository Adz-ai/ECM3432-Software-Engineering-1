// src/hooks/useAuth.js

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access auth context
 * @returns {Object} Auth context values and methods
 */
const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;
