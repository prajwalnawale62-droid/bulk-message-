import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'https://techtaire1-production.up.railway.app';
let socket: Socket | null = null;

export const connectSocket = (userId?: string) => {
  if (!socket) {
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
