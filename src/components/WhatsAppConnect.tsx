import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Power, Smartphone } from 'lucide-react';
import { startSession, formatQrData, getStatus, logoutSession } from '../lib/whatsappApi';
import { connectSocket, joinRoom, disconnectSocket, onSocketEvent, offSocketEvent } from '../lib/socketManager';

interface WhatsAppConnectProps {
  userId: string;
}

const WhatsAppConnect: React.FC<WhatsAppConnectProps> = ({ userId }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'qr' | 'connected' | 'disconnected' | 'error'>('idle');
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
    if (!userId || userId === 'anonymous') {
      console.warn('Cannot initialize WhatsApp session: userId is invalid');
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
      // 1. Socket connect karo
      connectSocket(userId);
      console.log('Socket initialized');

      // 2. Room join karo
      joinRoom(userId);

      // 3. Socket listeners add karo (Remove old ones first to avoid duplicates)
      offSocketEvent('qr', handleQr);
      offSocketEvent('connected', handleConnected);
      offSocketEvent('session_status', handleSessionStatus);
      offSocketEvent('disconnected', handleDisconnected);
      offSocketEvent('connect_error', handleConnectError);

      onSocketEvent('qr', handleQr);
      onSocketEvent('connected', handleConnected);
      onSocketEvent('session_status', handleSessionStatus);
      onSocketEvent('disconnected', handleDisconnected);
      onSocketEvent('connect_error', handleConnectError);

      // 4. Session start karo
      console.log('Starting session via API...');
      try {
        const result = await startSession(userId);
        console.log('Session start API call completed:', result);
        
        // If the API returns the QR directly, use it
        if (result && result.qr) {
          handleQr(result.qr);
        }
      } catch (apiErr: any) {
        // If session is already starting, it might return 400, but we can still wait for QR
        console.warn('API startSession failed, but socket might still receive QR:', apiErr.message);
        if (apiErr.response?.status === 400 && apiErr.response?.data?.error?.includes('already')) {
          console.log('Session already starting, waiting for QR...');
        } else if (apiErr.response?.status === 429) {
          setError('Too many requests. Please wait a minute and try again.');
          setStatus('error');
          initializing.current = false;
          return;
        } else {
          // If it's a network error, we might still get QR via socket if backend started it
          if (apiErr.message === 'Network Error') {
            console.log('Network error on API, but socket might still work. Waiting...');
          } else {
            throw apiErr;
          }
        }
      }

    } catch (err: any) {
      console.error('Failed to initialize WhatsApp session:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a minute and try again.');
      } else if (err.response?.status === 404) {
        setError('WhatsApp server not found. Please check your configuration.');
      } else if (err.message === 'Network Error') {
        setError('Network Error: Could not connect to the WhatsApp server. This might be a CORS issue or the server is down.');
      } else {
        setError(`Failed to initialize WhatsApp session: ${errorMessage}`);
      }
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
          joinRoom(userId);
          
          offSocketEvent('session_status', handleSessionStatus);
          offSocketEvent('disconnected', handleDisconnected);
          onSocketEvent('session_status', handleSessionStatus);
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
      offSocketEvent('session_status', handleSessionStatus);
      offSocketEvent('disconnected', handleDisconnected);
      offSocketEvent('connect_error', handleConnectError);
    };
  }, [userId, handleQr, handleConnected, handleSessionStatus, handleDisconnected, handleConnectError]);

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
      {(status === 'idle' || status === 'disconnected') && (
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
