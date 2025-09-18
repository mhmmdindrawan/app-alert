// components/fraud/AlertCard.tsx
'use client';

import React, { useState } from 'react';
import { FraudAlert } from '@/app/types/fraud';
import { useAlerts } from '@/contexts/AlertProvider';
import { 
  Clock, 
  User, 
  MapPin, 
  AlertTriangle, 
  Eye,
  EyeOff,
  Trash2,
  DollarSign,
  Hash
} from 'lucide-react';

interface AlertCardProps {
  alert: FraudAlert;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const { markAsRead } = useAlerts();
  const [isExpanded, setIsExpanded] = useState(false);

  // Styling berdasarkan severity
  const severityStyles = {
    low: {
      border: 'border-l-yellow-400',
      bg: 'bg-yellow-50 hover:bg-yellow-100',
      icon: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-800',
    },
    medium: {
      border: 'border-l-orange-500',
      bg: 'bg-orange-50 hover:bg-orange-100', 
      icon: 'text-orange-600',
      badge: 'bg-orange-100 text-orange-800',
    },
    high: {
      border: 'border-l-red-600',
      bg: 'bg-red-50 hover:bg-red-100',
      icon: 'text-red-600',
      badge: 'bg-red-100 text-red-800',
    },
  };

  const style = severityStyles[alert.severity];

  const handleCardClick = () => {
    if (!alert.isRead) {
      markAsRead(alert.id);
    }
    setIsExpanded(!isExpanded);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(alert.id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`
        relative p-4 border rounded-lg shadow-sm cursor-pointer 
        transition-all duration-300 border-l-4 group
        ${style.border} ${style.bg}
        ${!alert.isRead ? 'ring-2 ring-blue-200 shadow-md' : ''}
        hover:shadow-lg transform hover:-translate-y-1
      `}
    >
      {/* Unread indicator */}
      {!alert.isRead && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse">
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 flex-1">
          <AlertTriangle size={20} className={style.icon} />
          <h3 className={`font-bold text-lg ${!alert.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
            {alert.description}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {/* Type Badge */}
          <span className={`
            px-2 py-1 text-xs font-semibold rounded-full capitalize
            ${alert.type === 'CASH' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
          `}>
            {alert.type}
          </span>
          
          {/* Severity Badge */}
          <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${style.badge}`}>
            {alert.severity}
          </span>
          
          {/* Read/Unread Toggle */}
          <button
            onClick={handleMarkAsRead}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            title={alert.isRead ? 'Mark as unread' : 'Mark as read'}
          >
            {alert.isRead ? (
              <EyeOff size={14} className="text-gray-500" />
            ) : (
              <Eye size={14} className="text-blue-500" />
            )}
          </button>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-500" />
          <span>Kasir: <strong className="text-gray-800">{alert.cashierName}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-gray-500" />
          <span>Lokasi: <strong className="text-gray-800">{alert.location}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-500" />
          <span className="text-gray-700">
            {getRelativeTime(alert.timestamp)}
          </span>
        </div>
      </div>

      {/* Bottom Row - Transaction Info */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-4">
          {alert.transactionId && (
            <div className="flex items-center gap-1 text-gray-500">
              <Hash size={12} />
              <span className="font-mono text-xs">{alert.transactionId}</span>
            </div>
          )}
        </div>
        
        {alert.amount && (
          <div className="flex items-center gap-1 font-semibold text-gray-800">
            <DollarSign size={14} className="text-green-600" />
            <span>{formatCurrency(alert.amount)}</span>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 animate-in slide-in-from-top duration-300">
          <div className="text-sm text-gray-600">
            <strong>Timestamp:</strong> {new Date(alert.timestamp).toLocaleString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          
          {/* Additional actions */}
          <div className="flex justify-end pt-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // Handle detailed view or action
                console.log('View details for alert:', alert.id);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              Lihat Detail →
            </button>
          </div>
        </div>
      )}

      {/* Hover indicator */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-gray-400">
          {isExpanded ? 'Click to collapse' : 'Click to expand'}
        </span>
      </div>
    </div>
  );
};