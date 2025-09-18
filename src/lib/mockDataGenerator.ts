// lib/mockDataGenerator.ts
// This file is for development/demo purposes only
import { FraudAlert } from '@/app/types/fraud';

const mockCashiers = [
  'Ahmad Rizki', 'Siti Nurhaliza', 'Budi Santoso', 'Maya Sari',
  'Dedi Kurniawan', 'Rina Wulandari', 'Agus Prasetyo', 'Lina Marlina'
];

const mockLocations = [
  'Gate A - Lantai 1', 'Gate B - Lantai 2', 'Gate C - Basement',
  'Gate D - Lantai 3', 'Gate E - Rooftop', 'VIP Section - Lantai 2',
  'Mall Entrance', 'Food Court Area'
];

const mockDescriptions: Record<'high' | 'medium' | 'low', string[]> = {
  high: [
    'Selisih kas sangat besar terdeteksi',
    'Pola transaksi mencurigakan berulang',
    'Manipulasi data sistem terdeteksi',
    'Akses tidak sah ke sistem kasir',
    'Transaksi di luar jam operasional'
  ],
  medium: [
    'Pola pembayaran tidak wajar',
    'Frekuensi void transaksi tinggi',
    'Selisih kas di atas batas normal',
    'Waktu transaksi tidak konsisten',
    'Aktivitas mencurigakan terdeteksi'
  ],
  low: [
    'Transaksi tunai mencurigakan terdeteksi',
    'Pola pembayaran sedikit anomali',
    'Durasi transaksi lebih lama dari biasanya',
    'Selisih kas dalam batas toleransi',
    'Aktivitas monitoring rutin'
  ]
};

export const generateMockAlert = (): FraudAlert => {
  const types: Array<'CASH' | 'CASHLESS'> = ['CASH', 'CASHLESS'];
  
  // Function to generate weighted random severity
  const getRandomSeverity = (): 'low' | 'medium' | 'high' => {
    const random = Math.random();
    // 50% low, 30% medium, 20% high
    if (random < 0.5) return 'low';
    if (random < 0.8) return 'medium';
    return 'high';
  };

  const severity = getRandomSeverity();
  const type = types[Math.floor(Math.random() * types.length)];
  const cashier = mockCashiers[Math.floor(Math.random() * mockCashiers.length)];
  const location = mockLocations[Math.floor(Math.random() * mockLocations.length)];
  
  // Generate realistic amounts based on type and severity
  const getAmount = (type: 'CASH' | 'CASHLESS', severity: 'low' | 'medium' | 'high'): number => {
    const baseAmounts = {
      CASH: { 
        low: [10000, 50000], 
        medium: [50000, 150000], 
        high: [150000, 500000] 
      },
      CASHLESS: { 
        low: [25000, 75000], 
        medium: [75000, 200000], 
        high: [200000, 1000000] 
      }
    };
    
    const range = baseAmounts[type][severity];
    return Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
  };

  // Get random description based on severity
  const getRandomDescription = (severity: 'low' | 'medium' | 'high'): string => {
    const descriptions = mockDescriptions[severity];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type,
    description: getRandomDescription(severity),
    cashierName: cashier,
    location,
    timestamp: new Date().toISOString(),
    severity,
    transactionId: `TRX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    amount: getAmount(type, severity),
    isRead: false
  };
};

// Mock Echo class untuk development/testing
export class MockEcho {
  private callbacks: { [key: string]: ((alert: FraudAlert) => void)[] } = {};
  private intervalId: NodeJS.Timeout | null = null;
  private alertCallback?: (alert: FraudAlert) => void;
  
  constructor() {
    // Connection simulation will be handled by startMockAlerts
  }

  private(channel: string) {
    return {
      listen: (event: string, callback: (alert: FraudAlert) => void) => {
        if (!this.callbacks[event]) {
          this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
        
        // Store callback for mock alerts
        if (event === '.FraudDetected') {
          this.alertCallback = callback;
          this.startMockAlerts();
        }
        
        return this;
      },
      error: (callback: (error: any) => void) => {
        // Simulate no errors in mock mode
        return this;
      }
    };
  }

  private startMockAlerts() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Send first alert after 3 seconds
    setTimeout(() => {
      if (this.alertCallback) {
        try {
          this.alertCallback(generateMockAlert());
        } catch (error) {
          console.error('Error sending mock alert:', error);
        }
      }
    }, 3000);

    // Then send alerts every 15-30 seconds
    this.intervalId = setInterval(() => {
      if (this.alertCallback && Math.random() > 0.3) { // 70% chance to send alert
        try {
          this.alertCallback(generateMockAlert());
        } catch (error) {
          console.error('Error sending mock alert:', error);
        }
      }
    }, Math.random() * 15000 + 15000); // Random interval between 15-30 seconds
  }

  disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.callbacks = {};
    this.alertCallback = undefined;
    console.log('Mock Echo disconnected');
  }

  // Simulate connection events
  get connector() {
    return {
      pusher: {
        connection: {
          bind: (event: string, callback: () => void) => {
            if (event === 'connected') {
              setTimeout(() => {
                try {
                  callback();
                } catch (error) {
                  console.error('Error in connection callback:', error);
                }
              }, 1000);
            } else if (event === 'disconnected') {
              // Handle disconnection if needed
            } else if (event === 'error' || event === 'unavailable') {
              // Handle errors if needed
            }
          }
        }
      }
    };
  }
}

// Utility functions for testing
export const generateMultipleMockAlerts = (count: number): FraudAlert[] => {
  return Array.from({ length: count }, () => generateMockAlert());
};

export const generateMockAlertWithSeverity = (severity: 'low' | 'medium' | 'high'): FraudAlert => {
  const types: Array<'CASH' | 'CASHLESS'> = ['CASH', 'CASHLESS'];
  const type = types[Math.floor(Math.random() * types.length)];
  const cashier = mockCashiers[Math.floor(Math.random() * mockCashiers.length)];
  const location = mockLocations[Math.floor(Math.random() * mockLocations.length)];
  
  const getAmount = (type: 'CASH' | 'CASHLESS', severity: 'low' | 'medium' | 'high'): number => {
    const baseAmounts = {
      CASH: { 
        low: [10000, 50000], 
        medium: [50000, 150000], 
        high: [150000, 500000] 
      },
      CASHLESS: { 
        low: [25000, 75000], 
        medium: [75000, 200000], 
        high: [200000, 1000000] 
      }
    };
    
    const range = baseAmounts[type][severity];
    return Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
  };

  const descriptions = mockDescriptions[severity];
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];

  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type,
    description,
    cashierName: cashier,
    location,
    timestamp: new Date().toISOString(),
    severity,
    transactionId: `TRX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    amount: getAmount(type, severity),
    isRead: false
  };
};