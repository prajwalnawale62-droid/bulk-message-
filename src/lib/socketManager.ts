import { io, Socket } from 'socket.io-client';

export const getServerUrl = () => {
  if (typeof window === 'undefined') return '';
  
  const stored = localStorage.getItem('whatsapp_server_url');
  if (!stored) return window.location.origin;

  // If running on AI Studio, always use relative URLs to avoid cross-environment issues
  // Unless explicitly overridden by the user
  if (window.location.hostname.includes('.run.app') && !stored.includes('railway.app')) {
    console.warn("Ignoring whatsapp_server_url because app is running on AI Studio. Using relative URL.");
    return window.location.origin;
  }

  // Ignore if it's localhost and we are not on localhost
  if (!window.location.hostname.includes('localhost') && stored.includes('localhost')) {
    console.warn("Ignoring localhost whatsapp_server_url because app is not running on localhost");
    return window.location.origin;
  }

  // Ignore if it contains the current hostname
  if (stored.includes(window.location.hostname)) {
    console.warn("Ignoring whatsapp_server_url because it matches current hostname. Using relative URL.");
    return window.location.origin;
  }

  const cleanUrl = stored.replace(/\/$/, '');
  
  // If the user provided a full URL, use it directly
  if (cleanUrl.startsWith('http')) {
    return cleanUrl;
  }

  if (cleanUrl.endsWith('/api/whatsapp-server')) {
    return cleanUrl.replace('/api/whatsapp-server', '');
  }
  return cleanUrl;
};

let socket: Socket | null = null;

export const connectSocket = (userId?: string) => {
  if (!socket) {
    const SERVER_URL = getServerUrl();
    console.log('Connecting socket to', SERVER_URL);
    socket = io(SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'], // Allow polling as fallback
    });

    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket?.id);
      if (userId) {
        joinRoom(userId);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  } else {
    // If already connected or connecting, and we have a userId, join the room
    if (userId) {
      if (socket.connected) {
        joinRoom(userId);
      } else {
        // If not yet connected, the 'connect' listener above will handle it
        // but we can also add a one-time listener just in case
        socket.once('connect', () => joinRoom(userId));
      }
    }
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting socket');
    socket.off(); // Remove all listeners
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (userId: string) => {
  if (socket && socket.connected) {
    console.log('Emitting join for userId:', userId);
    socket.emit('join', userId);
  } else if (socket) {
    console.log('Socket not connected, buffering join for userId:', userId);
    socket.once('connect', () => {
      socket?.emit('join', userId);
    });
  }
};

export const getSocket = () => socket;

export const onSocketEvent = (event: string, callback: (data: any) => void) => {
  if (socket) {
    socket.on(event, callback);
  }
};

export const offSocketEvent = (event: string, callback?: (data: any) => void) => {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }
};
