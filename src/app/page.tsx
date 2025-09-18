// app/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated, redirect to dashboard
        router.push('/auth/dashboard');
      } else {
        // User is not authenticated, redirect to login
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading screen while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-6 rounded-full">
            <AlertTriangle className="text-red-600" size={64} />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Fraud Alert System
        </h1>
        
        <div className="flex items-center justify-center gap-3 text-gray-600">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-lg">Loading...</span>
        </div>
        
        <p className="text-gray-500 mt-4 max-w-md">
          Sistem monitoring real-time untuk keamanan parkir
        </p>
      </div>
    </div>
  );
}