export interface TelegramViewsData {
  messages: any[];
  channels: any[];
  keywords: string[];
  totalMessages: number;
  totalViews: number;
  activeChannels: number;
  timeRange: string;
  lastUpdated: string;
  type: string;
}

export interface TelegramViewsCallback {
  (data: TelegramViewsData): void;
}

class TelegramViewsService {
  private eventSource: EventSource | null = null;
  private callbacks: Set<TelegramViewsCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private isConnected = false;

  constructor() {
    this.setupReconnection();
  }

  private setupReconnection() {
    // Auto-reconnect on page visibility change
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !this.isConnected && !this.isConnecting) {
          this.connect();
        }
      });

      // Reconnect on window focus
      window.addEventListener('focus', () => {
        if (!this.isConnected && !this.isConnecting) {
          this.connect();
        }
      });
    }
  }

  connect(timeRange: string = '24h') {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;
    console.log('🔌 Connecting to Telegram views real-time stream...');

    try {
      // Close existing connection
      this.disconnect();

      // Create new EventSource connection
      const url = `/api/dashboard/telegram-recent?timeRange=${timeRange}&realtime=true`;
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('✅ Telegram views real-time stream connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data: TelegramViewsData = JSON.parse(event.data);

          // Ignore keepalive messages
          if (data.type === 'keepalive') {
            return;
          }

          console.log('🔄 Telegram views updated:', data);

          // Notify all callbacks
          this.callbacks.forEach(callback => {
            try {
              callback(data);
            } catch (error) {
              console.error('❌ Error in Telegram views callback:', error);
            }
          });
        } catch (error) {
          console.error('❌ Error parsing Telegram views data:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ Telegram views stream error:', error);
        this.isConnected = false;
        this.isConnecting = false;
        this.handleReconnection();
      };

      // Note: EventSource doesn't have an 'onclose' event
      // Connection closure is handled through 'onerror' and manual disconnection

    } catch (error) {
      console.error('❌ Error connecting to Telegram views stream:', error);
      this.isConnecting = false;
      this.handleReconnection();
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached for Telegram views stream');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🔄 Reconnecting to Telegram views stream in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (!this.isConnected && !this.isConnecting) {
        this.connect();
      }
    }, delay);
  }

  disconnect() {
    if (this.eventSource) {
      console.log('🔌 Disconnecting from Telegram views stream...');
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      this.isConnecting = false;
    }
  }

  subscribe(callback: TelegramViewsCallback): () => void {
    this.callbacks.add(callback);

    // If not connected, connect now
    if (!this.isConnected && !this.isConnecting) {
      this.connect();
    }

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);

      // If no more callbacks, disconnect
      if (this.callbacks.size === 0) {
        this.disconnect();
      }
    };
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }

  getConnectionStatus(): {
    isConnected: boolean;
    isConnecting: boolean;
    reconnectAttempts: number;
  } {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
export const telegramViewsService = new TelegramViewsService();

// Export for use in components
export default telegramViewsService;
