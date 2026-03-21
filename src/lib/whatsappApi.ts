import axios from 'axios';

const BASE_URL = "/api/whatsapp-server";

export async function startSession(userId: string) {
  const response = await axios.post(`${BASE_URL}/session/start`, { userId });
  return response.data;
}

export async function sendMessages(userId: string, messages: {number: string, message: string}[]) {
  const response = await axios.post(`${BASE_URL}/messages/send`, { userId, messages });
  return response.data;
}

export async function getStats(userId: string) {
  const response = await axios.get(`${BASE_URL}/messages/stats/${userId}`);
  return response.data;
}

export async function getStatus(userId: string) {
  const response = await axios.get(`${BASE_URL}/session/status/${userId}`);
  return response.data.status;
}

export async function logoutSession(userId: string) {
  const response = await axios.post(`${BASE_URL}/session/logout`, { userId });
  return response.data;
}

export const formatQrData = (qr: string) => {
  if (!qr) return null;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
};
