/* eslint-disable react/prop-types */
// src/contexts/NotificationContext.tsx

import React, { createContext, useState, useCallback, ReactNode } from 'react';

// Type definitions
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  duration: number;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string, duration?: number) => number;
  removeNotification: (id: number) => void;
  success: (message: string, duration?: number) => number;
  error: (message: string, duration?: number) => number;
  info: (message: string, duration?: number) => number;
  warning: (message: string, duration?: number) => number;
  clearAll: () => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

// Create the notification context
export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => 0,
  removeNotification: () => {},
  success: () => 0,
  error: () => 0,
  info: () => 0,
  warning: () => 0,
  clearAll: () => {},
});

/**
 * Types of notifications:
 * - success: Operation completed successfully
 * - error: Error occurred
 * - info: Informational message
 * - warning: Warning message
 */

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Remove a notification by its ID
  const removeNotification = useCallback((id: number): void => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Add a new notification
  const addNotification = useCallback((type: NotificationType, message: string, duration: number = 5000): number => {
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
  const success = useCallback((message: string, duration?: number): number => {
    return addNotification('success', message, duration);
  }, [addNotification]);

  const error = useCallback((message: string, duration?: number): number => {
    return addNotification('error', message, duration);
  }, [addNotification]);

  const info = useCallback((message: string, duration?: number): number => {
    return addNotification('info', message, duration);
  }, [addNotification]);

  const warning = useCallback((message: string, duration?: number): number => {
    return addNotification('warning', message, duration);
  }, [addNotification]);

  // Clear all notifications
  const clearAll = useCallback((): void => {
    setNotifications([]);
  }, []);

  // Context value
  const value: NotificationContextType = {
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
          {notifications.map((notification: Notification) => (
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
