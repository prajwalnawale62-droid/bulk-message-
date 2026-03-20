const PROXY_URL = '/api/whatsapp/proxy';

export const getWhatsAppToken = async (userEmail: string) => {
  const userId = userEmail.replace(/[^a-zA-Z0-9]/g, '');
  const password = "techtaire123";
  try {
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        url: '/api/session/login',
        method: 'POST',
        body: { userId, password }
      })
    });
    if (res.ok) {
        const data = await res.json();
        return data.token;
    }
    throw new Error('Login failed');
  } catch (err: any) {
    console.log("Login failed, trying register...", err.message);
    try {
      const regRes = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: '/api/session/register',
          method: 'POST',
          body: { userId, password }
        })
      });
      if (regRes.ok) {
          const data = await regRes.json();
          return data.token;
      }
      throw new Error('Register failed');
    } catch (regErr: any) {
      console.error("Register failed:", regErr.message);
      throw regErr;
    }
  }
};

export const connectWhatsApp = async (token: string) => {
  try {
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: '/api/session/connect',
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error("connectWhatsApp error:", err.message);
    throw err;
  }
};

export const checkWhatsAppStatus = async (token: string) => {
  try {
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: '/api/session/status',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error("checkWhatsAppStatus error:", err.message);
    throw err;
  }
};

export const sendSingleMessage = async (token: string, phone: string, message: string) => {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: '/api/messages/send',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: { phone, message }
    })
  });
  if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
  }
  return await res.json();
};

export const sendBulkMessages = async (token: string, messages: {phone: string, message: string}[]) => {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: '/api/messages/send-bulk',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: { messages }
    })
  });
  if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
  }
  return await res.json();
};

export const getQueueStatus = async (token: string) => {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: '/api/messages/queue-status',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
  });
  if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
  }
  return await res.json();
};
