import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Power } from 'lucide-react';
import { startSession, formatQrData } from '../lib/whatsappApi';
import { connectSocket, joinRoom, disconnectSocket, onSocketEvent, offSocketEvent } from '../lib/socketManager';

interface WhatsAppConnectProps {
  userId: string;
}

const WhatsAppConnect: React.FC<WhatsAppConnectProps> = ({ userId }) => {
  const [status, setStatus] = useState<'loading' | 'qr' | 'connected' | 'disconnected' | 'error'>('loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQr = useCallback((data: any) => {
    console.log('QR event received:', data);
    const qr = typeof data === 'string' ? data : data.qr;

    if (qr) {
      setQrCode(formatQrData(qr));
      setStatus('qr');
    } else {
      console.warn('QR data is empty/null');
    }
  }, []);

  const handleConnected = useCallback(() => {
    console.log('Connected event received');
    setStatus('connected');
    setQrCode(null);
    localStorage.setItem('techtaire_whatsapp_connected', 'true');
  }, []);

  const handleSessionStatus = useCallback((data: any) => {
    console.log('Session status event received:', data);
    if (data.status === 'connected') {
      setStatus('connected');
      setQrCode(null);
      localStorage.setItem('techtaire_whatsapp_connected', 'true');
    } else if (data.status === 'disconnected') {
      setStatus('disconnected');
      setQrCode(null);
      localStorage.setItem('techtaire_whatsapp_connected', 'false');
    }
  }, []);

  const handleDisconnected = useCallback(() => {
    console.log('Disconnected event received');
    setStatus('disconnected');
    setQrCode(null);
    localStorage.setItem('techtaire_whatsapp_connected', 'false');
  }, []);

  const handleConnectError = useCallback((err: any) => {
    console.error('Socket connection error:', err);
    setError('Socket connection error. Please check your internet.');
    setStatus('error');
  }, []);

  const initializing = useRef(false);

  const initSession = async () => {
    if (initializing.current) return;
    initializing.current = true;
    
    setStatus('loading');
    setError(null);
    console.log('Initializing WhatsApp session for user:', userId);

    try {
      // 1. Socket connect karo
      connectSocket(userId);
      console.log('Socket initialized');

      // 2. Room join karo
      joinRoom(userId);

      // 3. Socket listeners add karo
      onSocketEvent('qr', handleQr);
      onSocketEvent('connected', handleConnected);
      onSocketEvent('session_status', handleSessionStatus);
      onSocketEvent('disconnected', handleDisconnected);
      onSocketEvent('connect_error', handleConnectError);

      // 4. Session start karo
      console.log('Starting session via API...');
      await startSession(userId);
      console.log('Session start API call completed');

    } catch (err: any) {
      console.error('Failed to initialize WhatsApp session:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a minute and try again.');
      } else if (err.response?.status === 404) {
        setError('WhatsApp server not found. Please check your configuration.');
      } else {
        setError(`Failed to initialize WhatsApp session: ${errorMessage}`);
      }
      setStatus('error');
    } finally {
      initializing.current = false;
    }
  };

  useEffect(() => {
    initSession();

    return () => {
      offSocketEvent('qr', handleQr);
      offSocketEvent('connected', handleConnected);
      offSocketEvent('session_status', handleSessionStatus);
      offSocketEvent('disconnected', handleDisconnected);
      offSocketEvent('connect_error', handleConnectError);
    };
  }, [userId, handleQr, handleConnected, handleSessionStatus, handleDisconnected, handleConnectError]);

  const handleDisconnect = async () => {
    disconnectSocket();
    setStatus('disconnected');
    localStorage.setItem('techtaire_whatsapp_connected', 'false');
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center space-y-4">
      {status === 'loading' && (
        <>
          <Loader2 className="animate-spin text-amethyst" size={48} />
          <p className="text-white font-bold">Generating QR Code...</p>
        </>
      )}

      {status === 'qr' && qrCode && (
        <>
          <div className="bg-white p-2 rounded-xl">
            <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
          </div>
          <p className="text-soft-lavender/60 text-sm">
            Scan with WhatsApp → Linked Devices
          </p>
        </>
      )}

      {status === 'connected' && (
        <>
          <CheckCircle2 className="text-emerald-500" size={48} />
          <p className="text-emerald-500 font-bold">WhatsApp Connected!</p>

          <button onClick={handleDisconnect} className="btn-danger flex items-center gap-2">
            <Power size={16} /> Disconnect
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertCircle className="text-red-500" size={48} />
          <p className="text-red-500 font-bold">{error}</p>

          <button onClick={initSession} className="btn-primary">
            Retry
          </button>
        </>
      )}
    </div>
  );
};

export default WhatsAppConnect;
