export class RealTimeService {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isInitialized = false;
  private isReconnecting = false;

  constructor() {
    // Don't initialize during SSR
    if (typeof window !== 'undefined') {
      this.initializeEventSource();
    }
  }

  private initializeEventSource() {
    if (this.isInitialized) return;
    
    try {
      // Create EventSource for real-time updates
      this.eventSource = new EventSource('/api/real-time/events');
      
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data.type, data.payload);
        } catch (error) {
          console.error('Error parsing real-time event:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        // Reconnect after 5 seconds
        setTimeout(() => this.initializeEventSource(), 5000);
      };

      this.eventSource.onopen = () => {
        console.log('Real-time connection established');
        this.isInitialized = true;
      };
    } catch (error) {
      console.error('Failed to initialize EventSource:', error);
    }
  }

  public subscribe(eventType: string, callback: (data: any) => void): () => void {
    // Ensure service is initialized on client side
    if (typeof window !== 'undefined' && !this.isInitialized && !this.isReconnecting) {
      this.initializeEventSource();
    }
    
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  private notifyListeners(eventType: string, data: any) {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in real-time callback:', error);
        }
      });
    }
  }

  public disconnect() {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (error) {
        console.error('Error closing EventSource:', error);
      }
      this.eventSource = null;
      this.isInitialized = false;
      this.isReconnecting = false;
    }
  }

  public isConnected(): boolean {
    return this.isInitialized && this.eventSource !== null;
  }
}

// Create a singleton instance only on client side
let _realTimeServiceInstance: RealTimeService | null = null;

export const getRealTimeService = () => {
  if (typeof window !== 'undefined' && !_realTimeServiceInstance) {
    _realTimeServiceInstance = new RealTimeService();
  }
  return _realTimeServiceInstance;
};

// For backward compatibility
export const realTimeService = getRealTimeService();
