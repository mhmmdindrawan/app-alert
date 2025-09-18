// app/auth/dashboard/page.tsx
'use client';

import React from 'react';
import { AlertDashboard } from "@/app/components/fraud/AlertDashboard";
import { useAuth } from '@/contexts/AuthContext';
import { 
  LogOut, 
  Settings, 
  Bell,
  BarChart3,
  Users,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FraudDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - User info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{user?.avatar}</div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">{user?.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 capitalize">{user?.role}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              {/* Permission indicators */}
              <div className="hidden md:flex items-center gap-2">
                {user?.permissions.includes('view_alerts') && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    <Bell size={12} />
                    <span>Alerts</span>
                  </div>
                )}
                {user?.permissions.includes('export_data') && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                    <BarChart3 size={12} />
                    <span>Export</span>
                  </div>
                )}
                {user?.permissions.includes('manage_users') && (
                  <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                    <Users size={12} />
                    <span>Admin</span>
                  </div>
                )}
                {user?.permissions.includes('system_config') && (
                  <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                    <Shield size={12} />
                    <span>System</span>
                  </div>
                )}
              </div>

              {/* Settings button */}
              <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <Settings size={20} />
              </button>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="p-0">
        <AlertDashboard />
      </div>

      {/* Optional Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div>
            <p>Fraud Alert System v1.0 - Real-time Monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <span>User: {user?.email}</span>
            <span>Role: {user?.role}</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}