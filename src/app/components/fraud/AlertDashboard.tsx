// components/fraud/AlertDashboard.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { AlertCard } from './AlertCard';
import { Eye, EyeOff } from "lucide-react";
import { useAlerts, useFilteredAlerts, useAlertStats } from '@/contexts/AlertProvider';
import { 
  Wifi, 
  WifiOff, 
  Bell, 
  BellOff,
  Filter, 
  Download, 
  RefreshCw,
  Search,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Users,
  MapPin,
  Calendar
} from 'lucide-react';

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'gray',
  trend,
  onClick 
}: {
  title: string;
  value: number;
  icon: any;
  color?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'blue';
  trend?: { value: number; isUp: boolean };
  onClick?: () => void;
}) => {
  const colorClasses = {
    gray: 'text-gray-600 bg-gray-100',
    red: 'text-red-600 bg-red-100',
    orange: 'text-orange-600 bg-orange-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-blue-300' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon size={16} className={colorClasses[color]} />
            <p className="text-sm text-gray-600 font-medium">{title}</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend.isUp ? 'text-red-500' : 'text-green-500'}`}>
              <TrendingUp size={12} className={trend.isUp ? '' : 'rotate-180'} />
              <span>{trend.value}% dari kemarin</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Search and Filter Component
const SearchAndFilters = ({
  searchTerm,
  setSearchTerm,
  filterBySeverity,
  setFilterBySeverity,
  filterByType,
  setFilterByType,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterBySeverity: string;
  setFilterBySeverity: (severity: string) => void;
  filterByType: string;
  setFilterByType: (type: string) => void;
}) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan deskripsi, kasir, atau lokasi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Severity Filter */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-gray-600" />
        <select
          value={filterBySeverity}
          onChange={(e) => setFilterBySeverity(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <select
          value={filterByType}
          onChange={(e) => setFilterByType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="CASH">Cash</option>
          <option value="CASHLESS">Cashless</option>
        </select>
      </div>
    </div>
  </div>
);

export const AlertDashboard = () => {
  const { 
    alerts, 
    isConnected, 
    unreadCount, 
    clearAll, 
    markAllAsRead,
    soundEnabled, 
    setSoundEnabled 
  } = useAlerts();
  
  const stats = useAlertStats();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBySeverity, setFilterBySeverity] = useState('all');
  const [filterByType, setFilterByType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Advanced filtering and sorting
  const filteredAndSortedAlerts = useMemo(() => {
    let filtered = alerts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alert => 
        alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Severity filter
    if (filterBySeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filterBySeverity);
    }

    // Type filter
    if (filterByType !== 'all') {
      filtered = filtered.filter(alert => alert.type === filterByType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'severity':
          const severityOrder = { high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        case 'amount':
          return (b.amount || 0) - (a.amount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [alerts, searchTerm, filterBySeverity, filterByType, sortBy]);

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Severity', 'Description', 'Cashier', 'Location', 'Transaction ID', 'Amount', 'Status'].join(','),
      ...filteredAndSortedAlerts.map(alert => [
        alert.timestamp,
        alert.type,
        alert.severity,
        `"${alert.description}"`,
        `"${alert.cashierName}"`,
        `"${alert.location}"`,
        alert.transactionId || '',
        alert.amount || '',
        alert.isRead ? 'Read' : 'Unread'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraud-alerts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={32} className="text-red-600" />
            <h1 className="text-3xl font-bold text-gray-800">Fraud Alert Dashboard</h1>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-sm font-medium animate-pulse">
              <Bell size={14} />
              <span>{unreadCount} unread</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
            title={soundEnabled ? 'Sound enabled' : 'Sound disabled'}
          >
            {soundEnabled ? <Bell size={16} /> : <BellOff size={16} />}
          </button>

          {/* Stats Toggle */}
          <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <BarChart3 size={16} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatsCard
          title="Total Alerts"
          value={stats.total}
          icon={AlertTriangle}
          color="gray"
          onClick={() => {
            setFilterBySeverity('all');
            setFilterByType('all');
          }}
        />
        <StatsCard
          title="High Priority"
          value={stats.high}
          icon={AlertTriangle}
          color="red"
          trend={{ value: 12, isUp: true }}
          onClick={() => setFilterBySeverity('high')}
        />
        <StatsCard
          title="Medium Priority"
          value={stats.medium}
          icon={AlertTriangle}
          color="orange"
          onClick={() => setFilterBySeverity('medium')}
        />
        <StatsCard
          title="Low Priority"
          value={stats.low}
          icon={AlertTriangle}
          color="yellow"
          onClick={() => setFilterBySeverity('low')}
        />
        <StatsCard
          title="Unread"
          value={stats.unread}
          icon={Bell}
          color="blue"
          onClick={() => {
            // Show only unread alerts
            console.log('Show unread alerts');
          }}
        />
      </div>

      {/* Search and Filters */}
      <SearchAndFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterBySeverity={filterBySeverity}
        setFilterBySeverity={setFilterBySeverity}
        filterByType={filterByType}
        setFilterByType={setFilterByType}
      />

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            Showing {filteredAndSortedAlerts.length} of {alerts.length} alerts
          </span>
          
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="severity">Severity</option>
              <option value="amount">Amount</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Eye size={14} />
              Mark All Read
            </button>
          )}
          
          <button
            onClick={handleExport}
            disabled={filteredAndSortedAlerts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Download size={14} />
            Export CSV
          </button>
          
          <button
            onClick={clearAll}
            disabled={alerts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <RefreshCw size={14} />
            Clear All
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAndSortedAlerts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm || filterBySeverity !== 'all' || filterByType !== 'all' 
                ? 'No alerts match your filters.' 
                : 'No fraud alerts detected.'
              }
            </p>
            <p className="text-gray-400 text-sm">
              {isConnected 
                ? 'System is connected and monitoring for suspicious activities...' 
                : 'System is disconnected. Please check your connection.'
              }
            </p>
            {(searchTerm || filterBySeverity !== 'all' || filterByType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterBySeverity('all');
                  setFilterByType('all');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))
        )}
      </div>
    </div>
  );
};