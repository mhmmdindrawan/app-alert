// lib/echo.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Pastikan window tersedia (kode ini hanya berjalan di client-side)
if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

const getEchoOptions = (token: string) => ({
  broadcaster: 'pusher',
  key: process.env.NEXT_PUBLIC_SOKETI_APP_KEY || 'soketi-key',
  wsHost: process.env.NEXT_PUBLIC_SOKETI_HOST || '127.0.0.1',
  wsPort: parseInt(process.env.NEXT_PUBLIC_SOKETI_PORT || '6001'),
  wssPort: parseInt(process.env.NEXT_PUBLIC_SOKETI_PORT || '6001'),
  forceTLS: process.env.NODE_ENV === 'production',
  encrypted: true,
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
  authEndpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  },
});

export const createEchoInstance = (token: string): Echo<any> => {
  try {
    const options = getEchoOptions(token);
    console.log('Creating Echo instance with options:', {
      ...options,
      auth: { headers: { Authorization: 'Bearer [HIDDEN]' } }
    });

    // kalau pakai pusher-js bisa: return new Echo<typeof Pusher>(options);
    return new Echo<any>(options);
  } catch (error) {
    console.error('Failed to create Echo instance:', error);
    throw error;
  }
};

// Helper function untuk disconnect Echo instance dengan proper cleanup
export const disconnectEcho = (echo: Echo<any> | null) => {
  if (echo) {
    try {
      echo.disconnect();
      console.log('Echo disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting Echo:', error);
    }
  }
};
