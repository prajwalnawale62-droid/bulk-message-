import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Power, Smartphone } from 'lucide-react';
import { startSession, getStatus, logoutSession } from '../lib/whatsappApi';
import { QRCodeCanvas } from 'qrcode.react';
import { connectSocket, disconnectSocket, onSocketEvent, offSocketEvent } from '../lib/socketManager';

interface WhatsAppConnectProps {
  userId: string;
}

const WhatsAppConnect: React.FC<WhatsAppConnectProps> = ({ userId }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'qr' | 'connected' | 'disconnected' | 'error'>('idle');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const SERVER_URL = 'https://techtaire1-production.up.railway.app';

  const handleQr = useCallback((data: any) => {
    console.log('QR event received:', data);
    const qr = typeof data === 'string' ? data : data.qr;

    if (qr) {
      setStatus('qr');
      setQrCode(qr); // Store raw QR string
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

  const handleDisconnected = useCallback(() => {
    console.log('Disconnected event received');
    setStatus('disconnected');
    setQrCode(null);
    localStorage.setItem('techtaire_whatsapp_connected', 'false');
  }, []);

  const initializing = useRef(false);

  const initSession = async () => {
    if (!userId || userId === 'anonymous') {
      setError('Please log in to connect WhatsApp.');
      setStatus('error');
      return;
    }

    if (initializing.current) return;
    initializing.current = true;
    
    setStatus('loading');
    setError(null);
    console.log('Initializing WhatsApp session for user:', userId);

    try {
      // 1. Socket connect
      const socket = connectSocket(userId);
      console.log('Socket initialized via socketManager');

      // 2. Socket listeners
      onSocketEvent('qr', handleQr);
      onSocketEvent('connected', handleConnected);
      onSocketEvent('disconnected', handleDisconnected);

      // 3. Session start
      console.log('Starting session via API...');
      const result = await startSession(userId);
      
      // If the API returns the QR directly, use it
      if (result && result.qr) {
        handleQr(result.qr);
      }

    } catch (err: any) {
      console.error('Failed to initialize WhatsApp session:', err);
      setError(`Failed to initialize WhatsApp session: ${err.message}`);
      setStatus('error');
    } finally {
      initializing.current = false;
    }
  };

  const handleRefresh = () => {
    initSession();
  };

  useEffect(() => {
    let mounted = true;

    const checkStatus = async () => {
      if (!userId || userId === 'anonymous') return;
      
      try {
        const currentStatus = await getStatus(userId);
        if (!mounted) return;

        if (currentStatus === 'connected') {
          setStatus('connected');
          localStorage.setItem('techtaire_whatsapp_connected', 'true');
          
          // Connect socket to listen for disconnects
          connectSocket(userId);
          onSocketEvent('disconnected', handleDisconnected);
        } else {
          setStatus('idle');
          localStorage.setItem('techtaire_whatsapp_connected', 'false');
        }
      } catch (error) {
        console.error("Failed to get status on mount", error);
        if (mounted) {
          setStatus('idle');
        }
      }
    };

    checkStatus();

    return () => {
      mounted = false;
      offSocketEvent('qr', handleQr);
      offSocketEvent('connected', handleConnected);
      offSocketEvent('disconnected', handleDisconnected);
      disconnectSocket();
    };
  }, [userId, handleQr, handleConnected, handleDisconnected]);

  const handleDisconnect = async () => {
    try {
      await logoutSession(userId);
    } catch (err) {
      console.error('Failed to logout session on server', err);
    }
    disconnectSocket();
    setStatus('idle');
    localStorage.setItem('techtaire_whatsapp_connected', 'false');
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center space-y-4">
      {status === 'idle' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-amethyst/20 rounded-full flex items-center justify-center mx-auto text-amethyst">
            <Smartphone size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Connect WhatsApp</h3>
            <p className="text-soft-lavender/60 text-sm mt-2">Link your WhatsApp account to start sending messages.</p>
          </div>
          <button 
            onClick={initSession}
            className="btn-primary py-3 px-6 rounded-xl w-full flex items-center justify-center gap-2"
          >
            <Smartphone size={18} />
            Generate QR Code
          </button>
        </div>
      )}

      {status === 'disconnected' && (
        <div className="text-center space-y-4">
          <AlertCircle className="text-amber-500 mx-auto" size={48} />
          <p className="text-amber-500 font-bold">Disconnected. Reconnecting...</p>
        </div>
      )}

      {status === 'loading' && (
        <>
          <Loader2 className="animate-spin text-amethyst" size={48} />
          <p className="text-white font-bold">Generating QR Code...</p>
        </>
      )}

      {status === 'qr' && qrCode && (
        <>
          <div className="bg-white p-4 rounded-xl w-64 h-64 flex items-center justify-center">
            <QRCodeCanvas 
              value={qrCode} 
              size={224}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-soft-lavender/60 text-sm">
            Scan with WhatsApp → Linked Devices
          </p>
          <button onClick={handleRefresh} className="text-amethyst hover:underline text-sm flex items-center gap-1">
            <Loader2 size={14} className={initializing.current ? "animate-spin" : ""} />
            Refresh QR
          </button>
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
          <p className="text-red-500 font-bold text-center max-w-xs">{error}</p>

          <div className="flex gap-4">
            <button onClick={initSession} className="btn-primary">
              Retry
            </button>
            <button onClick={handleRefresh} className="btn-secondary">
              Refresh
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WhatsAppConnect;
