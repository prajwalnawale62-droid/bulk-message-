import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageSquare, SendHorizontal } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

export const AIChatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
    { role: 'bot', content: "Hello! I'm your Techtaire AI assistant. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Create a new instance for each call to ensure the latest API key is used
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: 'user',
            parts: [{ text: `You are a helpful assistant for Teachtaire, a premium WhatsApp Bulk Messaging SaaS. 
            Teachtaire capabilities:
            - Bulk messaging to thousands of contacts.
            - AI-powered message enhancement.
            - Contact management (CSV import, groups, tags).
            - Campaign scheduling and tracking.
            - Advanced analytics (delivery rates, engagement).
            - Admin panel for user management.
            
            Your goals:
            - Help users send bulk messages effectively.
            - Suggest professional message templates.
            - Fix common sending errors.
            - Guide new users through the platform.
            - Answer system questions.
            - Provide marketing and campaign advice.
            - Suggest campaign improvements and contact segmentation.
            
            Keep responses concise, professional, and helpful.` }]
          },
          ...chatMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ]
      });
      
      const botResponse = response.text || "I'm sorry, I couldn't process that request.";
      setChatMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
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
            className="glass-panel w-80 h-[450px] mb-6 flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-deep-night/90 backdrop-blur-2xl border border-white/10"
          >
            <div className="bg-royal-purple p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className="text-white font-bold">AI Assistant</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/60 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-4 rounded-2xl text-sm max-w-[85%]",
                    msg.role === 'bot' 
                      ? "bg-white/5 rounded-tl-none text-soft-lavender/80 mr-auto" 
                      : "bg-royal-purple/20 rounded-tr-none text-white ml-auto"
                  )}
                >
                  {msg.content}
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
                placeholder="Type a message..." 
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
