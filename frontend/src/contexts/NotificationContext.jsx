// src/contexts/NotificationContext.jsx

import React, { createContext, useState, useCallback } from 'react';

// Create the notification context
export const NotificationContext = createContext();

/**
 * Types of notifications:
 * - success: Operation completed successfully
 * - error: Error occurred
 * - info: Informational message
 * - warning: Warning message
 */

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Remove a notification by its ID
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Add a new notification
  const addNotification = useCallback((type, message, duration = 5000) => {
    const id = Date.now(); // Use timestamp as unique ID

    // Add the new notification to the array
    setNotifications(prev => [
      ...prev,
      {
        id,
        type,
        message,
        duration,
      },
    ]);

    // Automatically remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, [removeNotification]); // Fixed: Added removeNotification to dependency array

  // Helper methods for different notification types
  const success = useCallback((message, duration) => {
    return addNotification('success', message, duration);
  }, [addNotification]);

  const error = useCallback((message, duration) => {
    return addNotification('error', message, duration);
  }, [addNotification]);

  const info = useCallback((message, duration) => {
    return addNotification('info', message, duration);
  }, [addNotification]);

  const warning = useCallback((message, duration) => {
    return addNotification('warning', message, duration);
  }, [addNotification]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Context value
  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Notification display component */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map(notification => (
            <div key={notification.id} className={`notification notification-${notification.type}`}>
              <div className="notification-content">{notification.message}</div>
              <button
                className="notification-close"
                onClick={() => removeNotification(notification.id)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
