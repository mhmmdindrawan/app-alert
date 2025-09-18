// types/fraud.ts
export interface FraudAlert {
  id: string;
  type: 'CASH' | 'CASHLESS';
  description: string;
  cashierName: string;
  location: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  transactionId?: string;
  amount?: number;
  isRead?: boolean;
}

export interface AlertContextType {
  alerts: FraudAlert[];
  isConnected: boolean;
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  filterBySeverity: string;
  setFilterBySeverity: (severity: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export interface AlertStats {
  total: number;
  high: number;
  medium: number;
  low: number;
  unread: number;
}