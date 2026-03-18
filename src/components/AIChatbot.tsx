import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageSquare, SendHorizontal, RefreshCw } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'bot';
  content: string;
  image?: string;
}

export const AIChatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'bot', content: "Hello! I'm your Techtaire AI assistant. Checking WhatsApp connection..." }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [hasCheckedStartup, setHasCheckedStartup] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const checkWhatsAppStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp-server/status');
      const data = await res.json();
      setIsConnected(data.connected);
      return data.connected;
    } catch (err) {
      console.error("Status check failed", err);
      setIsConnected(false);
      return false;
    }
  };

  const fetchWhatsAppQR = async () => {
    try {
      const res = await fetch('/api/whatsapp-server/qr');
      const data = await res.json();
      if (data.qr) {
        const qrData = data.qr.startsWith('data:') ? data.qr : `data:image/png;base64,${data.qr}`;
        return qrData;
      }
      return null;
    } catch (err) {
      console.error("QR fetch failed", err);
      return null;
    }
  };

  const handleStartup = async () => {
    if (hasCheckedStartup) return;
    setHasCheckedStartup(true);
    setIsChatLoading(true);

    const connected = await checkWhatsAppStatus();
    if (connected) {
      setChatMessages(prev => [
        ...prev,
        { role: 'bot', content: "✅ WhatsApp Connected and Ready!" }
      ]);
    } else {
      const qr = await fetchWhatsAppQR();
      setChatMessages(prev => [
        ...prev,
        { 
          role: 'bot', 
          content: "⚠️ WhatsApp is disconnected. Please scan this QR code to reconnect:",
          image: qr || undefined
        }
      ]);
    }
    setIsChatLoading(false);
  };

  useEffect(() => {
    if (isChatOpen && !hasCheckedStartup) {
      handleStartup();
    }
  }, [isChatOpen]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Always check status before processing command
      const connected = await checkWhatsAppStatus();
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const tools = [
        {
          functionDeclarations: [
            {
              name: "checkStatus",
              description: "Check if the WhatsApp server is connected and ready to send messages.",
              parameters: { type: Type.OBJECT, properties: {} }
            },
            {
              name: "sendWhatsAppMessage",
              description: "Send a WhatsApp message to a single phone number.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  phone: { type: Type.STRING, description: "The recipient's phone number in international format (e.g., 919876543210)." },
                  message: { type: Type.STRING, description: "The message content to send." }
                },
                required: ["phone", "message"]
              }
            },
            {
              name: "sendBulkWhatsAppMessages",
              description: "Send a WhatsApp message to multiple phone numbers.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  phones: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "An array of recipient phone numbers." 
                  },
                  message: { type: Type.STRING, description: "The message content to send to all recipients." }
                },
                required: ["phones", "message"]
              }
            }
          ]
        }
      ];

      const model = "gemini-3-flash-preview";
      const systemInstruction = `You are a WhatsApp automation assistant connected to a live WhatsApp server.
      
      Server Base URL: https://techtaire-server-production-ad0b.up.railway.app
      
      RULES:
      - Always verify connection before sending any message using checkStatus.
      - If disconnected (connected = false), inform the user and ask them to scan the QR code (which will be automatically displayed if you return a message about disconnection).
      - Never proceed with sending if connected = false.
      - Keep responses concise, professional, and helpful.
      - You can send single or bulk messages.
      
      Current WhatsApp Connection Status: ${connected ? 'Connected' : 'Disconnected'}`;

      let response = await ai.models.generateContent({
        model,
        contents: [
          ...chatMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction,
          tools
        }
      });

      // Handle function calls
      const functionCalls = response.functionCalls;
      if (functionCalls) {
        const functionResponses = [];
        for (const call of functionCalls) {
          if (call.name === "checkStatus") {
            const status = await checkWhatsAppStatus();
            functionResponses.push({
              name: "checkStatus",
              response: { connected: status }
            });
          } else if (call.name === "sendWhatsAppMessage") {
            const { phone, message } = call.args as any;
            const status = await checkWhatsAppStatus();
            if (!status) {
              functionResponses.push({
                name: "sendWhatsAppMessage",
                response: { error: "WhatsApp is disconnected. Cannot send message." }
              });
            } else {
              try {
                const res = await fetch('/api/whatsapp-server/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ phone, message })
                });
                const data = await res.json();
                functionResponses.push({
                  name: "sendWhatsAppMessage",
                  response: data
                });
              } catch (err) {
                functionResponses.push({
                  name: "sendWhatsAppMessage",
                  response: { error: "Failed to send message via proxy." }
                });
              }
            }
          } else if (call.name === "sendBulkWhatsAppMessages") {
            const { phones, message } = call.args as any;
            const status = await checkWhatsAppStatus();
            if (!status) {
              functionResponses.push({
                name: "sendBulkWhatsAppMessages",
                response: { error: "WhatsApp is disconnected. Cannot send bulk messages." }
              });
            } else {
              try {
                const res = await fetch('/api/whatsapp-server/bulk-send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ phones, message })
                });
                const data = await res.json();
                functionResponses.push({
                  name: "sendBulkWhatsAppMessages",
                  response: data
                });
              } catch (err) {
                functionResponses.push({
                  name: "sendBulkWhatsAppMessages",
                  response: { error: "Failed to send bulk messages via proxy." }
                });
              }
            }
          }
        }

        // Send function responses back to model
        response = await ai.models.generateContent({
          model,
          contents: [
            ...chatMessages.map(m => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }]
            })),
            { role: 'user', parts: [{ text: userMessage }] },
            { role: 'model', parts: response.candidates[0].content.parts },
            {
              role: 'user',
              parts: functionResponses.map(res => ({
                functionResponse: {
                  name: res.name,
                  response: res.response
                }
              }))
            }
          ],
          config: {
            systemInstruction,
            tools
          }
        });
      }
      
      const botResponse = response.text || "I've processed your request.";
      
      // If bot says it's disconnected, fetch QR and show it
      let qrImage = undefined;
      if (!connected || botResponse.toLowerCase().includes('disconnected') || botResponse.toLowerCase().includes('scan')) {
        const qr = await fetchWhatsAppQR();
        if (qr) qrImage = qr;
      }

      setChatMessages(prev => [...prev, { role: 'bot', content: botResponse, image: qrImage }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'bot', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="glass-panel w-96 h-[550px] mb-6 flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-deep-night/90 backdrop-blur-2xl border border-white/10"
          >
            <div className="bg-royal-purple p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <span className="text-white font-bold block leading-none">WhatsApp Assistant</span>
                  <span className="text-[10px] text-white/60 flex items-center gap-1 mt-1">
                    <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-emerald-500" : "bg-rose-500")} />
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setHasCheckedStartup(false);
                    handleStartup();
                  }} 
                  className="text-white/60 hover:text-white transition-colors"
                  title="Refresh Connection"
                >
                  <RefreshCw size={16} className={isChatLoading ? "animate-spin" : ""} />
                </button>
                <button onClick={() => setIsChatOpen(false)} className="text-white/60 hover:text-white"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex flex-col gap-2 max-w-[85%]",
                    msg.role === 'bot' ? "mr-auto" : "ml-auto"
                  )}
                >
                  <div 
                    className={cn(
                      "p-4 rounded-2xl text-sm",
                      msg.role === 'bot' 
                        ? "bg-white/5 rounded-tl-none text-soft-lavender/80" 
                        : "bg-royal-purple/20 rounded-tr-none text-white"
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.image && (
                    <div className="bg-white p-2 rounded-xl overflow-hidden shadow-lg">
                      <img src={msg.image} alt="WhatsApp QR Code" className="w-full h-auto" />
                      <p className="text-[10px] text-deep-night/60 text-center mt-2 font-bold uppercase tracking-widest">Scan to Connect</p>
                    </div>
                  )}
                </div>
              ))}
              {isChatLoading && (
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none text-sm text-soft-lavender/80 w-12 flex justify-center">
                  <motion.div 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ...
                  </motion.div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/5 flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a command (e.g., 'send hello to 919876543210')" 
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-amethyst" 
              />
              <button 
                type="submit"
                disabled={isChatLoading}
                className="p-2 bg-royal-purple text-white rounded-xl disabled:opacity-50"
              >
                <SendHorizontal size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-16 h-16 bg-royal-purple rounded-full flex items-center justify-center text-white shadow-2xl shadow-royal-purple/40 relative"
      >
        {isChatOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isChatOpen && (
          <motion.div 
            className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-deep-night"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    </div>
  );
};
