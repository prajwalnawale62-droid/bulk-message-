import axios from 'axios';

export function getBaseUrl() {
  if (typeof window === 'undefined') return '/api/whatsapp-server';
  
  const stored = localStorage.getItem('whatsapp_server_url');
  if (!stored) return '/api/whatsapp-server';

  // If running on AI Studio, always use relative URLs to avoid cross-environment issues
  if (window.location.hostname.includes('.run.app')) {
    console.warn("Ignoring whatsapp_server_url because app is running on AI Studio. Using relative URL.");
    return '/api/whatsapp-server';
  }

  // Ignore if it's localhost and we are not on localhost
  if (!window.location.hostname.includes('localhost') && stored.includes('localhost')) {
    console.warn("Ignoring localhost whatsapp_server_url because app is not running on localhost");
    return '/api/whatsapp-server';
  }

  // Ignore if it contains the current hostname
  if (stored.includes(window.location.hostname)) {
    console.warn("Ignoring whatsapp_server_url because it matches current hostname. Using relative URL.");
    return '/api/whatsapp-server';
  }

  const cleanUrl = stored.replace(/\/$/, '');
  if (cleanUrl.endsWith('/api/whatsapp-server')) {
    return cleanUrl;
  }
  return `${cleanUrl}/api/whatsapp-server`;
}

export async function startSession(userId: string) {
  const BASE_URL = getBaseUrl();
  console.log(`Calling startSession for ${userId} at ${BASE_URL}/session/start`);
  try {
    const response = await axios.post(`${BASE_URL}/session/start`, { userId }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    return response.data;
  } catch (error: any) {
    if (error.message === 'Network Error') {
      console.error('WhatsApp API Network Error: This usually means a CORS issue or the server is down. URL:', `${BASE_URL}/session/start`);
    }
    console.error('Error starting session:', error.response?.data || error.message);
    throw error;
  }
}

export async function sendMessages(userId: string, messages: {number: string, message: string}[], attachmentUrl?: string | null) {
  const BASE_URL = getBaseUrl();
  const payload: any = { 
    userId, 
    messages
  };
  
  if (attachmentUrl) {
    payload.mediaUrl = attachmentUrl;
  }

  try {
    const response = await axios.post(`${BASE_URL}/messages/send`, payload);
    return response.data;
  } catch (error: any) {
    console.error('Error sending messages:', error.response?.data || error.message);
    throw error;
  }
}

export async function getStats(userId: string) {
  const BASE_URL = getBaseUrl();
  try {
    const response = await axios.get(`${BASE_URL}/messages/stats/${encodeURIComponent(userId)}`);
    return response.data;
  } catch (error: any) {
    // If session not found, return empty stats instead of throwing
    if (error.response?.status === 404) {
      return { sent: 0, delivered: 0, failed: 0 };
    }
    console.error('Error getting stats:', error.response?.data || error.message);
    return { sent: 0, delivered: 0, failed: 0 };
  }
}

export async function getStatus(userId: string) {
  const BASE_URL = getBaseUrl();
  try {
    const response = await axios.get(`${BASE_URL}/session/status/${encodeURIComponent(userId)}`);
    return response.data.status;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return 'disconnected';
    }
    console.error('Error getting status:', error.response?.data || error.message);
    return 'error';
  }
}

export async function logoutSession(userId: string) {
  const BASE_URL = getBaseUrl();
  const response = await axios.post(`${BASE_URL}/session/logout`, { userId });
  return response.data;
}

export const formatQrData = (qr: string) => {
  if (!qr) return null;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
};
