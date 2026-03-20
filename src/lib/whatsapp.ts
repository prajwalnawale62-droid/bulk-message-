import { io } from 'socket.io-client';
const SERVER = 'https://techtaire-server-production.up.railway.app';

export async function getOrCreateToken(userEmail: string): Promise<string> {
  const stored = localStorage.getItem('wa_token_' + userEmail);
  if (stored) return stored;
  let res = await fetch(`${SERVER}/api/session/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: userEmail, password: 'techtaire123' })
  });
  if (!res.ok) {
    res = await fetch(`${SERVER}/api/session/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userEmail, password: 'techtaire123' })
    });
  }
  const data = await res.json();
  localStorage.setItem('wa_token_' + userEmail, data.token);
  return data.token;
}

export async function connectWhatsApp(userEmail: string): Promise<void> {
  const token = await getOrCreateToken(userEmail);
  await fetch(`${SERVER}/api/session/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
}

export async function getStatus(userEmail: string): Promise<string> {
  const token = await getOrCreateToken(userEmail);
  const res = await fetch(`${SERVER}/api/session/status`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return data.status;
}

export function listenForQR(userEmail: string, onQR: (qr: string) => void, onConnected: () => void) {
  const socket = io(SERVER, { transports: ['websocket'] });
  socket.emit('register', userEmail);
  socket.on('qr', (data: any) => onQR(data.qr));
  socket.on('session_status', (data: any) => {
    if (data.status === 'connected') onConnected();
  });
  return socket;
}

export async function sendMessage(userEmail: string, phone: string, message: string) {
  const token = await getOrCreateToken(userEmail);
  const res = await fetch(`${SERVER}/api/messages/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ phone: phone.replace(/\D/g, ''), message })
  });
  return res.json();
}

export async function sendBulk(userEmail: string, phones: string[], message: string) {
  const token = await getOrCreateToken(userEmail);
  const messages = phones.map(phone => ({ phone: phone.replace(/\D/g, ''), message }));
  const res = await fetch(`${SERVER}/api/messages/send-bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ messages })
  });
  return res.json();
}
