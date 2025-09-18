// app/auth/layout.tsx
import React from "react";
import { AlertProvider } from "@/contexts/AlertProvider";
import { ProtectedRoute } from "@/app/auth/ProtectedRoute";
import { ReactNode } from "react";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <ProtectedRoute showHeader={true}>
      <AlertProvider>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </AlertProvider>
    </ProtectedRoute>
  );
}