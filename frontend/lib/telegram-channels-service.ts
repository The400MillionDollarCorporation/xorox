export interface TelegramChannel {
  id: number;
  username: string;
  display_name: string | null;
  enabled: boolean;
  last_message_id: number;
  scrape_media: boolean;
  scrape_interval_minutes: number;
  created_at: string;
  updated_at: string;
  stats: {
    totalMessages: number;
    recentMessages: number;
    lastMessageAt: string | null;
    lastMessagePreview: string | null;
  };
}

export interface TelegramChannelsData {
  channels: TelegramChannel[];
  summary: {
    totalChannels: number;
    enabledChannels: number;
    disabledChannels: number;
    totalMessages: number;
    recentMessages: number;
  };
  lastUpdated: string;
  type: string;
}

export interface TelegramChannelsCallback {
  (data: TelegramChannelsData): void;
}

class TelegramChannelsService {
  private eventSource: EventSource | null = null;
  private callbacks: Set<TelegramChannelsCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private isConnected = false;
  private currentEnabledFilter: string | null = null;

  constructor() {
    this.setupReconnection();
  }

  private setupReconnection() {
    // Auto-reconnect on page visibility change
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !this.isConnected && !this.isConnecting) {
          this.connect(this.currentEnabledFilter);
        }
      });

      // Reconnect on window focus
      window.addEventListener('focus', () => {
        if (!this.isConnected && !this.isConnecting) {
          this.connect(this.currentEnabledFilter);
        }
      });
    }
  }

  connect(enabled?: string | null) {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;
    this.currentEnabledFilter = enabled ?? null;
    console.log('🔌 Connecting to Telegram channels real-time stream...');

    try {
      // Close existing connection
      this.disconnect();

      // Create new EventSource connection
      const params = new URLSearchParams();
      params.set('realtime', 'true');
      if (enabled !== null && enabled !== undefined) {
        params.set('enabled', enabled);
      }
      const url = `/api/dashboard/telegram-channels?${params.toString()}`;
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('✅ Telegram channels real-time stream connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data: TelegramChannelsData = JSON.parse(event.data);

          // Ignore keepalive messages
          if (data.type === 'keepalive') {
            return;
          }

          console.log('🔄 Telegram channels updated:', data);

          // Notify all callbacks
          this.callbacks.forEach(callback => {
            try {
              callback(data);
            } catch (error) {
              console.error('❌ Error in Telegram channels callback:', error);
            }
          });
        } catch (error) {
          console.error('❌ Error parsing Telegram channels data:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ Telegram channels stream error:', error);
        this.isConnected = false;
        this.isConnecting = false;
        this.handleReconnection();
      };

    } catch (error) {
      console.error('❌ Error connecting to Telegram channels stream:', error);
      this.isConnecting = false;
      this.handleReconnection();
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached for Telegram channels stream');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🔄 Reconnecting to Telegram channels stream in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (!this.isConnected && !this.isConnecting) {
        this.connect(this.currentEnabledFilter);
      }
    }, delay);
  }

  disconnect() {
    if (this.eventSource) {
      console.log('🔌 Disconnecting from Telegram channels stream...');
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      this.isConnecting = false;
    }
  }

  subscribe(callback: TelegramChannelsCallback): () => void {
    this.callbacks.add(callback);

    // If not connected, connect now
    if (!this.isConnected && !this.isConnecting) {
      this.connect(this.currentEnabledFilter);
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

  // Method to update channel settings
  async updateChannel(id: number, updates: Partial<Pick<TelegramChannel, 'enabled' | 'scrape_interval_minutes' | 'scrape_media'>>): Promise<TelegramChannel | null> {
    try {
      const response = await fetch('/api/dashboard/telegram-channels', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update channel: ${response.statusText}`);
      }

      const updatedChannel = await response.json();
      console.log('✅ Channel updated successfully:', updatedChannel);
      return updatedChannel;
    } catch (error) {
      console.error('❌ Error updating channel:', error);
      return null;
    }
  }

  // Method to fetch channels without real-time connection
  async fetchChannels(enabled?: string | null): Promise<TelegramChannelsData | null> {
    try {
      const params = new URLSearchParams();
      if (enabled !== null && enabled !== undefined) {
        params.set('enabled', enabled);
      }
      const url = `/api/dashboard/telegram-channels?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch channels: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching channels:', error);
      return null;
    }
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
export const telegramChannelsService = new TelegramChannelsService();

// Export for use in components
export default telegramChannelsService;
