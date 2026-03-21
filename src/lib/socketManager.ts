import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'https://techtaire1-production.up.railway.app';
let socket: Socket | null = null;

export const connectSocket = (userId?: string) => {
  if (!socket) {
    console.log('Connecting socket to', SERVER_URL);
    socket = io(SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });
    socket.on('connect', () => {
      console.log('Socket connected');
      if (userId) {
        joinRoom(userId);
      }
    });
    socket.on('connect_error', (err) => console.error('Socket connection error:', err));
  } else if (userId) {
    joinRoom(userId);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (userId: string) => {
  if (socket) {
    console.log('Joining room for userId:', userId);
    socket.emit('join', userId);
  }
};

export const getSocket = () => socket;

export const onSocketEvent = (event: string, callback: (data: any) => void) => {
  if (socket) {
    socket.on(event, callback);
  }
};
