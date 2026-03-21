import axios from 'axios';

const WHATSAPP_SERVER_URL = 'https://techtaire1-production.up.railway.app';
const BASE_URL = typeof window !== 'undefined' && 
  (window.location.hostname.includes('localhost') || window.location.hostname.includes('run.app')) 
  ? "/api/whatsapp-server" 
  : WHATSAPP_SERVER_URL;

export async function startSession(userId: string) {
  try {
    const response = await axios.post(`${BASE_URL}/session/start`, { userId });
    return response.data;
  } catch (error: any) {
    console.error('Error starting session:', error.response?.data || error.message);
    throw error;
  }
}

export async function sendMessages(userId: string, messages: {number: string, message: string}[], attachmentUrl?: string | null) {
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
  try {
    const response = await axios.get(`${BASE_URL}/messages/stats/${userId}`);
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
  try {
    const response = await axios.get(`${BASE_URL}/session/status/${userId}`);
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
  const response = await axios.post(`${BASE_URL}/session/logout`, { userId });
  return response.data;
}

export const formatQrData = (qr: string) => {
  if (!qr) return null;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
};
