// app/auth/layout.tsx
import { AlertProvider } from "@/contexts/AlertProvider";
import { ReactNode } from "react";

interface ProtectedLayoutProps {
  children: ReactNode;
}

// Di sini Anda bisa tambahkan Sidebar, Header, dll.
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  // TODO: Get actual auth token from your auth system
  // const { token } = useAuth(); // Uncomment when you have auth system
  const authToken = process.env.NODE_ENV === 'development' ? "demo-token-12345" : null;

  return (
    <AlertProvider authToken={authToken}>
      <div className="min-h-screen bg-gray-50">
        {/* Optional: Add Header */}
        {/* <Header /> */}
        
        <div className="flex">
          {/* Optional: Add Sidebar */}
          {/* <Sidebar /> */}
          
          <main className="flex-1">
            {children}
          </main>
        </div>
        
        {/* Optional: Add Footer */}
        {/* <Footer /> */}
      </div>
    </AlertProvider>
  );
}