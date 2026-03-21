import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Power } from 'lucide-react';
import { startSession, formatQrData } from '../lib/whatsappApi';
import { connectSocket, joinRoom, getSocket, disconnectSocket, onSocketEvent } from '../lib/socketManager';

interface WhatsAppConnectProps {
  userId: string;
}

const WhatsAppConnect: React.FC<WhatsAppConnectProps> = ({ userId }) => {
  const [status, setStatus] = useState<'loading' | 'qr' | 'connected' | 'disconnected' | 'error'>('loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initSession = async () => {
    setStatus('loading');
    setError(null);
    console.log('Initializing WhatsApp session for user:', userId);
    try {
      await startSession(userId);
      console.log('Session started successfully');
      connectSocket(userId);
      console.log('Socket connected');
      
      onSocketEvent('qr', (data: any) => {
        console.log('QR event received:', data);
        const qr = typeof data === 'string' ? data : data.qr;
        if (qr) {
          setQrCode(formatQrData(qr));
          setStatus('qr');
        } else {
          console.warn('QR data is empty/null');
        }
      });

      onSocketEvent('connected', () => {
        console.log('Connected event received');
        setStatus('connected');
        setQrCode(null);
        localStorage.setItem('techtaire_whatsapp_connected', 'true');
      });

      onSocketEvent('session_status', (data: any) => {
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
      });

      onSocketEvent('disconnected', () => {
        console.log('Disconnected event received');
        setStatus('disconnected');
        setQrCode(null);
        localStorage.setItem('techtaire_whatsapp_connected', 'false');
      });
      
      onSocketEvent('connect_error', (err: any) => {
        console.error('Socket connection error:', err);
        setError('Socket connection error.');
        setStatus('error');
      });
    } catch (err) {
      console.error('Failed to initialize WhatsApp session:', err);
      setError('Failed to initialize WhatsApp session.');
      setStatus('error');
    }
  };

  useEffect(() => {
    initSession();
    return () => {
      disconnectSocket();
    };
  }, [userId]);

  const handleDisconnect = async () => {
    // Implement logout logic if needed, or just disconnect
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
          <p className="text-soft-lavender/60 text-sm">Scan with WhatsApp → Linked Devices</p>
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
          <button onClick={initSession} className="btn-primary">Retry</button>
        </>
      )}
    </div>
  );
};

export default WhatsAppConnect;
