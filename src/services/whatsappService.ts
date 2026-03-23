import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Server as SocketIOServer } from 'socket.io';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

const sessions = new Map<string, any>();
const stats = new Map<string, { sent: number, delivered: number, failed: number }>();

export const initWhatsAppService = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join', (userId: string) => {
      console.log(`Socket room joined: ${userId}`);
      socket.join(userId);
      
      // Send current status if session exists
      const session = sessions.get(userId);
      if (session) {
        io.to(userId).emit('session_status', { status: 'connected' });
      } else {
        io.to(userId).emit('session_status', { status: 'disconnected' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

export const startWhatsAppSession = async (userId: string, io: SocketIOServer) => {
  if (sessions.has(userId)) {
    return { success: true, message: 'Session already exists' };
  }

  const sessionDir = path.join(process.cwd(), 'whatsapp_sessions', userId);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }) as any,
    printQRInTerminal: false,
    auth: state,
    browser: ['Techtaire', 'Chrome', '1.0.0'],
  });

  console.log(`Session started for user: ${userId}`);

  sessions.set(userId, sock);
  if (!stats.has(userId)) {
    stats.set(userId, { sent: 0, delivered: 0, failed: 0 });
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(`QR generated`);
      console.log(`QR emitted to socket for room ${userId}`);
      io.to(userId).emit('qr', { qr });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== 401;
      console.log(`WhatsApp Disconnected for ${userId}. Reconnecting: ${shouldReconnect}`);
      
      sessions.delete(userId); // Always delete the old session object
      
      if (shouldReconnect) {
        startWhatsAppSession(userId, io);
      } else {
        io.to(userId).emit('disconnected');
        // Clean up session dir on logout
        if (fs.existsSync(sessionDir)) {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        }
      }
    } else if (connection === 'open') {
      console.log(`WhatsApp Connected for ${userId}`);
      io.to(userId).emit('connected');
    }
  });

  return { success: true, message: 'Session starting' };
};

export const getWhatsAppStatus = (userId: string) => {
  return sessions.has(userId) ? 'connected' : 'disconnected';
};

export const getWhatsAppStats = (userId: string) => {
  return stats.get(userId) || { sent: 0, delivered: 0, failed: 0 };
};

export const sendWhatsAppMessage = async (userId: string, to: string, message: string, mediaUrl?: string) => {
  const sock = sessions.get(userId);
  if (!sock) {
    throw new Error('WhatsApp session not found or not connected');
  }

  try {
    const jid = `${to}@s.whatsapp.net`;
    
    // Verify if number exists on WhatsApp
    const [result] = await sock.onWhatsApp(jid);
    if (!result || !result.exists) {
      throw new Error(`Number ${to} is not registered on WhatsApp`);
    }
    
    const actualJid = result.jid;
    
    if (mediaUrl) {
      if (mediaUrl.startsWith('data:')) {
        const mimeType = mediaUrl.split(';')[0].split(':')[1];
        const base64Data = mediaUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        if (mimeType.startsWith('video/')) {
          await sock.sendMessage(actualJid, { 
            video: buffer, 
            caption: message 
          });
        } else if (mimeType.startsWith('image/')) {
          await sock.sendMessage(actualJid, { 
            image: buffer, 
            caption: message 
          });
        } else {
          await sock.sendMessage(actualJid, { 
            document: buffer, 
            mimetype: mimeType,
            fileName: 'attachment',
            caption: message 
          });
        }
      } else {
        await sock.sendMessage(actualJid, { 
          image: { url: mediaUrl }, 
          caption: message 
        });
      }
    } else {
      await sock.sendMessage(actualJid, { text: message });
    }
    
    const userStats = stats.get(userId)!;
    userStats.sent++;
    userStats.delivered++; // Assuming delivered for now
    
    return { success: true };
  } catch (error) {
    const userStats = stats.get(userId)!;
    userStats.failed++;
    console.error(`Error sending message to ${to}:`, error);
    throw error;
  }
};

export const logoutWhatsAppSession = async (userId: string, io: SocketIOServer) => {
  const sock = sessions.get(userId);
  if (sock) {
    await sock.logout();
    sessions.delete(userId);
    io.to(userId).emit('disconnected');
    
    const sessionDir = path.join(process.cwd(), 'whatsapp_sessions', userId);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
  }
  return { success: true };
};
