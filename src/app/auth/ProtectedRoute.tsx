// components/auth/ProtectedRoute.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle, Shield, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallbackPath?: string;
  showHeader?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  fallbackPath = '/login',
  showHeader = false
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackPath);
    }
  }, [isAuthenticated, isLoading, router, fallbackPath]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-blue-100 p-6 rounded-full mb-6 mx-auto w-fit">
            <Shield className="text-blue-600" size={48} />
          </div>
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Checking Authentication
          </h2>
          <p className="text-gray-600">Please wait while we verify your access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show nothing (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0 && user) {
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      user.permissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="bg-red-100 p-6 rounded-full mb-6 mx-auto w-fit">
              <AlertTriangle className="text-red-600" size={64} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Access Denied
            </h1>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
              <p className="text-gray-600 mb-4">
                You don't have the required permissions to access this page.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Required Permissions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {requiredPermissions.map(permission => (
                    <span
                      key={permission}
                      className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-700 mb-2">
                  Your Permissions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.permissions.map(permission => (
                    <span
                      key={permission}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors mx-auto"
              >
                <ArrowLeft size={16} />
                Go Back
              </button>
              
              <button
                onClick={() => router.push('/auth/dashboard')}
                className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Optional header for protected pages
  const HeaderComponent = showHeader && user ? (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{user.avatar}</div>
          <div>
            <h2 className="font-semibold text-gray-800">{user.name}</h2>
            <p className="text-sm text-gray-600 capitalize">{user.role}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Logged in as {user.role}
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  ) : null;

  // If authenticated and authorized, render children
  return (
    <div className="min-h-screen bg-gray-50">
      {HeaderComponent}
      <div className={showHeader ? '' : ''}>
        {children}
      </div>
    </div>
  );
};

// Higher-order component for easy wrapping
export const withProtection = (
  Component: React.ComponentType<any>,
  requiredPermissions?: string[]
) => {
  const ProtectedComponent = (props: any) => (
    <ProtectedRoute requiredPermissions={requiredPermissions}>
      <Component {...props} />
    </ProtectedRoute>
  );
  
  ProtectedComponent.displayName = `withProtection(${Component.displayName || Component.name})`;
  return ProtectedComponent;
};