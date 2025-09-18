// hooks/useFraudAlerts.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createEchoInstance, disconnectEcho } from '@/lib/echo';
import { FraudAlert } from '@/app/types/fraud';
import Echo from 'laravel-echo';

interface UseFraudAlertsReturn {
  alerts: FraudAlert[];
  isConnected: boolean;
  connectionError: string | null;
  setAlerts: React.Dispatch<React.SetStateAction<FraudAlert[]>>;
  reconnect: () => void;
}

export const useFraudAlerts = (authToken: string | null): UseFraudAlertsReturn => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const echoRef = useRef<InstanceType<typeof Echo> | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function untuk play sound notification
  const playNotificationSound = useCallback(() => {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }, []);

  // Function untuk show browser notification
  const showBrowserNotification = useCallback((alert: FraudAlert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('🚨 Fraud Alert Detected!', {
        body: `${alert.description}\nKasir: ${alert.cashierName}\nLokasi: ${alert.location}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: alert.id, // Prevent duplicate notifications
        requireInteraction: alert.severity === 'high', // Keep high severity notifications until user interacts
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 10 seconds for low/medium severity
      if (alert.severity !== 'high') {
        setTimeout(() => notification.close(), 10000);
      }
    }
  }, []);

  // Function to connect to Echo
  const connectToEcho = useCallback(() => {
    if (!authToken) {
      setConnectionError('No authentication token provided');
      return;
    }

    try {
      console.log('Attempting to connect to Echo...');
      const echo = createEchoInstance(authToken);
      echoRef.current = echo;
      setConnectionError(null);

      // Connection event handlers
      echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ Soketi connected successfully!');
        setIsConnected(true);
        setConnectionError(null);
      });

      echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('❌ Soketi disconnected');
        setIsConnected(false);
      });

      echo.connector.pusher.connection.bind('error', (error: any) => {
        console.error('❌ Soketi connection error:', error);
        setConnectionError(`Connection error: ${error.message || 'Unknown error'}`);
        setIsConnected(false);
      });

      echo.connector.pusher.connection.bind('unavailable', () => {
        console.error('❌ Soketi connection unavailable');
        setConnectionError('Connection unavailable');
        setIsConnected(false);
      });

      // Listen to fraud alerts channel
      echo.private('fraud-alerts')
        .listen('.FraudDetected', (data: FraudAlert) => {
          console.log('🚨 New fraud alert received:', data);

          // Add alert to the list
          const alertWithDefaults: FraudAlert = {
            ...data,
            id: data.id || `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            isRead: false,
            timestamp: data.timestamp || new Date().toISOString(),
          };

          setAlerts(prevAlerts => [alertWithDefaults, ...prevAlerts]);

          // Show notifications
          showBrowserNotification(alertWithDefaults);
          playNotificationSound();
        })
        .error((error: any) => {
          console.error('❌ Error listening to fraud-alerts channel:', error);
          setConnectionError(`Channel error: ${error.message || 'Unknown error'}`);
        });

    } catch (error) {
      console.error('❌ Failed to create Echo connection:', error);
      setConnectionError(`Failed to connect: ${error}`);
      setIsConnected(false);
    }
  }, [authToken, showBrowserNotification, playNotificationSound]);

  // Reconnect function
  const reconnect = useCallback(() => {
    console.log('🔄 Attempting to reconnect...');
    if (echoRef.current) {
      disconnectEcho(echoRef.current);
      echoRef.current = null;
    }

    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Attempt reconnection after a short delay
    reconnectTimeoutRef.current = setTimeout(connectToEcho, 1000);
  }, [connectToEcho]);

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (!isConnected && authToken && !connectionError?.includes('No authentication')) {
      console.log('🔄 Connection lost, attempting to reconnect...');
      reconnectTimeoutRef.current = setTimeout(reconnect, 5000);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isConnected, authToken, connectionError, reconnect]);

  // Main connection effect
  useEffect(() => {
    if (!authToken) {
      setConnectionError('No authentication token provided');
      return;
    }

    connectToEcho();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up Echo connection...');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (echoRef.current) {
        disconnectEcho(echoRef.current);
        echoRef.current = null;
      }
      setIsConnected(false);
    };
  }, [authToken, connectToEcho]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  return {
    alerts,
    isConnected,
    connectionError,
    setAlerts,
    reconnect,
  };
};