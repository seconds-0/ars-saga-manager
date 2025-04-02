/**
 * WebSocket client for real-time updates
 * With automatic reconnection and error handling
 */

class WebSocketClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      debug: false,
      ...options
    };
    
    this.socket = null;
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.messageHandlers = [];
    
    // Bind methods
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.reconnect = this.reconnect.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onError = this.onError.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.send = this.send.bind(this);
    this.addMessageHandler = this.addMessageHandler.bind(this);
    this.removeMessageHandler = this.removeMessageHandler.bind(this);
  }
  
  /**
   * Connect to the WebSocket server
   */
  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      this.log('WebSocket already connected or connecting');
      return;
    }
    
    this.isConnecting = true;
    
    try {
      this.log(`Connecting to WebSocket: ${this.url}`);
      this.socket = new WebSocket(this.url);
      
      this.socket.addEventListener('open', this.onOpen);
      this.socket.addEventListener('close', this.onClose);
      this.socket.addEventListener('error', this.onError);
      this.socket.addEventListener('message', this.onMessage);
    } catch (error) {
      this.log(`Error creating WebSocket: ${error.message}`);
      this.isConnecting = false;
      this.reconnect();
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (!this.socket) return;
    
    this.log('Disconnecting WebSocket');
    
    // Remove event listeners to prevent memory leaks
    this.socket.removeEventListener('open', this.onOpen);
    this.socket.removeEventListener('close', this.onClose);
    this.socket.removeEventListener('error', this.onError);
    this.socket.removeEventListener('message', this.onMessage);
    
    // Close the connection
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    
    this.socket = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }
  
  /**
   * Attempt to reconnect to the WebSocket server
   */
  reconnect() {
    if (this.isConnecting || this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
        this.log(`Maximum reconnect attempts (${this.options.maxReconnectAttempts}) reached. Giving up.`);
      }
      return;
    }
    
    this.reconnectAttempts++;
    
    this.log(`Reconnecting (attempt ${this.reconnectAttempts} of ${this.options.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect();
    }, this.options.reconnectInterval);
  }
  
  /**
   * Handle WebSocket open event
   */
  onOpen() {
    this.log('WebSocket connected');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }
  
  /**
   * Handle WebSocket close event
   * @param {CloseEvent} event - WebSocket close event
   */
  onClose(event) {
    this.log(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
    this.isConnecting = false;
    
    // Only reconnect if the close was not deliberate
    if (event.code !== 1000) {
      this.reconnect();
    }
  }
  
  /**
   * Handle WebSocket error event
   * @param {Event} event - WebSocket error event
   */
  onError(event) {
    // Don't log WebSocket connection errors to avoid console spam
    // The server endpoint probably doesn't exist, which is fine
    if (this.options.debug) {
      this.log('WebSocket error occurred');
    }
  }
  
  /**
   * Handle WebSocket message event
   * @param {MessageEvent} event - WebSocket message event
   */
  onMessage(event) {
    try {
      const data = JSON.parse(event.data);
      this.log(`Received message: ${JSON.stringify(data)}`);
      
      // Notify all registered message handlers
      this.messageHandlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          this.log(`Error in message handler: ${error.message}`);
        }
      });
    } catch (error) {
      this.log(`Error parsing message: ${error.message}`);
    }
  }
  
  /**
   * Send a message to the WebSocket server
   * @param {Object} data - Data to send
   * @returns {boolean} - Whether the message was sent successfully
   */
  send(data) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.log('Cannot send message: WebSocket is not connected');
      return false;
    }
    
    try {
      const message = JSON.stringify(data);
      this.socket.send(message);
      this.log(`Sent message: ${message}`);
      return true;
    } catch (error) {
      this.log(`Error sending message: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Add a message handler
   * @param {Function} handler - Function to call when a message is received
   */
  addMessageHandler(handler) {
    if (typeof handler !== 'function') {
      throw new Error('Message handler must be a function');
    }
    
    this.messageHandlers.push(handler);
  }
  
  /**
   * Remove a message handler
   * @param {Function} handler - Handler to remove
   */
  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }
  
  /**
   * Log a message if debugging is enabled
   * @param {string} message - Message to log
   */
  log(message) {
    if (this.options.debug) {
      console.log(`[WebSocketClient] ${message}`);
    }
  }
}

// Create a singleton instance with default settings
const defaultClient = new WebSocketClient('ws://localhost:3000/ws', { 
  debug: false,  // Don't show connection errors
  maxReconnectAttempts: 2
});

export default defaultClient;