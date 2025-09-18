// app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Loader2, 
  Shield,
  Users,
  Activity
} from 'lucide-react';

// Demo accounts info component
const DemoAccountsInfo = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <div className="flex items-start gap-3">
      <Shield className="text-blue-600 mt-0.5" size={20} />
      <div>
        <h3 className="font-semibold text-blue-900 mb-2">Demo Accounts</h3>
        <div className="space-y-2 text-sm">
          <div className="bg-white rounded p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">👨‍💼</span>
              <strong className="text-blue-800">Admin System</strong>
            </div>
            <p className="text-gray-600 text-xs mb-1">Full access to all features</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              admin@parking.com / admin123
            </code>
          </div>
          
          <div className="bg-white rounded p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">👨‍💻</span>
              <strong className="text-blue-800">Supervisor Parkir</strong>
            </div>
            <p className="text-gray-600 text-xs mb-1">Alert management & export</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              supervisor@parking.com / supervisor123
            </code>
          </div>
          
          <div className="bg-white rounded p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">👨‍🔒</span>
              <strong className="text-blue-800">Monitor Keamanan</strong>
            </div>
            <p className="text-gray-600 text-xs mb-1">View alerts only</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              monitor@parking.com / monitor123
            </code>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        router.push('/auth/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const quickLogin = (email: string, password: string) => {
    setFormData({ email, password });
    setError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertTriangle className="text-red-600" size={48} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Fraud Alert System
          </h1>
          <p className="text-gray-600">
            Monitoring sistem parkir real-time
          </p>
        </div>

        {/* Demo Accounts Info */}
        <DemoAccountsInfo />

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Sign In
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={16} />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Login Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3 text-center">Quick Login (Demo)</p>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin('admin@parking.com', 'admin123')}
                className="w-full text-left p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <span className="text-xl">👨‍💼</span>
                <div>
                  <div className="font-medium text-sm">Admin System</div>
                  <div className="text-xs text-gray-500">Full access</div>
                </div>
              </button>
              
              <button
                onClick={() => quickLogin('supervisor@parking.com', 'supervisor123')}
                className="w-full text-left p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <span className="text-xl">👨‍💻</span>
                <div>
                  <div className="font-medium text-sm">Supervisor</div>
                  <div className="text-xs text-gray-500">Alert management</div>
                </div>
              </button>
              
              <button
                onClick={() => quickLogin('monitor@parking.com', 'monitor123')}
                className="w-full text-left p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <span className="text-xl">👨‍🔒</span>
                <div>
                  <div className="font-medium text-sm">Monitor</div>
                  <div className="text-xs text-gray-500">View only</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Fraud Alert System v1.0</p>
          <p>Real-time monitoring untuk keamanan parkir</p>
        </div>
      </div>
    </div>
  );
}