// contexts/AlertProvider.tsx
'use client';

import React, { createContext, useContext, ReactNode, useState, useMemo, useCallback } from 'react';
import { useFraudAlerts } from '@/app/hooks/useFraudAlerts';
import { FraudAlert, AlertContextType } from '@/app/types/fraud';

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
  authToken?: string | null;
}

export const AlertProvider = ({ children, authToken = null }: AlertProviderProps) => {
  // For demo purposes, use a static token. In real implementation, get from auth context
  const token = authToken || "demo-token-12345";
  
  const { alerts, isConnected, setAlerts, reconnect } = useFraudAlerts(token);
  const [filterBySeverity, setFilterBySeverity] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Computed values
  const unreadCount = useMemo(
    () => alerts.filter(alert => !alert.isRead).length,
    [alerts]
  );

  // Alert management functions
  const markAsRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  }, [setAlerts]);

  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
  }, [setAlerts]);

  const clearAll = useCallback(() => {
    setAlerts([]);
  }, [setAlerts]);

  const deleteAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, [setAlerts]);

  // Context value
  const contextValue: AlertContextType = useMemo(() => ({
    alerts,
    isConnected,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    filterBySeverity,
    setFilterBySeverity,
    soundEnabled,
    setSoundEnabled,
  }), [
    alerts,
    isConnected,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    filterBySeverity,
    setFilterBySeverity,
    soundEnabled,
    setSoundEnabled,
  ]);

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
    </AlertContext.Provider>
  );
};

// Custom hook untuk menggunakan context
export const useAlerts = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

// Hook untuk filtered alerts
export const useFilteredAlerts = () => {
  const { alerts, filterBySeverity } = useAlerts();
  
  return useMemo(() => {
    if (filterBySeverity === 'all') {
      return alerts;
    }
    return alerts.filter(alert => alert.severity === filterBySeverity);
  }, [alerts, filterBySeverity]);
};

// Hook untuk alert statistics
export const useAlertStats = () => {
  const { alerts } = useAlerts();
  
  return useMemo(() => ({
    total: alerts.length,
    high: alerts.filter(alert => alert.severity === 'high').length,
    medium: alerts.filter(alert => alert.severity === 'medium').length,
    low: alerts.filter(alert => alert.severity === 'low').length,
    unread: alerts.filter(alert => !alert.isRead).length,
    cash: alerts.filter(alert => alert.type === 'CASH').length,
    cashless: alerts.filter(alert => alert.type === 'CASHLESS').length,
  }), [alerts]);
};